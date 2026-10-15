"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface LeadFormState {
  ok: boolean | null;
  message: string;
}

interface LeadInput {
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  guestCount: number | null;
  category: string;
  message: string;
}

function readLeadInput(formData: FormData): LeadInput {
  const guestCount = Number(formData.get("guest_count"));
  return {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    eventDate: String(formData.get("event_date") ?? ""),
    guestCount:
      Number.isFinite(guestCount) && guestCount > 0 ? guestCount : null,
    category: String(formData.get("category") ?? ""),
    message: String(formData.get("message") ?? "").trim(),
  };
}

function validateContact(input: Pick<LeadInput, "name" | "phone">): string | null {
  if (!input.name || input.name.length < 2) return "Lütfen adınızı girin.";
  if (!input.phone || input.phone.replace(/\D/g, "").length < 10) {
    return "Lütfen geçerli bir telefon numarası girin.";
  }
  return null;
}

/**
 * Mekan sahibinin dolu işaretlediği tarihlere talep gitmez.
 * İstemci tarafındaki kontrol atlatılabilir, asıl engel burasıdır.
 */
async function findUnavailableVenues(
  supabase: Awaited<ReturnType<typeof createClient>>,
  venueIds: string[],
  eventDate: string
): Promise<Set<string>> {
  if (!eventDate || venueIds.length === 0) return new Set();

  const { data } = await supabase
    .from("venue_unavailable_dates")
    .select("venue_id")
    .in("venue_id", venueIds)
    .eq("date", eventDate);

  return new Set((data ?? []).map((row) => row.venue_id as string));
}

export async function createLead(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const venueId = String(formData.get("venue_id") ?? "");
  const input = readLeadInput(formData);

  const invalid = validateContact(input);
  if (invalid) return { ok: false, message: invalid };
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

  const unavailable = await findUnavailableVenues(
    supabase,
    [venueId],
    input.eventDate
  );
  if (unavailable.has(venueId)) {
    return {
      ok: false,
      message:
        "Seçtiğiniz tarih bu mekanda dolu. Lütfen takvimden müsait bir tarih seçin.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("leads").insert({
    venue_id: venueId,
    user_id: user?.id ?? null,
    kind: "quote",
    name: input.name,
    phone: input.phone,
    email: input.email,
    event_date: input.eventDate || null,
    guest_count: input.guestCount,
    category: input.category,
    message: input.message,
  });

  if (error) {
    return { ok: false, message: "Bir hata oluştu, lütfen tekrar deneyin." };
  }

  if (user) revalidatePath("/tekliflerim");

  return {
    ok: true,
    message:
      "Teklif isteğiniz mekan sahibine iletildi! En kısa sürede sizinle iletişime geçilecek.",
  };
}

/**
 * Geri arama talebi: yalnızca ad ve telefon.
 *
 * Uzun formu doldurmak istemeyen kullanıcıyı kaçırmamak için var. Aynı
 * leads tablosuna düşer, mekan sahibi panelinde "Geri arama" olarak görünür.
 */
export async function createCallbackRequest(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const venueId = String(formData.get("venue_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const invalid = validateContact({ name, phone });
  if (invalid) return { ok: false, message: invalid };
  if (!venueId) {
    return { ok: false, message: "Mekan bilgisi eksik, sayfayı yenileyin." };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      message: "Numaranız alındı! (Demo modu — gerçek gönderim yapılmadı.)",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("leads").insert({
    venue_id: venueId,
    user_id: user?.id ?? null,
    kind: "callback",
    name,
    phone,
    email: "",
    message: "Geri arama talebi",
  });

  if (error) {
    return { ok: false, message: "Bir hata oluştu, lütfen tekrar deneyin." };
  }

  if (user) revalidatePath("/tekliflerim");

  return {
    ok: true,
    message: "Numaranız iletildi. Mekan en kısa sürede sizi arayacak.",
  };
}

/**
 * Favorilerden toplu teklif: tek form, birden çok mekan.
 *
 * Dolu tarihli mekanlar sessizce atlanmaz — kaç mekana gittiği ve hangisinin
 * neden atlandığı kullanıcıya söylenir, yoksa gönderdiğini sandığı bir talep
 * için günlerce bekler.
 */
export async function createBatchLeads(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const venueIds = formData
    .getAll("venue_ids")
    .map((v) => String(v))
    .filter(Boolean);

  const input = readLeadInput(formData);

  const invalid = validateContact(input);
  if (invalid) return { ok: false, message: invalid };
  if (venueIds.length === 0) {
    return { ok: false, message: "En az bir mekan seçin." };
  }
  if (venueIds.length > 15) {
    return {
      ok: false,
      message:
        "Tek seferde en fazla 15 mekana talep gönderebilirsiniz. Listeyi biraz daraltın.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      message: `${venueIds.length} mekana talebiniz iletildi! (Demo modu)`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const unavailable = await findUnavailableVenues(
    supabase,
    venueIds,
    input.eventDate
  );
  const targets = venueIds.filter((id) => !unavailable.has(id));

  if (targets.length === 0) {
    return {
      ok: false,
      message:
        "Seçtiğiniz mekanların tamamı bu tarihte dolu. Farklı bir tarih deneyin.",
    };
  }

  const batchId = crypto.randomUUID();

  const { error } = await supabase.from("leads").insert(
    targets.map((venueId) => ({
      venue_id: venueId,
      user_id: user?.id ?? null,
      batch_id: batchId,
      kind: "quote",
      name: input.name,
      phone: input.phone,
      email: input.email,
      event_date: input.eventDate || null,
      guest_count: input.guestCount,
      category: input.category,
      message: input.message,
    }))
  );

  if (error) {
    return { ok: false, message: "Bir hata oluştu, lütfen tekrar deneyin." };
  }

  revalidatePath("/tekliflerim");

  const skipped = venueIds.length - targets.length;
  return {
    ok: true,
    message:
      skipped > 0
        ? `${targets.length} mekana talebiniz iletildi. ${skipped} mekan seçtiğiniz tarihte dolu olduğu için atlandı.`
        : `${targets.length} mekana talebiniz iletildi! Gelen yanıtları “Tekliflerim” sayfasından karşılaştırabilirsiniz.`,
  };
}

/** Çift, sonuçlanan bir talebi listeden düşürür. */
export async function closeLead(formData: FormData) {
  if (!isSupabaseConfigured()) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Doğrudan update yerine RPC: çiftin leads tablosunda UPDATE yetkisi yok,
  // yalnızca kendi talebini kapatabiliyor (bkz. migration-v9).
  await supabase.rpc("close_my_lead", { lead_id: id });

  revalidatePath("/tekliflerim");
}
