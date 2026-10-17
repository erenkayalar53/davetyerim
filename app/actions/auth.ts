"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";

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

/**
 * Supabase'in İngilizce hata metnini kullanıcıya anlamlı Türkçe karşılığına
 * çevirir.
 *
 * Tek bir "bir hata oluştu" mesajı hem kullanıcıyı çaresiz bırakıyor hem de
 * sorunu bizim tarafımızda görünmez kılıyordu: mail kotasının dolması,
 * yönlendirme adresinin izin listesinde olmaması ve zayıf şifre birbirinden
 * tamamen farklı sorunlar ve çözümleri de farklı.
 */
function signUpErrorMessage(raw: string): string {
  const m = raw.toLowerCase();

  if (m.includes("already registered") || m.includes("already been registered")) {
    return "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.";
  }
  if (m.includes("redirect") && m.includes("not allowed")) {
    return "Doğrulama adresi yapılandırmasında bir sorun var. Lütfen bizimle iletişime geçin.";
  }
  if (m.includes("password")) {
    return "Şifre yeterince güçlü değil. En az 8 karakter kullanın.";
  }
  if (m.includes("invalid") && m.includes("email")) {
    return "E-posta adresi geçersiz görünüyor. Lütfen kontrol edin.";
  }
  if (m.includes("signup") && m.includes("disabled")) {
    return "Yeni kayıtlar geçici olarak kapalı. Lütfen daha sonra tekrar deneyin.";
  }

  return "Kayıt sırasında bir hata oluştu, lütfen tekrar deneyin.";
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
      // Doğrulama bağlantısı /auth/callback'e dönmeli: orada oturum kurulup
      // kullanıcı rolüne göre yönlendiriliyor. Verilmezse Supabase panelindeki
      // Site URL'e düşer ve kullanıcı giriş yapmamış hâlde ana sayfada kalır.
      emailRedirectTo: `${SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    // Supabase'in hatası sunucu günlüğüne olduğu gibi yazılır: kullanıcıya
    // gösterilen metin sadeleştirildiği için, teşhis edilebilir tek yer burası.
    console.error("[signUp]", error.status, error.code, error.message);

    return { ok: false, message: signUpErrorMessage(error.message) };
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
