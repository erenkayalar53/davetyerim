import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { venueRobots } from "@/lib/demo-mode";
import { Gallery } from "@/components/gallery";
import { LeadForm } from "@/components/lead-form";
import { CallbackForm } from "@/components/callback-form";
import { PhoneReveal } from "@/components/phone-reveal";
import { VenueCard } from "@/components/venue-card";
import { Reveal } from "@/components/reveal";
import { FavoriteButton } from "@/components/favorite-button";
import { RichText } from "@/components/rich-text";
import { Stars } from "@/components/stars";
import { Accordion } from "@/components/accordion";
import { ReviewsSection } from "@/components/reviews-section";
import { VenueCtaBar } from "@/components/venue-cta-bar";
import {
  VenueStickyBar,
  type VenueTab,
} from "@/components/venue-sticky-bar";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import {
  getVenueBySlug,
  getSimilarVenues,
  getFavoriteVenueIds,
  getVenueReviews,
  getVenueUnavailableDates,
  recordVenueView,
} from "@/lib/data";
import { getSessionProfile } from "@/lib/auth";
import {
  categoryLabel,
  featureLabel,
  venueTypeLabel,
  formatPrice,
  slugifyTr,
  SITE_URL,
} from "@/lib/constants";
import { IconCheck } from "@/components/icons";
import { venueFaqs } from "@/lib/venue-faq";
import { isCampaignActive, urgencyLabel } from "@/lib/campaign";
import { responseTimeLabel } from "@/lib/response-time";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) return {};
  return {
    title: `${venue.name} — ${venue.city} ${venueTypeLabel(venue.venue_type)} Fiyatları`,
    description: `${venue.name} (${venue.district ? venue.district + ", " : ""}${venue.city}) — ${venue.capacity_min}-${venue.capacity_max} kişi kapasiteli, kişi başı ${formatPrice(venue.price_min)}-${formatPrice(venue.price_max)} ₺. Ücretsiz teklif alın.`,
    alternates: { canonical: `/mekan/${venue.slug}` },
    // Demo veri gösterilirken sayfa dizine alınmaz: içerik gerçek bir
    // işletmeye ait değil.
    robots: venueRobots(),
    // openGraph.images'i burada ELLE VERMEYİN: verilirse opengraph-image.tsx'i
    // ezer ve ham fotoğraf URL'i paylaşılır. Depodaki fotoğraflar AVIF olabiliyor
    // ve sosyal medya tarayıcıları AVIF'i render edemiyor — önizleme boş çıkar.
    // opengraph-image.tsx marka kartını PNG olarak üretiyor.
  };
}

