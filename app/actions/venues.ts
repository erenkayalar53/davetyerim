"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { slugifyTr } from "@/lib/constants";

export interface VenueInput {
  id?: string;
  name: string;
  description: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  whatsapp: string;
  capacity_min: number;
  capacity_max: number;
  price_min: number;
  price_max: number;
  venue_type: string;
  categories: string[];
  features: string[];
  photo_urls: string[];
}

export interface SaveVenueResult {
  ok: boolean;
  message: string;
}

function validate(input: VenueInput): string | null {
  if (!input.name || input.name.trim().length < 3)
    return "Mekan adı en az 3 karakter olmalıdır.";
  if (!input.venue_type) return "Mekan tipi seçin.";
  if (!input.city) return "Şehir seçin.";
  if (!input.description || input.description.trim().length < 30)
    return "Açıklama en az 30 karakter olmalıdır.";
  if (input.categories.length === 0)
    return "En az bir etkinlik türü seçin.";
  if (input.capacity_min <= 0 || input.capacity_max < input.capacity_min)
    return "Geçerli bir kapasite aralığı girin.";
  if (input.price_min <= 0 || input.price_max < input.price_min)
    return "Geçerli bir kişi başı fiyat aralığı girin.";
  if (!input.phone || input.phone.replace(/\D/g, "").length < 10)
    return "Geçerli bir telefon numarası girin.";
  return null;
}

export async function saveVenue(input: VenueInput): Promise<SaveVenueResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message:
        "Demo modu: Mekan kaydı için Supabase bağlantısı gerekli. (.env.local dosyasını yapılandırın.)",
    };
  }

  const error = validate(input);
  if (error) return { ok: false, message: error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Oturumunuz sonlanmış, tekrar giriş yapın." };
  }

  const venueData = {
    name: input.name.trim(),
    description: input.description.trim(),
    city: input.city,
    district: input.district.trim(),
    address: input.address.trim(),
    phone: input.phone.trim(),
    whatsapp: input.whatsapp.trim(),
    capacity_min: input.capacity_min,
    capacity_max: input.capacity_max,
    price_min: input.price_min,
    price_max: input.price_max,
    venue_type: input.venue_type,
    categories: input.categories,
    features: input.features,
  };

  let venueId = input.id;

  if (venueId) {
    const { error: updateError } = await supabase
      .from("venues")
      .update(venueData)
      .eq("id", venueId)
      .eq("owner_id", user.id);
    if (updateError) {
      return { ok: false, message: "Güncelleme başarısız, tekrar deneyin." };
    }
  } else {
    const baseSlug = slugifyTr(input.name);
    const slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    const { data, error: insertError } = await supabase
      .from("venues")
      .insert({
        ...venueData,
        owner_id: user.id,
        slug,
        status: "pending",
      })
      .select("id")
      .single();
    if (insertError || !data) {
      return { ok: false, message: "Kayıt başarısız, tekrar deneyin." };
    }
    venueId = data.id as string;
  }

  if (input.photo_urls.length > 0) {
    const { count } = await supabase
      .from("venue_photos")
      .select("*", { count: "exact", head: true })
      .eq("venue_id", venueId);
    const existing = count ?? 0;

    const { error: photoError } = await supabase.from("venue_photos").insert(
      input.photo_urls.map((url, i) => ({
        venue_id: venueId,
        url,
        sort_order: existing + i,
        is_cover: existing === 0 && i === 0,
      }))
    );
    if (photoError) {
      return {
        ok: false,
        message: "Mekan kaydedildi ancak fotoğraflar yüklenemedi.",
      };
    }
  }

  revalidatePath("/panel");
  revalidatePath("/mekanlar");
  return {
    ok: true,
    message: input.id
      ? "Mekan bilgileri güncellendi."
      : "Mekanınız alındı! Ekibimiz onayladıktan sonra yayına girecek.",
  };
}
