import { MOCK_VENUES } from "./mock-data";
import { createClient, isSupabaseConfigured } from "./supabase/server";
import { slugifyTr, CITIES } from "./constants";
import type { Venue, VenueFilters, VenuePhoto } from "./types";

export const PAGE_SIZE = 12;

type VenueRow = Omit<Venue, "photos" | "venue_types" | "menu_packages"> & {
  photos: VenuePhoto[] | null;
  venue_types: string[] | null;
  menu_packages: Venue["menu_packages"] | null;
  view_count?: number | null;
};

function normalize(row: VenueRow): Venue {
  const venue_types =
    row.venue_types && row.venue_types.length > 0
      ? row.venue_types
      : [row.venue_type];
  return {
    ...row,
    venue_types,
    venue_type: row.venue_type ?? venue_types[0],
    menu_packages: row.menu_packages ?? [],
    view_count: row.view_count ?? 0,
    verified: row.verified ?? false,
    photos: (row.photos ?? []).sort((a, b) => a.sort_order - b.sort_order),
  };
}

function sortVenues(venues: Venue[], sort: VenueFilters["sort"]): Venue[] {
  const list = [...venues];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price_min - b.price_min);
    case "price-desc":
      return list.sort((a, b) => b.price_max - a.price_max);
    case "newest":
      return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    default:
      // Öne çıkanlar: premium > featured > yeni
      return list.sort((a, b) => {
        const planDiff =
          (b.plan === "premium" ? 1 : 0) - (a.plan === "premium" ? 1 : 0);
        if (planDiff !== 0) return planDiff;
        const featDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        if (featDiff !== 0) return featDiff;
        return b.created_at.localeCompare(a.created_at);
      });
  }
}

function applyFilters(venues: Venue[], f: VenueFilters): Venue[] {
  return venues.filter((v) => {
    if (f.city && slugifyTr(v.city) !== slugifyTr(f.city)) return false;
    if (f.category && !v.categories.includes(f.category)) return false;
    if (
      f.venueType &&
      !v.venue_types.includes(f.venueType) &&
      v.venue_type !== f.venueType
    )
      return false;
    if (f.capacityMin !== undefined && v.capacity_max < f.capacityMin)
      return false;
    if (f.capacityMax !== undefined && v.capacity_min > f.capacityMax)
      return false;
    if (f.priceMin !== undefined && v.price_max < f.priceMin) return false;
    if (f.priceMax !== undefined && v.price_min > f.priceMax) return false;
    if (f.features?.length) {
      if (!f.features.every((feat) => v.features.includes(feat))) return false;
    }
    return true;
  });
}

export function cityFromSlug(slug: string): string | undefined {
  return CITIES.find((c) => slugifyTr(c) === slug);
}

export async function getVenues(
  filters: VenueFilters
): Promise<{ venues: Venue[]; total: number; pageSize: number }> {
  const page = Math.max(1, filters.page ?? 1);

  if (!isSupabaseConfigured()) {
    const filtered = sortVenues(
      applyFilters(MOCK_VENUES, filters),
      filters.sort
    );
    return {
      venues: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
      total: filtered.length,
      pageSize: PAGE_SIZE,
    };
  }

  const supabase = await createClient();
  let query = supabase
    .from("venues")
    .select("*, photos:venue_photos(*)", { count: "exact" })
    .eq("status", "approved");

  const cityName = filters.city ? cityFromSlug(slugifyTr(filters.city)) : null;
  if (cityName) query = query.eq("city", cityName);
  if (filters.category)
    query = query.contains("categories", [filters.category]);
  if (filters.venueType)
    query = query.contains("venue_types", [filters.venueType]);
  if (filters.capacityMin !== undefined)
    query = query.gte("capacity_max", filters.capacityMin);
  if (filters.capacityMax !== undefined)
    query = query.lte("capacity_min", filters.capacityMax);
  if (filters.priceMin !== undefined)
    query = query.gte("price_max", filters.priceMin);
  if (filters.priceMax !== undefined)
    query = query.lte("price_min", filters.priceMax);
  if (filters.features?.length)
    query = query.contains("features", filters.features);

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price_min", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price_max", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query
        .order("plan", { ascending: false })
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error(`Mekanlar yüklenemedi: ${error.message}`);

  return {
    venues: (data as VenueRow[]).map(normalize),
    total: count ?? 0,
    pageSize: PAGE_SIZE,
  };
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_VENUES.find((v) => v.slug === slug) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select("*, photos:venue_photos(*)")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !data) return null;
  return normalize(data as VenueRow);
}

export async function getFeaturedVenues(limit = 6): Promise<Venue[]> {
  const { venues } = await getVenues({ sort: "featured", page: 1 });
  return venues.slice(0, limit);
}

export async function getSimilarVenues(
  venue: Venue,
  limit = 3
): Promise<Venue[]> {
  const { venues } = await getVenues({
    city: slugifyTr(venue.city),
    sort: "featured",
    page: 1,
  });
  const similar = venues.filter((v) => v.id !== venue.id);
  if (similar.length >= limit) return similar.slice(0, limit);

  const { venues: others } = await getVenues({ sort: "featured", page: 1 });
  for (const v of others) {
    if (similar.length >= limit) break;
    if (v.id !== venue.id && !similar.some((s) => s.id === v.id))
      similar.push(v);
  }
  return similar.slice(0, limit);
}

export async function getApprovedVenuesForSitemap(): Promise<
  { slug: string; updated_at?: string }[]
> {
  if (!isSupabaseConfigured()) {
    return MOCK_VENUES.map((v) => ({ slug: v.slug }));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("venues")
    .select("slug, updated_at")
    .eq("status", "approved");
  return data ?? [];
}

export async function getCityCounts(): Promise<
  { city: string; slug: string; count: number }[]
> {
  let venues: { city: string }[];
  if (!isSupabaseConfigured()) {
    venues = MOCK_VENUES;
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from("venues")
      .select("city")
      .eq("status", "approved");
    venues = data ?? [];
  }

  const counts = new Map<string, number>();
  for (const v of venues) {
    counts.set(v.city, (counts.get(v.city) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([city, count]) => ({ city, slug: slugifyTr(city), count }))
    .sort((a, b) => b.count - a.count);
}

// Admin önizleme: onay durumundan bağımsız mekan getir (RLS admin/sahip erişimi verir)
export async function getVenueByIdForPreview(id: string): Promise<Venue | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_VENUES.find((v) => v.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select("*, photos:venue_photos(*)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return normalize(data as VenueRow);
}

// Görüntülenme sayacını artır (RPC — anon dahil güvenli)
export async function recordVenueView(venueId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (venueId.startsWith("mock-")) return;
  const supabase = await createClient();
  await supabase.rpc("increment_venue_view", { vid: venueId });
}

// Giriş yapmış kullanıcının favori mekan ID'leri
export async function getFavoriteVenueIds(): Promise<Set<string>> {
  if (!isSupabaseConfigured()) return new Set();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("favorites")
    .select("venue_id")
    .eq("user_id", user.id);
  return new Set((data ?? []).map((f) => f.venue_id as string));
}

// Kullanıcının favori mekanlarının tamamı (Favorilerim sayfası)
export async function getFavoriteVenues(): Promise<Venue[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("favorites")
    .select("venue:venues(*, photos:venue_photos(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as { venue: VenueRow | null }[])
    .map((row) => row.venue)
    .filter((v): v is VenueRow => v !== null && v.status === "approved")
    .map(normalize);
}
