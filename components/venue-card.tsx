import Link from "next/link";
import Image from "next/image";
import type { Venue } from "@/lib/types";
import { venueTypeLabel, formatPrice } from "@/lib/constants";
import { FavoriteButton } from "@/components/favorite-button";
import { Stars } from "@/components/stars";
import { VENUE_BLUR } from "@/lib/image-placeholder";
import { venueHighlights } from "@/lib/venue-highlights";
import { responseTimeLabel } from "@/lib/response-time";
import {
  discountedPrice,
  hasVisibleDiscount,
  isCampaignActive,
  urgencyLabel,
} from "@/lib/campaign";

export function VenueCard({
  venue,
  favorited = false,
}: {
  venue: Venue;
  favorited?: boolean;
}) {
  const cover = venue.photos.find((p) => p.is_cover) ?? venue.photos[0];
  const types = venue.venue_types?.length ? venue.venue_types : [venue.venue_type];

  const highlights = venueHighlights(venue);
  const responseTime = responseTimeLabel(venue);
  const campaign = isCampaignActive(venue.campaign) ? venue.campaign : null;
  const discounted = hasVisibleDiscount(campaign);
  const urgency = campaign ? urgencyLabel(campaign) : null;

  return (
    <div className="group relative rounded-[1.75rem] border border-hairline bg-parchment p-1.5 shadow-float transition-all duration-700 ease-lux hover:-translate-y-1 hover:shadow-lift">
      <FavoriteButton venueId={venue.id} initialFavorited={favorited} />
      <Link href={`/mekan/${venue.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-cream-deep">
          {cover ? (
            <Image
              src={cover.url}
              alt={venue.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL={VENUE_BLUR}
              className="object-cover transition-transform duration-1000 ease-lux group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-mute">
              Fotoğraf yakında
            </div>
          )}
          {/* Sol üstte rozetler dikey yığılır; sağ üst favori butonuna ait. */}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {venue.plan === "premium" && (
              <span className="rounded-full bg-ink/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-cream backdrop-blur-sm">
                Öne Çıkan
              </span>
            )}
            {discounted && (
              <span className="rounded-full bg-bordeaux px-3 py-1 text-[11px] font-semibold text-cream shadow-float">
                %{campaign?.discount_pct} indirim
              </span>
            )}
            {urgency && (
              <span className="rounded-full bg-parchment/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-bordeaux backdrop-blur-sm">
                {urgency}
              </span>
            )}
          </div>
          <span className="absolute bottom-3 right-3 rounded-full bg-parchment/90 px-3 py-1 text-[11px] font-medium text-ink backdrop-blur-sm">
            {venueTypeLabel(types[0])}
            {types.length > 1 ? ` +${types.length - 1}` : ""}
          </span>
        </div>

        <div className="px-4 pb-4 pt-4">
          <div className="flex items-start gap-1.5">
            <h3 className="font-display text-lg font-semibold leading-snug text-ink">
              {venue.name}
            </h3>
            {venue.verified && (
              <span
                title="Belgeleri doğrulanmış işletme"
                className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-sage/15 px-2 py-0.5 text-[10px] font-medium text-sage"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                Doğrulanmış
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm text-mute">
              {venue.district ? `${venue.district}, ` : ""}
              {venue.city}
            </p>
            {venue.rating_count > 0 && (
              <span className="flex items-center gap-1 text-xs text-ink-soft">
                <Stars value={venue.rating_avg} size={11} />
                <span className="font-medium">{venue.rating_avg.toFixed(1)}</span>
                <span className="text-mute">({venue.rating_count})</span>
              </span>
            )}
          </div>

          {/* Ayırt edici özellikler — kullanıcı karta tıklamadan eleme yapabilsin.
              Yanıt hızı en önde: teklif isteme kararını doğrudan etkiliyor. */}
          {(highlights.length > 0 || responseTime) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {responseTime && (
                <span className="inline-flex items-center gap-1 rounded-full border border-sage/40 bg-sage/10 px-2.5 py-0.5 text-[11px] font-medium text-sage">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  {responseTime}
                </span>
              )}
              {highlights.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-hairline bg-cream px-2.5 py-0.5 text-[11px] text-ink-soft"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-end justify-between border-t border-hairline pt-3.5">
            <div className="text-xs text-ink-soft">
              <span className="block text-[10px] uppercase tracking-[0.15em] text-mute">
                Kapasite
              </span>
              {venue.capacity_min} – {venue.capacity_max} kişi
            </div>
            <div className="text-right">
              <span className="block text-[10px] uppercase tracking-[0.15em] text-mute">
                Kişi başı
              </span>
              {discounted ? (
                <>
                  <span className="block text-[11px] text-mute line-through">
                    {formatPrice(venue.price_min)} – {formatPrice(venue.price_max)} ₺
                  </span>
                  <span className="font-display text-base font-semibold text-bordeaux">
                    {formatPrice(discountedPrice(venue.price_min, campaign))} –{" "}
                    {formatPrice(discountedPrice(venue.price_max, campaign))} ₺
                  </span>
                </>
              ) : (
                <span className="font-display text-base font-semibold text-bordeaux">
                  {formatPrice(venue.price_min)} – {formatPrice(venue.price_max)} ₺
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
