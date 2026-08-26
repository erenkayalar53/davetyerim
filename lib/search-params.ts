import type { VenueFilters } from "./types";

export type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function asList(value: string | string[] | undefined): string[] | undefined {
  if (!value) return undefined;
  const list = Array.isArray(value) ? value : [value];
  return list.length > 0 ? list : undefined;
}

const SORT_MAP: Record<string, VenueFilters["sort"]> = {
  "one-cikan": "featured",
  "fiyat-artan": "price-asc",
  "fiyat-azalan": "price-desc",
  yeni: "newest",
};

export function parseFilters(
  sp: SearchParams,
  citySlug?: string
): VenueFilters {
  const filters: VenueFilters = {};

  if (citySlug) filters.city = citySlug;

  const categories = asList(sp.kategori);
  if (categories) filters.categories = categories;

  const venueTypes = asList(sp.tip);
  if (venueTypes) filters.venueTypes = venueTypes;

  const guests = Number(first(sp.kisi));
  if (Number.isFinite(guests) && guests > 0) {
    filters.capacityMin = guests;
    filters.capacityMax = guests;
  }

  const capacityRanges = asList(sp.kapasite);
  if (capacityRanges) filters.capacityRanges = capacityRanges;

  const priceRanges = asList(sp.fiyat);
  if (priceRanges) filters.priceRanges = priceRanges;

  const features = asList(sp.ozellik);
  if (features) filters.features = features;

  filters.sort = SORT_MAP[first(sp.sirala) ?? ""] ?? "featured";

  const page = Number(first(sp.sayfa));
  if (Number.isFinite(page) && page > 1) filters.page = page;

  return filters;
}
