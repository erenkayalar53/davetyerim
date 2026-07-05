"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";

export interface OwnerApplicationState {
  ok: boolean | null;
  message: string;
}

export async function applyForOwner(
  _prev: OwnerApplicationState,
  formData: FormData
): Promise<OwnerApplicationState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Bu işlem için Supabase bağlantısı gerekir." };
  }

  const businessName = String(formData.get("business_name") ?? "").trim();
  const businessPhone = String(formData.get("business_phone") ?? "").trim();
  const businessCity = String(formData.get("business_city") ?? "").trim();
  const taxId = String(formData.get("tax_id") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (businessName.length < 2) {
    return { ok: false, message: "İşletme adını girin." };
  }
  if (businessPhone.replace(/\D/g, "").length < 10) {
    return { ok: false, message: "Geçerli bir işletme telefonu girin." };
  }
  if (!businessCity) {
    return { ok: false, message: "Şehir seçin." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Oturumunuz sonlanmış, tekrar giriş yapın." };
  }

  const { error } = await supabase.rpc("apply_for_owner", {
    p_business_name: businessName,
    p_business_phone: businessPhone,
    p_business_city: businessCity,
    p_tax_id: taxId,
    p_note: note,
  });

  if (error) {
    return { ok: false, message: "Başvuru gönderilemedi, tekrar deneyin." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/mekan-sahibi-ol");
  return {
    ok: true,
    message:
      "Başvurunuz alındı! Ekibimiz işletmenizi inceledikten sonra hesabınız mekan sahibi olarak aktifleştirilecek.",
  };
}

async function requireAdmin() {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "admin") {
    throw new Error("Bu işlem için admin yetkisi gerekli");
  }
}

export async function approveOwner(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("user_id"));
  const supabase = await createClient();
  await supabase.rpc("approve_owner", { p_user: userId });
  revalidatePath("/admin");
}

export async function rejectOwner(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("user_id"));
  const supabase = await createClient();
  await supabase.rpc("reject_owner", { p_user: userId });
  revalidatePath("/admin");
}
