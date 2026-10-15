"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createOutreachAdminClient } from "@/lib/outreach/admin-client";
import { isOutreachConfigured } from "@/lib/outreach/config";
import { runOutreachCycle, suppress } from "@/lib/outreach/pipeline";
import { toProspectRow } from "@/lib/outreach/normalize";
import { toHtml } from "@/lib/outreach/templates";
import { unsubscribeUrl } from "@/lib/outreach/unsubscribe";
import type { RawProspect } from "@/lib/outreach/types";

/** Onaylanan mesajlar arasına konan varsayılan aralık (dakika). */
const SEND_SPACING_MINUTES = 4;

/**
 * Bir sonraki uygun gönderim zamanı: halihazırda planlanmış son mesajın
 * üstüne aralık ekler. Böylece toplu onay verilse de mailler tek tek çıkar.
 */
async function nextSlot(): Promise<string> {
  const supabase = createOutreachAdminClient();
  const { data } = await supabase
    .from("outreach_messages")
    .select("scheduled_at")
    .eq("status", "approved")
    .not("scheduled_at", "is", null)
    .order("scheduled_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = Date.now();
  const last = data?.scheduled_at ? new Date(data.scheduled_at).getTime() : 0;
  const base = Math.max(now, last);

  return new Date(base + SEND_SPACING_MINUTES * 60_000).toISOString();
}

async function requireAdmin(): Promise<string> {
  if (!isSupabaseConfigured()) throw new Error("Supabase yapılandırılmadı");
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "admin") {
    throw new Error("Bu işlem için admin yetkisi gerekli");
  }
  if (!isOutreachConfigured()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY tanımlı değil");
  }
  return session.user.id;
}

function revalidate() {
  revalidatePath("/admin/outreach");
}

export async function approveMessage(formData: FormData) {
  const adminId = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createOutreachAdminClient();
  await supabase
    .from("outreach_messages")
    .update({
      status: "approved",
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      scheduled_at: await nextSlot(),
      error: "",
    })
    .eq("id", id)
    .eq("status", "draft");

  revalidate();
}

export async function approveAllDrafts() {
  const adminId = await requireAdmin();
  const supabase = createOutreachAdminClient();

  const { data } = await supabase
    .from("outreach_messages")
    .select("id")
    .eq("status", "draft")
    .order("created_at", { ascending: true });

  const drafts = data ?? [];
  if (drafts.length === 0) return;

  let slot = new Date(await nextSlot());

  for (const draft of drafts) {
    await supabase
      .from("outreach_messages")
      .update({
        status: "approved",
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        scheduled_at: slot.toISOString(),
        error: "",
      })
      .eq("id", draft.id)
      .eq("status", "draft");

    slot = new Date(slot.getTime() + SEND_SPACING_MINUTES * 60_000);
  }

  revalidate();
}

export async function cancelMessage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createOutreachAdminClient();
  await supabase
    .from("outreach_messages")
    .update({ status: "canceled", error: "elle-iptal" })
    .eq("id", id)
    .in("status", ["draft", "approved", "failed"]);

  revalidate();
}

export async function updateMessage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const subject = String(formData.get("subject") ?? "").trim();
  const bodyText = String(formData.get("body_text") ?? "").trim();
  if (!id || !subject || !bodyText) return;

  const supabase = createOutreachAdminClient();

  const { data: message } = await supabase
    .from("outreach_messages")
    .select("prospect_id")
    .eq("id", id)
    .maybeSingle();
  if (!message) return;

  await supabase
    .from("outreach_messages")
    .update({
      subject,
      body_text: bodyText,
      // HTML sürümü metinden yeniden üretilir; ikisi ayrışırsa alıcı
      // istemcisine göre farklı mesaj görür.
      body_html: toHtml(bodyText, unsubscribeUrl(message.prospect_id)),
    })
    .eq("id", id)
    .eq("status", "draft");

  revalidate();
}

export async function skipProspect(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createOutreachAdminClient();
  await supabase
    .from("outreach_prospects")
    .update({ status: "skipped" })
    .eq("id", id);
  await supabase
    .from("outreach_messages")
    .update({ status: "canceled", error: "aday-atlandi" })
    .eq("prospect_id", id)
    .in("status", ["draft", "approved"]);

  revalidate();
}

export async function suppressProspect(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createOutreachAdminClient();
  const { data } = await supabase
    .from("outreach_prospects")
    .select("email")
    .eq("id", id)
    .maybeSingle();

  if (data?.email) await suppress(supabase, data.email, "manual");

  await supabase
    .from("outreach_prospects")
    .update({ status: "unsubscribed" })
    .eq("id", id);
  await supabase
    .from("outreach_messages")
    .update({ status: "canceled", error: "kara-listeye-alindi" })
    .eq("prospect_id", id)
    .in("status", ["draft", "approved"]);

  revalidate();
}

export async function markProspectStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["replied", "converted", "contacted"].includes(status)) return;

  const supabase = createOutreachAdminClient();
  await supabase.from("outreach_prospects").update({ status }).eq("id", id);
  revalidate();
}

/** Panelden elle bir tur çalıştır — cron'u beklemeden test etmek için. */
export async function runCycleNow(formData: FormData) {
  await requireAdmin();
  const raw = String(formData.get("steps") ?? "");
  const steps = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => ["discover", "enrich", "draft", "send"].includes(s)) as Array<
    "discover" | "enrich" | "draft" | "send"
  >;

  await runOutreachCycle(steps.length ? { steps } : undefined);
  revalidate();
}

/**
 * Elle liste girişi. Her satır: Ad;Şehir;Telefon;Website;E-posta
 * Ayırıcı olarak ; , veya sekme kabul edilir; ilk sütun dışındakiler isteğe bağlı.
 */
export async function importProspects(formData: FormData) {
  await requireAdmin();
  const raw = String(formData.get("rows") ?? "").trim();
  if (!raw) return;

  const prospects: RawProspect[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const cells = trimmed.split(/\t|;|,(?=\s*\S)/).map((c) => c.trim());
    const [name, city, phone, website, email] = cells;
    if (!name) continue;
    // Başlık satırını atla
    if (/^(ad|isim|name|mekan)$/i.test(name)) continue;

    prospects.push({
      source: "csv",
      name,
      city: city ?? "",
      phone: phone ?? "",
      website: website ?? "",
      email: email ?? "",
    });
  }

  if (prospects.length === 0) return;

  const rows = prospects.map(toProspectRow).filter((r) => r.name);
  const unique = [...new Map(rows.map((r) => [r.dedupe_key, r])).values()];

  const supabase = createOutreachAdminClient();
  await supabase
    .from("outreach_prospects")
    .upsert(unique, { onConflict: "dedupe_key", ignoreDuplicates: true });

  revalidate();
}
