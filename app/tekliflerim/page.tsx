import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionProfile } from "@/lib/auth";
import { getMyQuoteRequests, type QuoteRequest } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { categoryLabel, formatPrice } from "@/lib/constants";
import { elapsedMinutes, formatDuration } from "@/lib/response-time";
import { closeLead } from "@/app/actions/leads";
import { VENUE_BLUR } from "@/lib/image-placeholder";

export const metadata: Metadata = {
  title: "Tekliflerim",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function MyQuotesPage() {
  if (!isSupabaseConfigured()) redirect("/mekanlar");

  const session = await getSessionProfile();
  if (!session) redirect("/giris");

  const requests = await getMyQuoteRequests();
  const open = requests.filter((r) => r.status !== "closed");
  const closed = requests.filter((r) => r.status === "closed");

  const responded = open.filter((r) => r.responded_at);
  const waiting = open.filter((r) => !r.responded_at);

  // Teklif veren mekanlar arasında en ucuzu — karşılaştırmanın asıl sorusu
  const quoted = responded.filter((r) => r.quoted_price !== null);
  const bestPrice =
    quoted.length > 1
      ? Math.min(...quoted.map((r) => Number(r.quoted_price)))
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:pt-36">
      <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
        Tekliflerim
      </span>
      <h1 className="mt-4 font-display text-fluid-title font-semibold text-ink">
        Gelen teklifler
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Mekanlara gönderdiğiniz talepler ve dönen fiyatlar. Yanıtlar geldikçe
        burada birikir; karşılaştırıp karar verebilirsiniz.
      </p>

      {requests.length === 0 ? (
        <div className="mt-10 rounded-[1.75rem] border border-dashed border-mute/40 bg-parchment/60 p-12 text-center">
          <p className="font-display text-xl font-semibold text-ink">
            Henüz teklif isteğiniz yok
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Beğendiğiniz mekanları favorilerinize ekleyin, hepsine tek seferde
            teklif isteği gönderin.
          </p>
          <Link
            href="/mekanlar"
            className="mt-6 inline-flex rounded-full bg-bordeaux px-6 py-3 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-bordeaux-deep"
          >
            Mekanları Keşfet
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: "Gönderilen", value: open.length },
              { label: "Yanıtlanan", value: responded.length },
              { label: "Bekleyen", value: waiting.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-hairline bg-parchment px-5 py-4"
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

          {responded.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-ink">
                Yanıtlayanlar ({responded.length})
              </h2>
              <div className="mt-6 flex flex-col gap-4">
                {responded.map((request) => (
                  <QuoteCard
                    key={request.id}
                    request={request}
                    isBestPrice={
                      bestPrice !== null &&
                      Number(request.quoted_price) === bestPrice
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {waiting.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-ink">
                Yanıt bekleyenler ({waiting.length})
              </h2>
              <div className="mt-6 flex flex-col gap-4">
                {waiting.map((request) => (
                  <QuoteCard key={request.id} request={request} />
                ))}
              </div>
            </section>
          )}

          {closed.length > 0 && (
            <details className="mt-12">
              <summary className="cursor-pointer font-display text-lg font-semibold text-mute hover:text-ink">
                Kapatılan talepler ({closed.length})
              </summary>
              <div className="mt-5 flex flex-col gap-3">
                {closed.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-parchment/60 px-5 py-3"
                  >
                    <span className="text-sm text-mute">
                      {request.venue?.name ?? "Mekan kaldırılmış"}
                    </span>
                    <span className="text-xs text-mute">
                      {new Date(request.created_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}

function QuoteCard({
  request,
  isBestPrice = false,
}: {
  request: QuoteRequest;
  isBestPrice?: boolean;
}) {
  const venue = request.venue;
  const cover = venue?.photos?.find((p) => p.is_cover) ?? venue?.photos?.[0];
  const answered = Boolean(request.responded_at);

  const waitMinutes = elapsedMinutes(request.created_at, request.responded_at);

  return (
    <article
      className={`rounded-[1.75rem] border bg-parchment p-5 shadow-float ${
        isBestPrice ? "border-sage/50" : "border-hairline"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-2xl bg-cream-deep sm:h-20 sm:w-28">
          {cover && (
            <Image
              src={cover.url}
              alt={venue?.name ?? ""}
              fill
              sizes="112px"
              placeholder="blur"
              blurDataURL={VENUE_BLUR}
              className="object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            {venue ? (
              <Link
                href={`/mekan/${venue.slug}`}
                className="font-display text-lg font-semibold text-ink hover:text-bordeaux"
              >
                {venue.name}
              </Link>
            ) : (
              <span className="font-display text-lg font-semibold text-mute">
                Mekan kaldırılmış
              </span>
            )}
            {venue && (
              <span className="text-xs text-mute">
                {venue.district ? `${venue.district}, ` : ""}
                {venue.city}
              </span>
            )}
            {isBestPrice && (
              <span className="rounded-full bg-sage/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-sage">
                En uygun teklif
              </span>
            )}
            {request.kind === "callback" && (
              <span className="rounded-full border border-hairline px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-mute">
                Geri arama
              </span>
            )}
          </div>

          <p className="mt-1.5 text-xs text-mute">
            {new Date(request.created_at).toLocaleDateString("tr-TR")} tarihinde
            gönderildi
            {request.category ? ` · ${categoryLabel(request.category)}` : ""}
            {request.event_date
              ? ` · ${new Date(request.event_date).toLocaleDateString("tr-TR")}`
              : ""}
            {request.guest_count ? ` · ${request.guest_count} kişi` : ""}
          </p>

          {answered ? (
            <div className="mt-4 rounded-2xl bg-cream px-4 py-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-mute">
                  Mekanın yanıtı
                </span>
                {waitMinutes !== null && (
                  <span className="text-[11px] text-mute">
                    {formatDuration(waitMinutes)} içinde yanıtladı
                  </span>
                )}
              </div>

              {request.quoted_price !== null ? (
                <p className="mt-1.5 font-display text-2xl font-semibold text-bordeaux">
                  {formatPrice(Number(request.quoted_price))} ₺
                  <span className="ml-1.5 text-xs font-normal text-mute">
                    kişi başı
                  </span>
                </p>
              ) : (
                <p className="mt-1.5 text-sm text-ink-soft">
                  Fiyat belirtilmedi, mekan sizinle iletişime geçecek.
                </p>
              )}

              {request.owner_note && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                  {request.owner_note}
                </p>
              )}

              {venue?.phone && (
                <a
                  href={`tel:${venue.phone.replace(/\s/g, "")}`}
                  className="mt-3 inline-flex rounded-full bg-ink px-4 py-2 text-xs font-medium text-cream transition-colors duration-500 ease-lux hover:bg-ink-soft"
                >
                  {venue.phone}
                </a>
              )}
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-medium text-gold">
                Yanıt bekleniyor
              </span>
              {waitMinutes !== null && waitMinutes > 60 && (
                <span className="text-xs text-mute">
                  {formatDuration(waitMinutes)} önce gönderildi
                </span>
              )}
              {venue && (
                <span className="text-xs text-mute">
                  Liste fiyatı: {formatPrice(venue.price_min)}–
                  {formatPrice(venue.price_max)} ₺
                </span>
              )}
            </div>
          )}
        </div>

        <form action={closeLead} className="shrink-0 self-start">
          <input type="hidden" name="id" value={request.id} />
          <button
            type="submit"
            title="Bu talebi listeden kaldır"
            className="text-xs text-mute underline-offset-2 transition-colors hover:text-bordeaux hover:underline"
          >
            Kapat
          </button>
        </form>
      </div>
    </article>
  );
}
