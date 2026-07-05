import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery";
import { LeadForm } from "@/components/lead-form";
import { PhoneReveal } from "@/components/phone-reveal";
import { VenueCard } from "@/components/venue-card";
import { Reveal } from "@/components/reveal";
import { FavoriteButton } from "@/components/favorite-button";
import {
  getVenueBySlug,
  getSimilarVenues,
  getFavoriteVenueIds,
  recordVenueView,
} from "@/lib/data";
import {
  categoryLabel,
  featureLabel,
  venueTypeLabel,
  formatPrice,
  slugifyTr,
  SITE_URL,
} from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) return {};
  const cover = venue.photos[0]?.url;
  return {
    title: `${venue.name} — ${venue.city} ${venueTypeLabel(venue.venue_type)} Fiyatları`,
    description: `${venue.name} (${venue.district ? venue.district + ", " : ""}${venue.city}) — ${venue.capacity_min}-${venue.capacity_max} kişi kapasiteli, kişi başı ${formatPrice(venue.price_min)}-${formatPrice(venue.price_max)} ₺. Ücretsiz teklif alın.`,
    alternates: { canonical: `/mekan/${venue.slug}` },
    openGraph: cover ? { images: [{ url: cover }] } : undefined,
  };
}

export default async function VenuePage({ params }: PageProps) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) notFound();

  await recordVenueView(venue.id);
  const [similar, favoriteIds] = await Promise.all([
    getSimilarVenues(venue),
    getFavoriteVenueIds(),
  ]);
  const venueTypes = venue.venue_types?.length
    ? venue.venue_types
    : [venue.venue_type];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: venue.name,
    description: venue.description,
    url: `${SITE_URL}/mekan/${venue.slug}`,
    image: venue.photos.map((p) => p.url),
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address,
      addressLocality: venue.district,
      addressRegion: venue.city,
      addressCountry: "TR",
    },
    maximumAttendeeCapacity: venue.capacity_max,
    priceRange: `₺${formatPrice(venue.price_min)} - ₺${formatPrice(venue.price_max)} (kişi başı)`,
    ...(venue.plan === "premium" && venue.phone
      ? { telephone: venue.phone }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Mekanlar",
        item: `${SITE_URL}/mekanlar`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${venue.city} Davet Mekanları`,
        item: `${SITE_URL}/mekanlar/${slugifyTr(venue.city)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: venue.name,
        item: `${SITE_URL}/mekan/${venue.slug}`,
      },
    ],
  };

  const mapQuery = encodeURIComponent(
    `${venue.name} ${venue.district} ${venue.city}`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Sayfa yolu" className="text-xs text-mute">
        <Link href="/" className="hover:text-bordeaux">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <Link href="/mekanlar" className="hover:text-bordeaux">Mekanlar</Link>
        <span className="mx-2">/</span>
        <Link
          href={`/mekanlar/${slugifyTr(venue.city)}`}
          className="hover:text-bordeaux"
        >
          {venue.city}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-soft">{venue.name}</span>
      </nav>

      {/* Başlık */}
      <div className="mt-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {venueTypes.map((t) => (
              <span
                key={t}
                className="rounded-full bg-blush px-3 py-1 text-xs font-medium text-bordeaux"
              >
                {venueTypeLabel(t)}
              </span>
            ))}
            {venue.plan === "premium" && (
              <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-cream">
                Öne Çıkan
              </span>
            )}
            {venue.verified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/15 px-3 py-1 text-xs font-medium text-sage">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                Doğrulanmış İşletme
              </span>
            )}
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl">
            {venue.name}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {venue.district ? `${venue.district}, ` : ""}
            {venue.city}
          </p>
        </div>
        <div className="rounded-2xl border border-hairline bg-parchment px-6 py-4 text-right shadow-float">
          <p className="text-[10px] uppercase tracking-[0.18em] text-mute">
            Kişi başı
          </p>
          <p className="font-display text-2xl font-semibold text-bordeaux">
            {formatPrice(venue.price_min)} – {formatPrice(venue.price_max)} ₺
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Sol kolon */}
        <div className="min-w-0">
          <Gallery photos={venue.photos} venueName={venue.name} />

          {/* Özet bilgiler */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Kapasite",
                value: `${venue.capacity_min} – ${venue.capacity_max}`,
              },
              { label: "Şehir", value: venue.city },
              { label: "Tip", value: venueTypeLabel(venueTypes[0]) },
              {
                label: "Görüntülenme",
                value: `${venue.view_count}`,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-hairline bg-parchment px-4 py-3.5"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-mute">
                  {item.label}
                </p>
                <p className="mt-1 truncate text-sm font-medium text-ink">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Açıklama */}
          <Reveal className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Mekan Hakkında
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              {venue.description}
            </p>
          </Reveal>

          {/* Fiyat paketleri */}
          {venue.menu_packages.length > 0 && (
            <Reveal className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-ink">
                Fiyat Paketleri
              </h2>
              <p className="mt-2 text-sm text-mute">
                Kişi başı fiyatlar. Kesin teklif için tarih ve davetli sayınızla
                ücretsiz teklif isteyin.
              </p>
              <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-hairline">
                <table className="w-full text-left text-sm">
                  <thead className="bg-cream-deep/60 text-[10px] uppercase tracking-[0.15em] text-mute">
                    <tr>
                      <th className="px-5 py-3.5 font-medium">Paket</th>
                      <th className="px-4 py-3.5 text-center font-medium">Yemek</th>
                      <th className="px-4 py-3.5 text-center font-medium">Alkol</th>
                      <th className="px-5 py-3.5 text-right font-medium">
                        Kişi Başı
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-parchment">
                    {venue.menu_packages.map((pkg, i) => (
                      <tr
                        key={i}
                        className="border-t border-hairline first:border-0"
                      >
                        <td className="px-5 py-4 font-medium text-ink">
                          {pkg.name}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {pkg.includes_food ? (
                            <span className="text-sage">✓</span>
                          ) : (
                            <span className="text-mute/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {pkg.includes_alcohol ? (
                            <span className="text-sage">✓</span>
                          ) : (
                            <span className="text-mute/50">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right font-display text-base font-semibold text-bordeaux">
                          {formatPrice(pkg.price)} ₺
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          )}

          {/* Etkinlik türleri */}
          <Reveal className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Uygun Etkinlikler
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {venue.categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/mekanlar?kategori=${cat}`}
                  className="rounded-full border border-hairline bg-parchment px-4 py-2 text-sm text-ink-soft transition-colors duration-300 hover:border-bordeaux/40 hover:text-bordeaux"
                >
                  {categoryLabel(cat)}
                </Link>
              ))}
            </div>
          </Reveal>

          {/* Özellikler */}
          <Reveal className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Mekan Özellikleri
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {venue.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-2xl border border-hairline bg-parchment px-4 py-3 text-sm text-ink-soft"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage/15 text-xs text-sage">
                    ✓
                  </span>
                  {featureLabel(feature)}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Konum */}
          <Reveal className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Konum
            </h2>
            <p className="mt-3 text-sm text-ink-soft">{venue.address}</p>
            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-hairline shadow-float">
              <iframe
                title={`${venue.name} harita konumu`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>

        {/* Sağ kolon — teklif */}
        <aside className="lg:sticky lg:top-28 lg:h-max">
          <div className="rounded-[1.75rem] border border-hairline bg-parchment p-1.5 shadow-lift">
            <LeadForm venueId={venue.id} venueCategories={venue.categories} />
          </div>

          <div className="mt-4 rounded-[1.75rem] border border-hairline bg-parchment p-5">
            {venue.plan === "premium" ? (
              <PhoneReveal phone={venue.phone} whatsapp={venue.whatsapp} />
            ) : (
              <p className="text-center text-xs leading-relaxed text-mute">
                Bu mekanla iletişim, teklif formu üzerinden sağlanır.
              </p>
            )}
          </div>

          <div className="mt-4 flex w-full flex-col">
            <FavoriteButton
              venueId={venue.id}
              initialFavorited={favoriteIds.has(venue.id)}
              variant="detail"
            />
          </div>
        </aside>
      </div>

      {/* Benzer mekanlar */}
      {similar.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Benzer Mekanlar
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((v, i) => (
              <Reveal key={v.id} delay={i * 80}>
                <VenueCard venue={v} favorited={favoriteIds.has(v.id)} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
