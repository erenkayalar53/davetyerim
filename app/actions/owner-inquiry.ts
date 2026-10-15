"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface OwnerInquiryState {
  ok: boolean | null;
  message: string;
}

export async function createOwnerInquiry(
  _prevState: OwnerInquiryState,
  formData: FormData
): Promise<OwnerInquiryState> {
  const venueName = String(formData.get("venue_name") ?? "").trim();
  const contactName = String(formData.get("contact_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const venueType = String(formData.get("venue_type") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!venueName || venueName.length < 2) {
    return { ok: false, message: "Lütfen mekanınızın adını girin." };
  }
  if (!contactName || contactName.length < 2) {
    return { ok: false, message: "Lütfen yetkili adını girin." };
  }
  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return { ok: false, message: "Lütfen geçerli bir telefon numarası girin." };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      message:
        "Başvurunuz alındı! (Demo modu — Supabase bağlandığında başvurular ekibimize iletilir.)",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("owner_inquiries").insert({
    venue_name: venueName,
    contact_name: contactName,
    phone,
    email,
    city,
    venue_type: venueType,
    message,
  });

  if (error) {
    console.error("[owner-inquiry] insert failed:", error);
    return { ok: false, message: "Bir hata oluştu, lütfen tekrar deneyin." };
  }

  return {
    ok: true,
    message:
      "Başvurunuz bize ulaştı. Ekibimiz en geç bir iş günü içinde sizi arayacak ve mekanınıza uygun paketi birlikte belirleyeceğiz.",
  };
}
