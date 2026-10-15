import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createOutreachAdminClient } from "@/lib/outreach/admin-client";
import { isOutreachConfigured, outreachConfig } from "@/lib/outreach/config";
import { configuredSources, getSource } from "@/lib/outreach/sources";
import { isResendConfigured } from "@/lib/outreach/resend";
import type { OutreachMessage, Prospect } from "@/lib/outreach/types";
import {
  approveAllDrafts,
  approveMessage,
  cancelMessage,
  importProspects,
  markProspectStatus,
  runCycleNow,
  skipProspect,
  suppressProspect,
  updateMessage,
} from "@/app/actions/outreach";

export const metadata: Metadata = {
  title: "Mekan Erişim Otomasyonu",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  ready: "E-posta bulundu",
  no_email: "E-posta yok",
  drafted: "Taslak hazır",
  contacted: "Mesaj gönderildi",
  replied: "Yanıt geldi",
  converted: "Kaydoldu",
  bounced: "Ulaşılamadı",
  unsubscribed: "Listeden çıktı",
  skipped: "Atlandı",
};

export default async function OutreachPage() {
  if (!isSupabaseConfigured()) redirect("/panel");

  const session = await getSessionProfile();
  if (!session) redirect("/giris");
  if (session.profile.role !== "admin") redirect("/panel");

  if (!isOutreachConfigured()) {
    return <SetupNotice />;
  }

  const supabase = createOutreachAdminClient();

  const [
    { data: statusRows },
    { data: draftRows },
    { data: approvedRows },
    { data: prospectRows },
    { data: runRows },
    { count: suppressionCount },
  ] = await Promise.all([
    supabase.from("outreach_prospects").select("status"),
    supabase
      .from("outreach_messages")
      .select("*")
      .eq("status", "draft")
      .order("created_at", { ascending: true })
      .limit(30),
    supabase
      .from("outreach_messages")
      .select("*")
      .in("status", ["approved", "sending", "failed"])
      .order("scheduled_at", { ascending: true })
      .limit(30),
    supabase
      .from("outreach_prospects")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(60),
    supabase
      .from("outreach_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(5),
    supabase.from("outreach_suppression").select("*", { count: "exact", head: true }),
  ]);

  const counts = countByStatus((statusRows as { status: string }[]) ?? []);
  const drafts = (draftRows as OutreachMessage[]) ?? [];
  const scheduled = (approvedRows as OutreachMessage[]) ?? [];
  const prospects = (prospectRows as Prospect[]) ?? [];
  const runs = (runRows as { id: string; started_at: string; stats: Record<string, unknown>; error: string }[]) ?? [];

  const prospectById = new Map(prospects.map((p) => [p.id, p]));
  const activeSource = getSource(outreachConfig.source);
  const sourceReady = activeSource?.isConfigured() ?? false;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:pt-36">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
          Yönetim
        </span>
        <Link
          href="/admin"
          className="text-xs text-mute underline-offset-4 hover:text-bordeaux hover:underline"
        >
          ← Admin paneline dön
        </Link>
      </div>

      <h1 className="mt-4 font-display text-fluid-title font-semibold text-ink">
        Mekan Erişim Otomasyonu
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Sistem şehir şehir mekan arar, sitelerinden iletişim e-postasını çıkarır ve
        mesaj taslağı hazırlar. <strong className="text-ink">Hiçbir mail sizin
        onayınız olmadan gönderilmez.</strong>
      </p>

      {/* Sistem durumu */}
      <section className="mt-8 rounded-[1.5rem] border border-hairline bg-parchment p-5">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] text-mute">
          Sistem Durumu
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill
            ok={sourceReady}
            label={`Kaynak: ${activeSource?.label ?? outreachConfig.source}`}
            hint={sourceReady ? "hazır" : "API anahtarı yok"}
          />
          <StatusPill
            ok={isResendConfigured()}
            label="Resend"
            hint={isResendConfigured() ? outreachConfig.fromEmail : "anahtar yok"}
          />
          <StatusPill
            ok={Boolean(outreachConfig.cronSecret)}
            label="Cron"
            hint={outreachConfig.cronSecret ? "korumalı" : "CRON_SECRET yok"}
          />
          {outreachConfig.dryRun && (
            <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
              Deneme modu — mail gönderilmiyor
            </span>
          )}
          <span className="rounded-full border border-hairline px-3 py-1 text-xs text-mute">
            Kara liste: {suppressionCount ?? 0}
          </span>
        </div>

        {configuredSources().length === 0 && (
          <p className="mt-4 text-sm text-bordeaux">
            Hiçbir keşif kaynağı yapılandırılmamış. Google Places için
            <code className="mx-1 rounded bg-cream px-1.5 py-0.5 text-xs">GOOGLE_PLACES_API_KEY</code>
            ekleyin ya da aşağıdan elle liste girin.
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            { steps: "discover", label: "Mekan ara" },
            { steps: "enrich", label: "E-posta çıkar" },
            { steps: "draft", label: "Taslak üret" },
            { steps: "send", label: "Onaylıları gönder" },
            { steps: "", label: "Tam tur" },
          ].map((action) => (
            <form key={action.label} action={runCycleNow}>
              <input type="hidden" name="steps" value={action.steps} />
              <button
                type="submit"
                className="rounded-full border border-hairline bg-cream px-4 py-2 text-xs font-medium text-ink-soft transition-colors duration-500 ease-lux hover:border-bordeaux/40 hover:text-bordeaux"
              >
                {action.label}
              </button>
            </form>
          ))}
        </div>

        {runs.length > 0 && (
          <p className="mt-4 text-xs text-mute">
            Son çalıştırma: {new Date(runs[0].started_at).toLocaleString("tr-TR")} ·{" "}
            {summarizeRun(runs[0].stats)}
            {runs[0].error && (
              <span className="text-bordeaux"> · {runs[0].error}</span>
            )}
          </p>
        )}
      </section>

      {/* Özet */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Toplam Aday", value: sum(counts) },
          { label: "E-posta Bulundu", value: (counts.ready ?? 0) + (counts.drafted ?? 0) },
          { label: "Onay Bekleyen", value: drafts.length },
          { label: "Kuyrukta", value: scheduled.filter((m) => m.status === "approved").length },
          { label: "Gönderildi", value: counts.contacted ?? 0 },
          { label: "Yanıt", value: (counts.replied ?? 0) + (counts.converted ?? 0) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-hairline bg-parchment px-4 py-4"
          >
            <p className="font-display text-3xl font-semibold text-bordeaux">
              {stat.value}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-mute">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Onay kuyruğu */}
      <section className="mt-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Onay Kuyruğu ({drafts.length})
          </h2>
          {drafts.length > 0 && (
            <form action={approveAllDrafts}>
              <button
                type="submit"
                className="rounded-full bg-sage px-5 py-2.5 text-sm font-medium text-cream transition-opacity hover:opacity-90"
              >
                Tümünü onayla ve sıraya al
              </button>
            </form>
          )}
        </div>

        {drafts.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            Onay bekleyen taslak yok. “Taslak üret” ile yeni mesaj hazırlayabilirsiniz.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            {drafts.map((message) => {
              const prospect = prospectById.get(message.prospect_id);
              return (
                <article
                  key={message.id}
                  className="rounded-[1.75rem] border border-gold/30 bg-parchment p-5 shadow-float"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-ink">
                      {prospect?.name ?? "Bilinmeyen mekan"}
                      <span className="ml-2 text-sm font-normal text-mute">
                        {prospect?.city}
                      </span>
                    </h3>
                    <span className="text-xs text-mute">
                      {message.to_email}
                      {prospect ? ` · güven %${prospect.email_confidence}` : ""}
                      {message.step > 1 ? ` · ${message.step}. mesaj` : ""}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-ink">{message.subject}</p>
                  <pre className="mt-2 max-h-44 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-cream p-4 font-sans text-[13px] leading-relaxed text-ink-soft">
{message.body_text}
                  </pre>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <form action={approveMessage}>
                      <input type="hidden" name="id" value={message.id} />
                      <button
                        type="submit"
                        className="rounded-full bg-sage px-5 py-2.5 text-sm font-medium text-cream transition-opacity hover:opacity-90"
                      >
                        Onayla
                      </button>
                    </form>
                    <form action={cancelMessage}>
                      <input type="hidden" name="id" value={message.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-bordeaux/30 px-5 py-2.5 text-sm font-medium text-bordeaux transition-colors hover:bg-bordeaux/5"
                      >
                        İptal et
                      </button>
                    </form>
                    {prospect && (
                      <form action={suppressProspect}>
                        <input type="hidden" name="id" value={prospect.id} />
                        <button
                          type="submit"
                          className="text-xs text-mute underline-offset-2 hover:text-bordeaux hover:underline"
                        >
                          Kara listeye al
                        </button>
                      </form>
                    )}
                    {prospect?.website && (
                      <a
                        href={prospect.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-mute underline-offset-2 hover:text-bordeaux hover:underline"
                      >
                        Siteyi aç
                      </a>
                    )}
                  </div>

                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs text-mute hover:text-bordeaux">
                      Mesajı düzenle
                    </summary>
                    <form action={updateMessage} className="mt-3 flex flex-col gap-3">
                      <input type="hidden" name="id" value={message.id} />
                      <input
                        name="subject"
                        defaultValue={message.subject}
                        className="rounded-xl border border-hairline bg-cream px-4 py-2.5 text-sm text-ink"
                      />
                      <textarea
                        name="body_text"
                        defaultValue={message.body_text}
                        rows={14}
                        className="rounded-xl border border-hairline bg-cream px-4 py-3 font-sans text-[13px] leading-relaxed text-ink"
                      />
                      <button
                        type="submit"
                        className="self-start rounded-full border border-hairline px-5 py-2 text-sm text-ink-soft hover:border-bordeaux/40 hover:text-bordeaux"
                      >
                        Değişikliği kaydet
                      </button>
                    </form>
                  </details>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Gönderim kuyruğu */}
      {scheduled.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Gönderim Kuyruğu ({scheduled.length})
          </h2>
          <div className="mt-6 overflow-x-auto rounded-[1.75rem] border border-hairline bg-parchment shadow-float">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-[10px] uppercase tracking-[0.15em] text-mute">
                  <th className="px-5 py-4 font-medium">Alıcı</th>
                  <th className="px-5 py-4 font-medium">Konu</th>
                  <th className="px-5 py-4 font-medium">Planlanan</th>
                  <th className="px-5 py-4 font-medium">Durum</th>
                  <th className="px-5 py-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {scheduled.map((message) => (
                  <tr key={message.id} className="border-b border-hairline last:border-0">
                    <td className="px-5 py-3 text-ink">{message.to_email}</td>
                    <td className="px-5 py-3 text-ink-soft">{message.subject}</td>
                    <td className="px-5 py-3 text-mute">
                      {message.scheduled_at
                        ? new Date(message.scheduled_at).toLocaleString("tr-TR")
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          message.status === "failed"
                            ? "bg-bordeaux/10 text-bordeaux"
                            : message.status === "sending"
                              ? "bg-gold/15 text-gold"
                              : "bg-sage/15 text-sage"
                        }`}
                      >
                        {message.status === "failed"
                          ? "Başarısız"
                          : message.status === "sending"
                            ? "Gönderiliyor"
                            : "Sırada"}
                      </span>
                      {message.error && (
                        <span className="ml-2 text-[11px] text-mute">{message.error}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <form action={cancelMessage}>
                        <input type="hidden" name="id" value={message.id} />
                        <button
                          type="submit"
                          className="text-xs text-mute underline-offset-2 hover:text-bordeaux hover:underline"
                        >
                          İptal
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Elle liste girişi */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Elle Liste Ekle
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Her satıra bir mekan. Biçim:{" "}
          <code className="rounded bg-parchment px-1.5 py-0.5 text-xs">
            Ad;Şehir;Telefon;Website;E-posta
          </code>{" "}
          — ilk sütun dışındakiler boş bırakılabilir. E-posta boşsa sistem siteden
          kendisi bulmayı dener.
        </p>
        <form action={importProspects} className="mt-4 flex flex-col gap-3">
          <textarea
            name="rows"
            rows={6}
            placeholder={"Çınar Düğün Salonu;İstanbul;0212 000 00 00;https://cinardugun.com\nGül Bahçe Kır Düğünü;Bursa;;https://gulbahce.com.tr"}
            className="rounded-2xl border border-hairline bg-parchment px-4 py-3 font-sans text-[13px] leading-relaxed text-ink"
          />
          <button
            type="submit"
            className="self-start rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-ink-soft"
          >
            Listeye ekle
          </button>
        </form>
      </section>

      {/* Adaylar */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Son Adaylar
        </h2>
        <div className="mt-6 overflow-x-auto rounded-[1.75rem] border border-hairline bg-parchment shadow-float">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-[10px] uppercase tracking-[0.15em] text-mute">
                <th className="px-5 py-4 font-medium">Mekan</th>
                <th className="px-5 py-4 font-medium">Şehir</th>
                <th className="px-5 py-4 font-medium">E-posta</th>
                <th className="px-5 py-4 font-medium">Telefon</th>
                <th className="px-5 py-4 font-medium">Durum</th>
                <th className="px-5 py-4 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((prospect) => (
                <tr key={prospect.id} className="border-b border-hairline last:border-0">
                  <td className="px-5 py-3">
                    <span className="font-medium text-ink">{prospect.name}</span>
                    {prospect.website && (
                      <a
                        href={prospect.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-xs text-bordeaux hover:underline"
                      >
                        site
                      </a>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{prospect.city || "—"}</td>
                  <td className="px-5 py-3 text-ink-soft">
                    {prospect.email || (
                      <span className="text-mute">{prospect.last_error || "—"}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{prospect.phone || "—"}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full border border-hairline px-2.5 py-0.5 text-[11px] text-ink-soft">
                      {STATUS_LABELS[prospect.status] ?? prospect.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      {prospect.status === "contacted" && (
                        <form action={markProspectStatus}>
                          <input type="hidden" name="id" value={prospect.id} />
                          <input type="hidden" name="status" value="replied" />
                          <button
                            type="submit"
                            className="text-xs text-mute underline-offset-2 hover:text-sage hover:underline"
                          >
                            Yanıt geldi
                          </button>
                        </form>
                      )}
                      {prospect.status === "replied" && (
                        <form action={markProspectStatus}>
                          <input type="hidden" name="id" value={prospect.id} />
                          <input type="hidden" name="status" value="converted" />
                          <button
                            type="submit"
                            className="text-xs text-mute underline-offset-2 hover:text-sage hover:underline"
                          >
                            Kaydoldu
                          </button>
                        </form>
                      )}
                      <form action={skipProspect}>
                        <input type="hidden" name="id" value={prospect.id} />
                        <button
                          type="submit"
                          className="text-xs text-mute underline-offset-2 hover:text-bordeaux hover:underline"
                        >
                          Atla
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function countByStatus(rows: { status: string }[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});
}

function sum(counts: Record<string, number>): number {
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

function summarizeRun(stats: Record<string, unknown>): string {
  const parts: string[] = [];
  const labels: Record<string, string> = {
    discovered: "bulundu",
    emailsFound: "e-posta",
    drafted: "taslak",
    sent: "gönderildi",
    failed: "hata",
  };
  for (const [key, label] of Object.entries(labels)) {
    const value = stats[key];
    if (typeof value === "number" && value > 0) parts.push(`${value} ${label}`);
  }
  return parts.length > 0 ? parts.join(", ") : "değişiklik yok";
}

function StatusPill({
  ok,
  label,
  hint,
}: {
  ok: boolean;
  label: string;
  hint: string;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        ok
          ? "border-sage/40 bg-sage/10 text-sage"
          : "border-bordeaux/30 bg-bordeaux/5 text-bordeaux"
      }`}
    >
      {label} · {hint}
    </span>
  );
}

function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-32 sm:pt-36">
      <h1 className="font-display text-fluid-title font-semibold text-ink">
        Mekan Erişim Otomasyonu
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        Sistem henüz kurulmadı. Çalışması için Supabase’de{" "}
        <code className="rounded bg-parchment px-1.5 py-0.5 text-xs">
          supabase/migration-v8.sql
        </code>{" "}
        dosyasını çalıştırın ve ortam değişkenlerine{" "}
        <code className="rounded bg-parchment px-1.5 py-0.5 text-xs">
          SUPABASE_SERVICE_ROLE_KEY
        </code>{" "}
        ekleyin. Ayrıntılar için depodaki{" "}
        <code className="rounded bg-parchment px-1.5 py-0.5 text-xs">OUTREACH.md</code>{" "}
        dosyasına bakın.
      </p>
      <Link
        href="/admin"
        className="mt-8 inline-block rounded-full border border-hairline px-5 py-2.5 text-sm text-ink-soft hover:border-bordeaux/40 hover:text-bordeaux"
      >
        ← Admin paneline dön
      </Link>
    </div>
  );
}
