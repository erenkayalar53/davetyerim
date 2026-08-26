"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface AvailabilityResult {
  ok: boolean;
  message: string;
}

export async function toggleDateAvailability(
  venueId: string,
  date: string,
  markUnavailable: boolean
): Promise<AvailabilityResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Demo modu: Takvim için Supabase bağlantısı gerekli.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Oturumunuz sonlanmış, tekrar giriş yapın." };
  }

  if (markUnavailable) {
    const { error } = await supabase
      .from("venue_unavailable_dates")
      .upsert(
        { venue_id: venueId, date },
        { onConflict: "venue_id,date", ignoreDuplicates: true }
      );
    if (error) {
      return { ok: false, message: "Tarih işaretlenemedi, tekrar deneyin." };
    }
  } else {
    const { error } = await supabase
      .from("venue_unavailable_dates")
      .delete()
      .eq("venue_id", venueId)
      .eq("date", date);
    if (error) {
      return { ok: false, message: "Tarih güncellenemedi, tekrar deneyin." };
    }
  }

  const { data: venue } = await supabase
    .from("venues")
    .select("slug")
    .eq("id", venueId)
    .maybeSingle();
  if (venue?.slug) revalidatePath(`/mekan/${venue.slug}`);
  revalidatePath(`/panel/mekan/${venueId}`);

  return {
    ok: true,
    message: markUnavailable
      ? "Tarih dolu olarak işaretlendi."
      : "Tarih müsait olarak işaretlendi.",
  };
}
