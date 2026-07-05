"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";

export interface OwnerApplicationInput {
  business_name: string;
  business_phone: string;
  business_city: string;
  tax_id: string;
  note: string;
  tax_document_path: string;
  license_document_path: string;
}

export interface OwnerApplicationResult {
  ok: boolean;
  message: string;
}

export async function applyForOwner(
  input: OwnerApplicationInput
): Promise<OwnerApplicationResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Bu işlem için Supabase bağlantısı gerekir." };
  }

  const businessName = input.business_name.trim();
  const businessPhone = input.business_phone.trim();
  const businessCity = input.business_city.trim();

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
    p_tax_id: input.tax_id.trim(),
    p_note: input.note.trim(),
    p_tax_doc: input.tax_document_path,
    p_license_doc: input.license_document_path,
  });

  if (error) {
    return { ok: false, message: "Başvuru gönderilemedi, tekrar deneyin." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/mekan-sahibi-ol");
  return {
    ok: true,
    message:
      "Başvurunuz alındı! Ekibimiz işletmenizi ve belgelerinizi inceledikten sonra hesabınız mekan sahibi olarak aktifleştirilecek.",
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