export default async function VenuePage({ params }: PageProps) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) notFound();

  await recordVenueView(venue.id);
  const [similar, favoriteIds, reviews, unavailableDates, session] =
    await Promise.all([
      getSimilarVenues(venue),
      getFavoriteVenueIds(),
      getVenueReviews(venue.id),
      getVenueUnavailableDates(venue.id),
      getSessionProfile(),
    ]);

  const venueTypes = venue.venue_types?.length
    ? venue.venue_types
    : [venue.venue_type];
  const canManage = Boolean(
    session &&
      (session.profile.role === "admin" ||
        session.user.id === venue.owner_id)
  );

  const jsonLd = {
    "@context": "https://schema.org",
    // Mekan hem etkinlik alanı hem işletme — ikisi birden işaretlenince
    // yerel arama ve etkinlik sonuçlarının ikisine de aday oluyor.
    "@type": ["EventVenue", "LocalBusiness"],
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
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "TRY",
      lowPrice: venue.price_min,
      highPrice: venue.price_max,
      unitText: "kişi başı",
      ...(venue.menu_packages.length > 0
        ? { offerCount: venue.menu_packages.length }
        : {}),
    },
    // Puan ve yorumlar YALNIZCA gerçek onaylı yorum varsa basılır.
    ...(venue.rating_count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: venue.rating_avg.toFixed(1),
            reviewCount: venue.rating_count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(reviews.length > 0
      ? {
          review: reviews.slice(0, 10).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author_name },
            datePublished: r.created_at?.slice(0, 10),
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            ...(r.comment ? { reviewBody: r.comment } : {}),
          })),
        }
      : {}),
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

  // Mekan sahibinin girdiği sorular + yapısal veriden üretilenler
  const faqs = venueFaqs(venue);

  const faqJsonLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  const mapQuery = encodeURIComponent(
    `${venue.name} ${venue.district} ${venue.city}`
  );

  const hasWeekendPricing = venue.menu_packages.some(
    (p) => (p.price_weekday ?? 0) !== (p.price_weekend ?? 0)
  );

  // Süresi dolmuş kampanya hiçbir yerde görünmemeli — sekme de dahil.
  const activeCampaign = isCampaignActive(venue.campaign) ? venue.campaign : null;
  const campaignUrgency = activeCampaign ? urgencyLabel(activeCampaign) : null;
  const responseTime = responseTimeLabel(venue);

  // Yapışkan bar sekmeleri — yalnızca var olan bölümler, sayılarıyla
  const tabs: VenueTab[] = [
    { id: "fotograflar", label: "Fotoğraflar", count: venue.photos.length },
    { id: "hakkinda", label: "Hakkında" },
    ...(venue.menu_packages.length > 0
      ? [
          {
            id: "fiyatlar",
            label: "Fiyatlar",
            count: venue.menu_packages.length,
          },
        ]
      : []),
    ...(activeCampaign ? [{ id: "kampanya", label: "Kampanya" }] : []),
    { id: "musaitlik", label: "Müsaitlik" },
    { id: "kapasite", label: "Kapasite" },
    { id: "ozellikler", label: "Özellikler", count: venue.features.length },
    ...(faqs.length > 0
      ? [{ id: "sss", label: "S.S.S.", count: faqs.length }]
      : []),
    { id: "yorumlar", label: "Yorumlar", count: venue.rating_count },
    { id: "konum", label: "Konum" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-32 sm:pt-36 lg:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

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
          <h1 className="mt-4 font-display text-fluid-section font-semibold text-ink">
            {venue.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            <span>
              {venue.district ? `${venue.district}, ` : ""}
              {venue.city}
            </span>
            {venue.rating_count > 0 && (
              <span className="flex items-center gap-1.5">
                <Stars value={venue.rating_avg} size={14} />
                <span className="font-medium text-ink">
                  {venue.rating_avg.toFixed(1)}
                </span>
                <span className="text-mute">
                  ({venue.rating_count} yorum)
                </span>
              </span>
            )}
          </div>
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

      <VenueStickyBar
        venueName={venue.name}
        priceLabel={`${formatPrice(venue.price_min)} – ${formatPrice(venue.price_max)} ₺`}
        tabs={tabs}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Sol kolon */}
        <div className="min-w-0">
          <div id="fotograflar" className="scroll-mt-32">
            <Gallery photos={venue.photos} venueName={venue.name} />
          </div>

          {/* Özet bilgiler */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Kapasite",
                value: `${venue.capacity_min} – ${venue.capacity_max}`,
              },
              { label: "Şehir", value: venue.city },
              { label: "Tip", value: venueTypeLabel(venueTypes[0]) },
              { label: "Görüntülenme", value: `${venue.view_count}` },
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
          <Reveal className="mt-12 scroll-mt-32" id="hakkinda">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Mekan Hakkında
            </h2>
            <div className="mt-3">
              <RichText content={venue.description} />
            </div>
          </Reveal>

          {/* Fiyatlar */}
          {venue.menu_packages.length > 0 && (
            <Reveal className="mt-12 scroll-mt-32" id="fiyatlar">
              <h2 className="font-display text-2xl font-semibold text-ink">
                Fiyatlar
              </h2>
              <p className="mt-2 text-sm text-mute">
                Kişi başı fiyatlar. Kesin teklif için tarih ve davetli sayınızla
                ücretsiz teklif isteyin.
              </p>
              <div className="mt-4 overflow-x-auto rounded-[1.5rem] border border-hairline">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="bg-cream-deep/60 text-[10px] uppercase tracking-[0.15em] text-mute">
                    <tr>
                      <th className="px-5 py-3.5 font-medium">Paket</th>
                      <th className="px-4 py-3.5 text-center font-medium">Yemek</th>
                      <th className="px-4 py-3.5 text-center font-medium">Alkol</th>
                      {hasWeekendPricing ? (
                        <>
                          <th className="px-4 py-3.5 text-right font-medium">
                            Hafta İçi
                          </th>
                          <th className="px-5 py-3.5 text-right font-medium">
                            Hafta Sonu
                          </th>
                        </>
                      ) : (
                        <th className="px-5 py-3.5 text-right font-medium">
                          Kişi Başı
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-parchment">
                    {venue.menu_packages.map((pkg, i) => (
                      <tr key={i} className="border-t border-hairline first:border-0">
                        <td className="px-5 py-4 font-medium text-ink">
                          {pkg.name}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {pkg.includes_food ? (
                            <IconCheck size={15} className="mx-auto text-sage" strokeWidth={2.4} />
                          ) : (
                            <span className="text-mute/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {pkg.includes_alcohol ? (
                            <IconCheck size={15} className="mx-auto text-sage" strokeWidth={2.4} />
                          ) : (
                            <span className="text-mute/50">—</span>
                          )}
                        </td>
                        {hasWeekendPricing ? (
                          <>
                            <td className="px-4 py-4 text-right font-medium text-ink">
                              {formatPrice(pkg.price_weekday ?? pkg.price)} ₺
                            </td>
                            <td className="px-5 py-4 text-right font-display text-base font-semibold text-bordeaux">
                              {formatPrice(pkg.price_weekend ?? pkg.price)} ₺
                            </td>
                          </>
                        ) : (
                          <td className="px-5 py-4 text-right font-display text-base font-semibold text-bordeaux">
                            {formatPrice(pkg.price)} ₺
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          )}

          {/* Kampanya */}
          {activeCampaign && (
            <Reveal className="mt-12 scroll-mt-32" id="kampanya">
              <div className="overflow-hidden rounded-[1.5rem] border border-bordeaux/30 bg-bordeaux p-1.5">
                <div className="rounded-[calc(1.5rem-0.375rem)] bg-bordeaux px-6 py-6 text-cream">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em]">
                      Kampanya
                    </span>
                    {activeCampaign.discount_pct ? (
                      <span className="font-display text-2xl font-semibold text-blush">
                        %{activeCampaign.discount_pct} indirim
                      </span>
                    ) : null}
                    {campaignUrgency && (
                      <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold text-bordeaux">
                        {campaignUrgency}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold">
                    {activeCampaign.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">
                    {activeCampaign.text}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/70">
                    {activeCampaign.min_guests ? (
                      <span>Min. {activeCampaign.min_guests} kişi</span>
                    ) : null}
                    {activeCampaign.valid_until ? (
                      <span>
                        Son gün:{" "}
                        {new Date(
                          activeCampaign.valid_until
                        ).toLocaleDateString("tr-TR")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* Müsaitlik */}
          <Reveal className="mt-12 scroll-mt-32" id="musaitlik">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Müsaitlik Takvimi
            </h2>
            <p className="mt-2 text-sm text-mute">
              Mekan sahibi tarafından güncellenir. Kesin müsaitlik için tarih
              belirterek ücretsiz teklif isteyin.
            </p>
            <div className="mt-4">
              <AvailabilityCalendar unavailableDates={unavailableDates} />
            </div>
          </Reveal>

          {/* Kapasite */}
          <Reveal className="mt-12 scroll-mt-32" id="kapasite">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Kapasite
            </h2>
            {venue.capacity_areas.length > 0 ? (
              <div className="mt-4 overflow-x-auto rounded-[1.5rem] border border-hairline">
                <table className="w-full min-w-[360px] text-left text-sm">
                  <thead className="bg-cream-deep/60 text-[10px] uppercase tracking-[0.15em] text-mute">
                    <tr>
                      <th className="px-5 py-3.5 font-medium">Alan</th>
                      <th className="px-5 py-3.5 text-right font-medium">
                        Kapasite (kişi)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-parchment">
                    {venue.capacity_areas.map((area, i) => (
                      <tr key={i} className="border-t border-hairline first:border-0">
                        <td className="px-5 py-4 font-medium text-ink">
                          {area.name}
                        </td>
                        <td className="px-5 py-4 text-right text-ink-soft">
                          {area.min} – {area.max}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-ink-soft">
                Bu mekan{" "}
                <strong className="text-ink">
                  {venue.capacity_min} – {venue.capacity_max} kişi
                </strong>{" "}
                arası davetlere ev sahipliği yapabilir.
              </p>
            )}
          </Reveal>

          {/* Etkinlik türleri + Özellikler */}
          <Reveal className="mt-12 scroll-mt-32" id="ozellikler">
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

            <h3 className="mt-8 font-display text-xl font-semibold text-ink">
              Mekan Özellikleri
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {venue.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-2xl border border-hairline bg-parchment px-4 py-3 text-sm text-ink-soft"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage">
                    <IconCheck size={13} strokeWidth={2.6} />
                  </span>
                  {featureLabel(feature)}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Mekana özel SSS */}
          {faqs.length > 0 && (
            <Reveal className="mt-12 scroll-mt-32" id="sss">
              <h2 className="font-display text-2xl font-semibold text-ink">
                Sıkça Sorulan Sorular
              </h2>
              <div className="mt-4">
                <Accordion items={faqs} />
              </div>
            </Reveal>
          )}

          {/* Yorumlar */}
          <Reveal className="mt-12 scroll-mt-32" id="yorumlar">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Yorumlar & Puanlar
            </h2>
            <div className="mt-5">
              <ReviewsSection
                venue={venue}
                reviews={reviews}
                canManage={canManage}
              />
            </div>
          </Reveal>

          {/* Konum */}
          <Reveal className="mt-12 scroll-mt-32" id="konum">
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
        <aside id="teklif" className="scroll-mt-28 lg:sticky lg:top-28 lg:h-max">
          {responseTime && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-sage/30 bg-sage/10 px-4 py-3">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="shrink-0 text-sage"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <p className="text-sm font-medium text-sage">
                Ortalama {responseTime}
              </p>
            </div>
          )}

          <div className="rounded-[1.75rem] border border-hairline bg-parchment p-1.5 shadow-lift">
            <LeadForm
              venueId={venue.id}
              venueCategories={venue.categories}
              unavailableDates={unavailableDates}
            />
          </div>

          <div className="mt-4">
            <CallbackForm venueId={venue.id} />
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

      <VenueCtaBar
        priceLabel={`${formatPrice(venue.price_min)} – ${formatPrice(venue.price_max)} ₺`}
      />
    </div>
  );
}
