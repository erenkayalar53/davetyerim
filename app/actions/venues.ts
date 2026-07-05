"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { slugifyTr } from "@/lib/constants";
import type {
  MenuPackage,
  FaqItem,
  CapacityArea,
  Campaign,
} from "@/lib/types";

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
  venue_types: string[];
  categories: string[];
  features: string[];
  menu_packages: MenuPackage[];
  capacity_areas: CapacityArea[];
  faqs: FaqItem[];
  campaign: Campaign | null;
  photo_urls: string[];
}

export interface SaveVenueResult {
  ok: boolean;
  message: string;
}

function validate(input: VenueInput): string | null {
  if (!input.name || input.name.trim().length < 3)
    return "Mekan adı en az 3 karakter olmalıdır.";
  if (input.venue_types.length === 0) return "En az bir mekan tipi seçin.";
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

// Menü paketleri varsa fiyat aralığını onlardan türet (hafta içi + hafta sonu)
function priceRange(input: VenueInput): { min: number; max: number } {
  const prices = input.menu_packages
    .flatMap((p) => [p.price_weekday, p.price_weekend, p.price])
    .filter((p): p is number => typeof p === "number" && p > 0);
  if (prices.length > 0) {
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }
  return { min: input.price_min, max: input.price_max };
}

// Alt alanlar varsa toplam kapasiteyi onlardan türet
function capacityRange(input: VenueInput): { min: number; max: number } {
  if (input.capacity_areas.length > 0) {
    const mins = input.capacity_areas.map((a) => a.min).filter((n) => n > 0);
    const maxs = input.capacity_areas.map((a) => a.max).filter((n) => n > 0);
    if (mins.length && maxs.length) {
      return { min: Math.min(...mins), max: Math.max(...maxs) };
    }
  }
  return { min: input.capacity_min, max: input.capacity_max };
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

  // Sahip doğrulanmışsa mekan da doğrulanmış rozeti alır
  const { data: profile } = await supabase
    .from("profiles")
    .select("verified")
    .eq("id", user.id)
    .maybeSingle();
  const ownerVerified = Boolean(profile?.verified);

  const { min: priceMin, max: priceMax } = priceRange(input);
  const { min: capMin, max: capMax } = capacityRange(input);

  const venueData = {
    name: input.name.trim(),
    description: input.description.trim(),
    city: input.city,
    district: input.district.trim(),
    address: input.address.trim(),
    phone: input.phone.trim(),
    whatsapp: input.whatsapp.trim(),
    capacity_min: capMin,
    capacity_max: capMax,
    price_min: priceMin,
    price_max: priceMax,
    venue_type: input.venue_types[0],
    venue_types: input.venue_types,
    categories: input.categories,
    features: input.features,
    menu_packages: input.menu_packages,
    capacity_areas: input.capacity_areas,
    faqs: input.faqs,
    campaign: input.campaign,
    verified: ownerVerified,
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
