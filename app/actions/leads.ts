"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface LeadFormState {
  ok: boolean | null;
  message: string;
}

export async function createLead(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const venueId = String(formData.get("venue_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const eventDate = String(formData.get("event_date") ?? "");
  const guestCount = Number(formData.get("guest_count"));
  const category = String(formData.get("category") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (!name || name.length < 2) {
    return { ok: false, message: "Lütfen adınızı girin." };
  }
  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return { ok: false, message: "Lütfen geçerli bir telefon numarası girin." };
  }
  if (!venueId) {
    return { ok: false, message: "Mekan bilgisi eksik, sayfayı yenileyin." };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      message:
        "Teklif isteğiniz alındı! (Demo modu — Supabase bağlandığında istekler mekan sahibine iletilir.)",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    venue_id: venueId,
    name,
    phone,
    email,
    event_date: eventDate || null,
    guest_count: Number.isFinite(guestCount) && guestCount > 0 ? guestCount : null,
    category,
    message,
  });

  if (error) {
    return {
      ok: false,
      message: "Bir hata oluştu, lütfen tekrar deneyin.",
    };
  }

  return {
    ok: true,
    message:
      "Teklif isteğiniz mekan sahibine iletildi! En kısa sürede sizinle iletişime geçilecek.",
  };
}
