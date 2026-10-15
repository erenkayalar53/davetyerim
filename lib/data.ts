import { MOCK_VENUES } from "./mock-data";
import { createClient, isSupabaseConfigured } from "./supabase/server";
import { slugifyTr, CITIES } from "./constants";
import type { Venue, VenueFilters, VenuePhoto } from "./types";

export const PAGE_SIZE = 12;

type VenueRow = Omit<
  Venue,
  | "photos"
  | "venue_types"
  | "menu_packages"
  | "faqs"
  | "capacity_areas"
  | "campaign"
> & {
  photos: VenuePhoto[] | null;
  venue_types: string[] | null;
  menu_packages: Venue["menu_packages"] | null;
  faqs?: Venue["faqs"] | null;
  capacity_areas?: Venue["capacity_areas"] | null;
  campaign?: Venue["campaign"] | null;
  view_count?: number | null;
  rating_avg?: number | null;
  rating_count?: number | null;
};

function normalizeMenuPackage(p: Venue["menu_packages"][number]) {
  const weekday = p.price_weekday ?? p.price ?? 0;
  const weekend = p.price_weekend ?? p.price ?? weekday;
  return {
    ...p,
    price_weekday: weekday,
    price_weekend: weekend,
    price: p.price ?? weekday,
  };
}

