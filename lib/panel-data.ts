import { createClient, isSupabaseConfigured } from "./supabase/server";
import type { Lead, Venue, VenuePhoto } from "./types";

type VenueRow = Omit<Venue, "photos"> & { photos: VenuePhoto[] | null };

function normalize(row: VenueRow): Venue {
  return {
    ...row,
    photos: (row.photos ?? []).sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function getMyVenues(): Promise<Venue[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("venues")
    .select("*, photos:venue_photos(*)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return ((data as VenueRow[]) ?? []).map(normalize);
}

// Mekan sahibinin mekanları için favori sayıları: { venue_id: count }
export async function getVenueFavoriteCounts(
  venueIds: string[]
): Promise<Record<string, number>> {
  if (!isSupabaseConfigured() || venueIds.length === 0) return {};
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("venue_id")
    .in("venue_id", venueIds);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = row.venue_id as string;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

export async function getVenueForOwner(id: string): Promise<Venue | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("venues")
    .select("*, photos:venue_photos(*)")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  return data ? normalize(data as VenueRow) : null;
}

export type LeadWithVenue = Lead & { venue: { name: string } | null };

export async function getMyLeads(): Promise<LeadWithVenue[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: venues } = await supabase
    .from("venues")
    .select("id")
    .eq("owner_id", user.id);

  const venueIds = (venues ?? []).map((v) => v.id);
  if (venueIds.length === 0) return [];

  const { data } = await supabase
    .from("leads")
    .select("*, venue:venues(name)")
    .in("venue_id", venueIds)
    .order("created_at", { ascending: false });

  return (data as LeadWithVenue[]) ?? [];
}
