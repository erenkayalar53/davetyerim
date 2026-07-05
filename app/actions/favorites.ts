"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface FavoriteResult {
  ok: boolean;
  favorited: boolean;
  needsAuth?: boolean;
  message?: string;
}

export async function toggleFavorite(
  venueId: string
): Promise<FavoriteResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      favorited: false,
      message: "Favoriler için giriş yapmanız gerekir.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, favorited: false, needsAuth: true };
  }

  const { data: existing } = await supabase
    .from("favorites")
    .select("venue_id")
    .eq("user_id", user.id)
    .eq("venue_id", venueId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("venue_id", venueId);
    revalidatePath("/favorilerim");
    return { ok: true, favorited: false };
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, venue_id: venueId });

  if (error) {
    return { ok: false, favorited: false, message: "Bir hata oluştu." };
  }

  revalidatePath("/favorilerim");
  return { ok: true, favorited: true };
}

