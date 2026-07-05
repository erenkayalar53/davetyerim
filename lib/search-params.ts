import type { VenueFilters } from "./types";

export type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseRange(value?: string): { min?: number; max?: number } {
  if (!value) return {};
  const [minStr, maxStr] = value.split("-");
  const min = Number(minStr);
  const max = Number(maxStr);
  return {
    min: Number.isFinite(min) ? min : undefined,
    max: Number.isFinite(max) ? max : undefined,
  };
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

  const category = first(sp.kategori);
  if (category) filters.category = category;

  const venueType = first(sp.tip);
  if (venueType) filters.venueType = venueType;

  const guests = Number(first(sp.kisi));
  if (Number.isFinite(guests) && guests > 0) {
    filters.capacityMin = guests;
    filters.capacityMax = guests;
  }

  const capacity = parseRange(first(sp.kapasite));
  if (capacity.min !== undefined) filters.capacityMin = capacity.min;
  if (capacity.max !== undefined) filters.capacityMax = capacity.max;

  const price = parseRange(first(sp.fiyat));
  if (price.min !== undefined) filters.priceMin = price.min;
  if (price.max !== undefined) filters.priceMax = price.max;

  const features = sp.ozellik;
  if (features) {
    filters.features = Array.isArray(features) ? features : [features];
  }

  filters.sort = SORT_MAP[first(sp.sirala) ?? ""] ?? "featured";

  const page = Number(first(sp.sayfa));
  if (Number.isFinite(page) && page > 1) filters.page = page;

  return filters;
}
