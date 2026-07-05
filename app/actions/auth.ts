"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface AuthFormState {
  ok: boolean | null;
  message: string;
}

const DEMO_MESSAGE =
  "Demo modu: Giriş için önce Supabase projenizi bağlayın (.env.local dosyasına NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ekleyin).";

export async function signIn(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return { ok: false, message: DEMO_MESSAGE };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "E-posta ve şifre zorunludur." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, message: "E-posta veya şifre hatalı." };
  }

  let destination = "/";
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profile?.role === "owner" || profile?.role === "admin") {
      destination = "/panel";
    }
  }

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return { ok: false, message: DEMO_MESSAGE };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const accountType =
    String(formData.get("account_type") ?? "user") === "owner"
      ? "owner"
      : "user";

  if (!fullName || fullName.length < 3) {
    return { ok: false, message: "Lütfen adınızı ve soyadınızı girin." };
  }
  if (!email) {
    return { ok: false, message: "E-posta adresi zorunludur." };
  }
  if (password.length < 8) {
    return { ok: false, message: "Şifre en az 8 karakter olmalıdır." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone, account_type: accountType },
    },
  });

  if (error) {
    return {
      ok: false,
      message:
        error.message === "User already registered"
          ? "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin."
          : "Kayıt sırasında bir hata oluştu, lütfen tekrar deneyin.",
    };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect(accountType === "owner" ? "/mekan-sahibi-ol" : "/");
  }

  return {
    ok: true,
    message:
      "Kayıt başarılı! E-posta adresinize gelen onay bağlantısına tıklayın, ardından giriş yapın.",
  };
}

export async function signOut() {
  if (!isSupabaseConfigured()) redirect("/");
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
