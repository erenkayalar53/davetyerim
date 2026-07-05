import Link from "next/link";
import Image from "next/image";
import type { Venue } from "@/lib/types";
import { venueTypeLabel, formatPrice } from "@/lib/constants";

export function VenueCard({ venue }: { venue: Venue }) {
  const cover = venue.photos.find((p) => p.is_cover) ?? venue.photos[0];

  return (
    <Link
      href={`/mekan/${venue.slug}`}
      className="group block rounded-[1.75rem] border border-hairline bg-parchment p-1.5 shadow-float transition-all duration-700 ease-lux hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-cream-deep">
        {cover ? (
          <Image
            src={cover.url}
            alt={venue.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-1000 ease-lux group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-mute">
            Fotoğraf yakında
          </div>
        )}
        {venue.plan === "premium" && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-cream backdrop-blur-sm">
            Öne Çıkan
          </span>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-parchment/90 px-3 py-1 text-[11px] font-medium text-ink backdrop-blur-sm">
          {venueTypeLabel(venue.venue_type)}
        </span>
      </div>

      <div className="px-4 pb-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-snug text-ink">
            {venue.name}
          </h3>
        </div>
        <p className="mt-1 text-sm text-mute">
          {venue.district ? `${venue.district}, ` : ""}
          {venue.city}
        </p>

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
            <span className="font-display text-base font-semibold text-bordeaux">
              {formatPrice(venue.price_min)} – {formatPrice(venue.price_max)} ₺
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