function normalize(row: VenueRow): Venue {
  const venue_types =
    row.venue_types && row.venue_types.length > 0
      ? row.venue_types
      : [row.venue_type];
  return {
    ...row,
    venue_types,
    venue_type: row.venue_type ?? venue_types[0],
    menu_packages: (row.menu_packages ?? []).map(normalizeMenuPackage),
    faqs: row.faqs ?? [],
    capacity_areas: row.capacity_areas ?? [],
    campaign: row.campaign ?? null,
    rating_avg: Number(row.rating_avg ?? 0),
    rating_count: row.rating_count ?? 0,
    view_count: row.view_count ?? 0,
    // migration-v9 uygulanmadan önce bu kolonlar gelmez; rozet sessizce
    // gizlenir, sayfa çökmez.
    avg_response_minutes: row.avg_response_minutes ?? null,
    response_sample_count: row.response_sample_count ?? 0,
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

function parseRangeStr(value: string): { min: number; max: number } {
  const [minStr, maxStr] = value.split("-");
  return { min: Number(minStr), max: Number(maxStr) };
}

// Seçilen aralıklardan en az biriyle çakışıyorsa true döner (OR mantığı)
function matchesAnyRange(
  ranges: string[] | undefined,
  itemMin: number,
  itemMax: number
): boolean {
  if (!ranges?.length) return true;
  return ranges.some((r) => {
    const { min, max } = parseRangeStr(r);
    return itemMax >= min && itemMin <= max;
  });
}

/**
 * Demo modunda (Supabase yok) müsaitlik kaydı hiç bulunmaz, o yüzden burada
 * f.date bilerek göz ardı edilir: elimizde veri olmadan mekan elemek, uydurma
 * müsaitlik bilgisi göstermek olurdu. Tarih filtresi yalnızca gerçek
 * venue_unavailable_dates kayıtları üzerinden çalışır (bkz. getVenues).
 */
function applyFilters(venues: Venue[], f: VenueFilters): Venue[] {
  return venues.filter((v) => {
    if (f.city && slugifyTr(v.city) !== slugifyTr(f.city)) return false;
    if (
      f.categories?.length &&
      !f.categories.some((c) => v.categories.includes(c))
    )
      return false;
    if (
      f.venueTypes?.length &&
      !f.venueTypes.some(
        (t) => v.venue_types.includes(t) || v.venue_type === t
      )
    )
      return false;
    if (f.capacityMin !== undefined && v.capacity_max < f.capacityMin)
      return false;
    if (f.capacityMax !== undefined && v.capacity_min > f.capacityMax)
      return false;
    if (!matchesAnyRange(f.capacityRanges, v.capacity_min, v.capacity_max))
      return false;
    if (!matchesAnyRange(f.priceRanges, v.price_min, v.price_max))
      return false;
    if (f.features?.length) {
      if (!f.features.every((feat) => v.features.includes(feat))) return false;
    }
    return true;
  });
}

export function cityFromSlug(slug: string): string | undefined {
  return CITIES.find((c) => slugifyTr(c) === slug);
}

/**
 * Bir ildeki yayınlanmış mekan sayısı.
 *
 * 81 ilin tamamı için sayfa açtığımızdan, envanteri olmayan ilin sayfası
 * arama motoruna ince içerik olarak gitmemeli. Bu sayım hem noindex kararını
 * hem de sitemap'e girip girmeyeceğini belirler.
 */
export async function getCityVenueCount(city: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return MOCK_VENUES.filter((v) => v.city === city).length;
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("venues")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .eq("city", city);

  return count ?? 0;
}

/**
 * Verilen tarihte dolu işaretlenmiş mekanların ID'leri.
 *
 * Model "dolu tarih" kaydı tutuyor: kaydı olmayan mekan o tarihi kapatmamış
 * demektir — kesin müsait olduğu anlamına gelmez. Dolayısıyla tarih filtresi
 * "müsait olanları göster" değil, "sahibinin kapattığı mekanları çıkar"
 * şeklinde çalışır. Tek bir güne bakıldığı için liste küçük kalır.
 */
async function getBlockedVenueIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  date: string
): Promise<string[]> {
  const { data } = await supabase
    .from("venue_unavailable_dates")
    .select("venue_id")
    .eq("date", date);

  return [...new Set((data ?? []).map((row) => row.venue_id as string))];
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
  if (filters.categories?.length)
    query = query.overlaps("categories", filters.categories);
  if (filters.venueTypes?.length)
    query = query.overlaps("venue_types", filters.venueTypes);
  if (filters.capacityMin !== undefined)
    query = query.gte("capacity_max", filters.capacityMin);
  if (filters.capacityMax !== undefined)
    query = query.lte("capacity_min", filters.capacityMax);
  if (filters.capacityRanges?.length) {
    const orExpr = filters.capacityRanges
      .map((r) => {
        const { min, max } = parseRangeStr(r);
        return `and(capacity_max.gte.${min},capacity_min.lte.${max})`;
      })
      .join(",");
    query = query.or(orExpr);
  }
  if (filters.priceRanges?.length) {
    const orExpr = filters.priceRanges
      .map((r) => {
        const { min, max } = parseRangeStr(r);
        return `and(price_max.gte.${min},price_min.lte.${max})`;
      })
      .join(",");
    query = query.or(orExpr);
  }
  if (filters.features?.length)
    query = query.contains("features", filters.features);

  if (filters.date) {
    const blocked = await getBlockedVenueIds(supabase, filters.date);
    if (blocked.length > 0) {
      query = query.not("id", "in", `(${blocked.join(",")})`);
    }
  }

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

// Bir mekanın onaylı yorumları
export async function getVenueReviews(
  venueId: string
): Promise<import("./types").Review[]> {
  if (!isSupabaseConfigured()) return [];
  if (venueId.startsWith("mock-")) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("venue_id", venueId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return (data as import("./types").Review[]) ?? [];
}

// Bugünden itibaren mekan sahibinin dolu işaretlediği tarihler (YYYY-MM-DD)
export async function getVenueUnavailableDates(
  venueId: string
): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  if (venueId.startsWith("mock-")) return [];
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("venue_unavailable_dates")
    .select("date")
    .eq("venue_id", venueId)
    .gte("date", today)
    .order("date", { ascending: true });
  return (data ?? []).map((d) => d.date as string);
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

export type QuoteRequest = import("./types").Lead & {
  venue: {
    id: string;
    name: string;
    slug: string;
    city: string;
    district: string;
    price_min: number;
    price_max: number;
    capacity_min: number;
    capacity_max: number;
    phone: string;
    whatsapp: string;
    avg_response_minutes: number | null;
    response_sample_count: number;
    photos: { url: string; is_cover: boolean }[] | null;
  } | null;
};

/**
 * Girişli çiftin gönderdiği teklif talepleri ve mekanların dönüşleri.
 * /tekliflerim ekranındaki karşılaştırma bu veriyle çalışır.
 */
export async function getMyQuoteRequests(): Promise<QuoteRequest[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("leads")
    .select(
      `*, venue:venues(
        id, name, slug, city, district,
        price_min, price_max, capacity_min, capacity_max,
        phone, whatsapp, avg_response_minutes, response_sample_count,
        photos:venue_photos(url, is_cover)
      )`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // migration-v9 uygulanmadan bu kolonlar yok; sayfa hata yerine boş açılır.
  if (error) return [];

  return (data as QuoteRequest[]) ?? [];
}
