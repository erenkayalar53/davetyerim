import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createOutreachAdminClient } from "./admin-client";
import { outreachConfig } from "./config";
import { findEmailForWebsite } from "./email-finder";
import { budget, sleep } from "./http";
import { toProspectRow } from "./normalize";
import { isResendConfigured, sendEmail } from "./resend";
import { configuredSources, getSource } from "./sources";
import { templateForStep } from "./templates";
import { unsubscribeUrl } from "./unsubscribe";
import type { OutreachMessage, Prospect, RunStats } from "./types";

const DISCOVER_CURSOR_KEY = "discover_cursor";

function emptyStats(): RunStats {
  return {
    discovered: 0,
    enriched: 0,
    emailsFound: 0,
    drafted: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    notes: [],
  };
}

/**
 * Cron'un tek çalıştırmada yaptığı iş.
 * Adımlar sırayla çalışır ve süre bütçesi dolunca yarıda kesilir —
 * bir sonraki çalıştırma kaldığı yerden devam eder (idempotent).
 */
export async function runOutreachCycle(options?: {
  steps?: Array<"discover" | "enrich" | "draft" | "send">;
}): Promise<RunStats> {
  const supabase = createOutreachAdminClient();
  const stats = emptyStats();
  const clock = budget(outreachConfig.runBudgetMs);

  const steps = options?.steps ?? ["discover", "enrich", "draft", "send"];

  const { data: run } = await supabase
    .from("outreach_runs")
    .insert({ stats: {} })
    .select("id")
    .single();

  try {
    if (steps.includes("discover") && !clock.exhausted()) {
      await stepDiscover(supabase, stats);
    }
    if (steps.includes("enrich") && !clock.exhausted()) {
      await stepEnrich(supabase, stats, clock);
    }
    if (steps.includes("draft") && !clock.exhausted()) {
      await stepDraft(supabase, stats);
    }
    if (steps.includes("send") && !clock.exhausted()) {
      await stepSend(supabase, stats, clock);
    }
  } catch (err) {
    stats.notes.push(`hata: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (run?.id) {
    await supabase
      .from("outreach_runs")
      .update({
        finished_at: new Date().toISOString(),
        stats: { ...stats, elapsedMs: clock.elapsed() },
        error: stats.notes.filter((n) => n.startsWith("hata")).join(" | "),
      })
      .eq("id", run.id);
  }

  return stats;
}

// ------------------------------------------------------------
// 1) Keşif — her çalıştırmada bir (şehir × arama terimi) çifti
// ------------------------------------------------------------
async function stepDiscover(supabase: SupabaseClient, stats: RunStats) {
  const source =
    getSource(outreachConfig.source) ?? configuredSources()[0] ?? null;

  if (!source) {
    stats.notes.push("keşif: yapılandırılmış kaynak yok");
    return;
  }
  if (!source.isConfigured()) {
    stats.notes.push(`keşif: ${source.label} yapılandırılmamış`);
    return;
  }

  const { city, term, next } = await readDiscoverCursor(supabase);

  const result = await source.discover({ city, term, limit: 20 });
  if (result.error) stats.notes.push(`keşif (${source.key}): ${result.error}`);

  if (result.prospects.length > 0) {
    const rows = result.prospects
      .map(toProspectRow)
      .filter((row) => row.name && row.dedupe_key !== "|");

    // Aynı sayfada aynı mekan iki kez gelebiliyor — upsert öncesi tekilleştir
    const unique = [...new Map(rows.map((r) => [r.dedupe_key, r])).values()];

    const { error, count } = await supabase
      .from("outreach_prospects")
      .upsert(unique, { onConflict: "dedupe_key", ignoreDuplicates: true, count: "exact" });

    if (error) stats.notes.push(`keşif kaydı: ${error.message}`);
    else stats.discovered += count ?? 0;
  }

  await supabase.from("outreach_state").upsert({
    key: DISCOVER_CURSOR_KEY,
    value: next,
    updated_at: new Date().toISOString(),
  });

  stats.notes.push(`keşif: ${city} / ${term}`);
}

async function readDiscoverCursor(supabase: SupabaseClient) {
  const cities = outreachConfig.cities;
  const terms = outreachConfig.searchTerms;

  const { data } = await supabase
    .from("outreach_state")
    .select("value")
    .eq("key", DISCOVER_CURSOR_KEY)
    .maybeSingle();

  const cursor = (data?.value ?? {}) as { cityIndex?: number; termIndex?: number };
  const cityIndex = (cursor.cityIndex ?? 0) % cities.length;
  const termIndex = (cursor.termIndex ?? 0) % terms.length;

  // Önce tüm şehirleri aynı terimle tara, sonra bir sonraki terime geç
  const nextCityIndex = (cityIndex + 1) % cities.length;
  const nextTermIndex =
    nextCityIndex === 0 ? (termIndex + 1) % terms.length : termIndex;

  return {
    city: cities[cityIndex],
    term: terms[termIndex],
    next: { cityIndex: nextCityIndex, termIndex: nextTermIndex },
  };
}

// ------------------------------------------------------------
// 2) Zenginleştirme — mekanın sitesinden e-posta çıkar
// ------------------------------------------------------------
async function stepEnrich(
  supabase: SupabaseClient,
  stats: RunStats,
  clock: ReturnType<typeof budget>
) {
  // Sitesi olmayanları kuyruktan düşür, yoksa sonsuza dek başa dönerler
  const { count: noSite } = await supabase
    .from("outreach_prospects")
    .update({ status: "no_email", last_error: "site-yok" }, { count: "exact" })
    .eq("status", "new")
    .eq("website", "");
  if (noSite) stats.skipped += noSite;

  const { data } = await supabase
    .from("outreach_prospects")
    .select("*")
    .eq("status", "new")
    .neq("website", "")
    .order("created_at", { ascending: true })
    .limit(outreachConfig.enrichPerRun);

  const prospects = (data as Prospect[]) ?? [];

  for (const prospect of prospects) {
    if (clock.exhausted()) {
      stats.notes.push("zenginleştirme: süre doldu, kalanı sonraki turda");
      break;
    }

    const result = await findEmailForWebsite(prospect.website);
    stats.enriched += 1;

    if (!result.email) {
      await supabase
        .from("outreach_prospects")
        .update({ status: "no_email", last_error: result.error })
        .eq("id", prospect.id);
      continue;
    }

    const suppressed = await isSuppressed(supabase, result.email);
    const duplicate = await emailAlreadyUsed(supabase, result.email, prospect.id);

    await supabase
      .from("outreach_prospects")
      .update({
        email: result.email,
        email_source: result.emailSource,
        email_confidence: result.confidence,
        phone: prospect.phone || result.phone,
        status: suppressed ? "unsubscribed" : duplicate ? "skipped" : "ready",
        last_error: duplicate ? "ayni-eposta-baska-kayitta" : "",
      })
      .eq("id", prospect.id);

    if (suppressed || duplicate) stats.skipped += 1;
    else stats.emailsFound += 1;
  }
}

// ------------------------------------------------------------
// 3) Taslak üretimi
// ------------------------------------------------------------
async function stepDraft(supabase: SupabaseClient, stats: RunStats) {
  const { data } = await supabase
    .from("outreach_prospects")
    .select("*")
    .eq("status", "ready")
    .neq("email", "")
    .order("email_confidence", { ascending: false })
    .limit(outreachConfig.draftPerRun);

  const prospects = (data as Prospect[]) ?? [];

  for (const prospect of prospects) {
    const step = prospect.contact_count + 1;
    const template = templateForStep(step);

    let rendered;
    try {
      rendered = template.render({
        prospect,
        unsubscribeUrl: unsubscribeUrl(prospect.id),
      });
    } catch (err) {
      stats.notes.push(
        `taslak: ${err instanceof Error ? err.message : String(err)}`
      );
      return; // imza anahtarı yoksa hepsi patlar, döngüyü sürdürmenin anlamı yok
    }

    const { error } = await supabase.from("outreach_messages").insert({
      prospect_id: prospect.id,
      template_key: template.key,
      step,
      to_email: prospect.email,
      subject: rendered.subject,
      body_text: rendered.text,
      body_html: rendered.html,
      status: "draft",
    });

    // Benzersiz indeks nedeniyle çakışma olursa mesaj zaten var demektir
    if (error && !error.message.includes("duplicate key")) {
      stats.notes.push(`taslak kaydı: ${error.message}`);
      continue;
    }

    await supabase
      .from("outreach_prospects")
      .update({ status: "drafted" })
      .eq("id", prospect.id);

    if (!error) stats.drafted += 1;
  }
}

// ------------------------------------------------------------
// 4) Gönderim — sadece onaylanmış mesajlar, kademeli
// ------------------------------------------------------------
async function stepSend(
  supabase: SupabaseClient,
  stats: RunStats,
  clock: ReturnType<typeof budget>
) {
  if (outreachConfig.dryRun) {
    stats.notes.push("gönderim: OUTREACH_DRY_RUN açık, mail gönderilmedi");
    return;
  }
  if (!isResendConfigured()) {
    stats.notes.push("gönderim: Resend yapılandırılmamış");
    return;
  }

  const now = new Date().toISOString();
  const { data } = await supabase
    .from("outreach_messages")
    .select("*")
    .eq("status", "approved")
    .or(`scheduled_at.is.null,scheduled_at.lte.${now}`)
    .order("approved_at", { ascending: true })
    .limit(outreachConfig.sendPerRun);

  const messages = (data as OutreachMessage[]) ?? [];

  for (const message of messages) {
    if (clock.exhausted()) {
      stats.notes.push("gönderim: süre doldu, kalanı sonraki turda");
      break;
    }

    // Onaydan sonra listeden çıkmış olabilir — son kontrol
    if (await isSuppressed(supabase, message.to_email)) {
      await supabase
        .from("outreach_messages")
        .update({ status: "canceled", error: "kara-listede" })
        .eq("id", message.id);
      stats.skipped += 1;
      continue;
    }

    // Aynı anda iki cron çalışırsa aynı mesaj iki kez gitmesin
    const { data: claimed } = await supabase
      .from("outreach_messages")
      .update({ status: "sending" })
      .eq("id", message.id)
      .eq("status", "approved")
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    const result = await sendEmail({
      to: message.to_email,
      subject: message.subject,
      text: message.body_text,
      html: message.body_html,
      unsubscribeUrl: unsubscribeUrl(message.prospect_id),
    });

    if (result.ok) {
      await supabase
        .from("outreach_messages")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          provider_id: result.id,
          error: "",
        })
        .eq("id", message.id);

      const { data: prospect } = await supabase
        .from("outreach_prospects")
        .select("contact_count")
        .eq("id", message.prospect_id)
        .maybeSingle();

      await supabase
        .from("outreach_prospects")
        .update({
          status: "contacted",
          contact_count: (prospect?.contact_count ?? 0) + 1,
          last_contacted_at: new Date().toISOString(),
        })
        .eq("id", message.prospect_id);

      await supabase.from("outreach_events").insert({
        message_id: message.id,
        prospect_id: message.prospect_id,
        type: "sent",
        payload: { provider_id: result.id },
      });

      stats.sent += 1;
    } else {
      await supabase
        .from("outreach_messages")
        .update({ status: "failed", error: result.error })
        .eq("id", message.id);

      if (result.permanentFailure) {
        await suppress(supabase, message.to_email, "bounced");
        await supabase
          .from("outreach_prospects")
          .update({ status: "bounced", last_error: result.error })
          .eq("id", message.prospect_id);
      }

      stats.failed += 1;
    }

    // Kademeli gönderim: art arda saniyeler içinde yığın atmak spam sinyalidir
    await sleep(1500);
  }
}

// ------------------------------------------------------------
// Yardımcılar
// ------------------------------------------------------------
export async function isSuppressed(
  supabase: SupabaseClient,
  email: string
): Promise<boolean> {
  if (!email) return true;
  const { data } = await supabase
    .from("outreach_suppression")
    .select("email")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return Boolean(data);
}

export async function suppress(
  supabase: SupabaseClient,
  email: string,
  reason: string
): Promise<void> {
  if (!email) return;
  await supabase
    .from("outreach_suppression")
    .upsert({ email: email.toLowerCase(), reason }, { onConflict: "email" });
}

/** Zincir mağazalarda aynı e-posta birden çok şubede çıkabiliyor. */
async function emailAlreadyUsed(
  supabase: SupabaseClient,
  email: string,
  exceptId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("outreach_prospects")
    .select("id")
    .eq("email", email.toLowerCase())
    .neq("id", exceptId)
    .limit(1);
  return (data?.length ?? 0) > 0;
}
