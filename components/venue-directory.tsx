import { VenueCard } from "@/components/venue-card";
import { Filters } from "@/components/filters";
import { SortSelect } from "@/components/sort-select";
import { Pagination } from "@/components/pagination";
import { getVenues, cityFromSlug, getFavoriteVenueIds } from "@/lib/data";
import { parseFilters, type SearchParams } from "@/lib/search-params";
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

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    numberOfItems: total,
    itemListElement: venues.map((v, i) => ({
      "@type": "ListItem",
      position: ((filters.page ?? 1) - 1) * pageSize + i + 1,
      url: `${SITE_URL}/mekan/${v.slug}`,
      name: v.name,
    })),
  };

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
        </div>
      </div>
    </div>
  );
}
