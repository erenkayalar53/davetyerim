import Link from "next/link";
import { VenueCard } from "@/components/venue-card";
import { Filters } from "@/components/filters";
import { getAllArticles } from "@/lib/articles";
import { SortSelect } from "@/components/sort-select";
import { Pagination } from "@/components/pagination";
import { getVenues, cityFromSlug, getFavoriteVenueIds } from "@/lib/data";
import {
  isFilteredView,
  parseFilters,
  type SearchParams,
} from "@/lib/search-params";
import { categoryLabel, SITE_URL } from "@/lib/constants";

export function directoryTitle(
  citySlug?: string,
  categories?: string[]
): string {
  const cityName = citySlug ? cityFromSlug(citySlug) : undefined;
  const catLabel =
    categories?.length === 1 ? categoryLabel(categories[0]) : undefined;
  if (cityName && catLabel) return `${cityName} ${catLabel} Mekanları`;
  if (cityName) return `${cityName} Davet Mekanları`;
  if (catLabel) return `${catLabel} Mekanları`;
  return "Tüm Davet Mekanları";
}

export async function VenueDirectory({
  citySlug,
  searchParams,
}: {
  citySlug?: string;
  searchParams: SearchParams;
}) {
  const filters = parseFilters(searchParams, citySlug);
  const [{ venues, total, pageSize }, favoriteIds] = await Promise.all([
    getVenues(filters),
    getFavoriteVenueIds(),
  ]);
  const title = directoryTitle(citySlug, filters.categories);
  const basePath = citySlug ? `/mekanlar/${citySlug}` : "/mekanlar";
  const guideLinks = getAllArticles().slice(0, 3);

  // Filtre yüzünden değil, o ilde henüz mekan olmadığı için boş olan sayfa:
  // kullanıcıya "sonuç yok" demek yerine mekan sahibini davet etmek daha değerli.
  const cityName = citySlug ? cityFromSlug(citySlug) : undefined;
  const isEmptyCity =
    Boolean(cityName) && total === 0 && !isFilteredView(searchParams);

  // CollectionPage + ItemList: liste sayfasının ne olduğunu ve içindeki her
  // mekanı ayrı ayrı tanımlar. numberOfItems toplamı, position ise sayfalamayı
  // hesaba katan gerçek sırayı verir.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: `${SITE_URL}${basePath}`,
    inLanguage: "tr-TR",
    mainEntity: {
      "@type": "ItemList",
      name: title,
      numberOfItems: total,
      itemListElement: venues.map((v, i) => ({
        "@type": "ListItem",
        position: ((filters.page ?? 1) - 1) * pageSize + i + 1,
        url: `${SITE_URL}/mekan/${v.slug}`,
        item: {
          "@type": ["EventVenue", "LocalBusiness"],
          name: v.name,
          url: `${SITE_URL}/mekan/${v.slug}`,
          address: {
            "@type": "PostalAddress",
            addressLocality: v.district,
            addressRegion: v.city,
            addressCountry: "TR",
          },
          maximumAttendeeCapacity: v.capacity_max,
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "TRY",
            lowPrice: v.price_min,
            highPrice: v.price_max,
            unitText: "kişi başı",
          },
          ...(v.rating_count > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: v.rating_avg.toFixed(1),
                  reviewCount: v.rating_count,
                  bestRating: 5,
                  worstRating: 1,
                },
              }
            : {}),
        },
      })),
    },
  };

  if (isEmptyCity) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:pt-36">
        <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
          Yakında
        </span>
        <h1 className="mt-4 font-display text-fluid-section font-semibold text-ink">
          {cityName} Davet Mekanları
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          {cityName} için mekan listemizi hazırlıyoruz. Bölgedeki düğün
          salonları, kır bahçeleri ve otelleri tek tek değerlendirip yayına
          alıyoruz.
        </p>

        <div className="mt-10 rounded-[1.75rem] border border-gold/30 bg-parchment p-7 shadow-float">
          <h2 className="font-display text-xl font-semibold text-ink">
            {cityName}&rsquo;da işletmeniz mi var?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Mekan sayfanız ücretsiz açılır. Komisyon almıyoruz, rezervasyona
            karışmıyoruz &mdash; gelen teklif talepleri doğrudan size ulaşır.
            {cityName} listesini açan ilk mekanlardan biri olun.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/firmalar-icin"
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-ink-soft"
            >
              Mekanımı ekle
            </Link>
            <Link
              href="/mekanlar"
              className="rounded-full border border-hairline px-6 py-3 text-sm font-medium text-ink-soft transition-colors duration-500 ease-lux hover:border-bordeaux/40 hover:text-bordeaux"
            >
              Tüm mekanlara göz at
            </Link>
          </div>
        </div>

        {guideLinks.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold text-ink">
              Bu arada rehberimize göz atın
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {guideLinks.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/rehber/${article.slug}`}
                    className="text-sm font-medium text-bordeaux underline decoration-bordeaux/30 underline-offset-2 transition-colors hover:decoration-bordeaux"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
            {total} mekan bulundu
          </span>
          <h1 className="mt-4 font-display text-fluid-section font-semibold text-ink">
            {title}
          </h1>
        </div>
        <SortSelect />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:h-max">
          <Filters citySlug={citySlug} />
        </aside>

        <div>
          {venues.length === 0 ? (
            <div className="rounded-[1.75rem] border border-hairline bg-parchment p-12 text-center shadow-float">
              <p className="font-display text-2xl font-semibold text-ink">
                Bu kriterlere uygun mekan bulunamadı
              </p>
              <p className="mt-3 text-sm text-ink-soft">
                Filtreleri azaltmayı veya farklı bir şehir seçmeyi deneyin.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {venues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  favorited={favoriteIds.has(venue.id)}
                />
              ))}
            </div>
          )}

          <Pagination
            total={total}
            pageSize={pageSize}
            currentPage={filters.page ?? 1}
            basePath={basePath}
            searchParams={searchParams}
          />

          {/* Ticari sayfadan rehbere geri bağlantı — link akışı tek yönlü
              kalmasın diye. Karar aşamasındaki kullanıcıyı da tutar. */}
          {guideLinks.length > 0 && (
            <section className="mt-16 rounded-[1.75rem] border border-hairline bg-parchment p-7">
              <h2 className="font-display text-xl font-semibold text-ink">
                Karar vermeden önce
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Mekan seçerken nelere dikkat etmeli, bütçe nasıl planlanır?
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {guideLinks.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/rehber/${article.slug}`}
                      className="text-sm font-medium text-bordeaux underline decoration-bordeaux/30 underline-offset-2 transition-colors hover:decoration-bordeaux"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/rehber"
                className="mt-5 inline-block text-sm text-ink-soft transition-colors hover:text-bordeaux"
              >
                Tüm rehber yazıları →
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
