import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * E-posta doğrulama ve şifre sıfırlama bağlantılarının döndüğü nokta.
 *
 * Supabase iki farklı biçimde geri gönderebiliyor:
 *  - `?code=...`        → PKCE akışı (@supabase/ssr varsayılanı)
 *  - `?token_hash=&type=` → e-posta bağlantısı (OTP) akışı
 *
 * Bu rota olmadan kullanıcı doğrulama linkine tıkladığında e-postası
 * onaylanıyor ama siteye oturum açmamış olarak dönüyordu; adres çubuğunda
 * anlamsız bir parametreyle ana sayfada kalıp tekrar giriş yapmak zorundaydı.
 *
 * Supabase panelinde Site URL ve Redirect URLs ayarlarının canlı adrese
 * işaret etmesi gerekir; aksi hâlde bağlantı buraya hiç ulaşmaz.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  // Açık yönlendirme olmaması için yalnızca site içi göreli yollara izin ver.
  const rawNext = searchParams.get("next") ?? "";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/giris`);
  }

  const supabase = await createClient();
  let verified = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "recovery" | "invite" | "email_change",
      token_hash: tokenHash,
    });
    verified = !error;
  }

  if (!verified) {
    return NextResponse.redirect(
      `${origin}/giris?hata=dogrulama-basarisiz`
    );
  }

  // Şifre sıfırlama akışında kullanıcı panele değil şifre belirleme
  // ekranına gitmeli; o ekran gelene kadar girişe yönlendiriyoruz.
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/giris?durum=sifre-sifirlandi`);
  }

  if (next) return NextResponse.redirect(`${origin}${next}`);

  // Mekan sahibi başvurusu yapan kullanıcı panele, diğerleri mekan
  // keşfine düşsün.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, owner_status")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "owner" || profile?.role === "admin") {
      return NextResponse.redirect(`${origin}/panel`);
    }

    // "Mekan Sahibi" seçerek kayıt olan kullanıcı doğrulamadan sonra henüz
    // `user` rolünde: sahiplik admin onaylı başvuruyla kazanılıyor. Mekan
    // listesine düşerse başvuru sayfasını kendi bulmak zorunda kalır, çoğu
    // da bulmaz. Başvurusu yoksa doğrudan başvuru formuna gönderiyoruz.
    const wantsOwner = user.user_metadata?.account_type === "owner";
    const notAppliedYet =
      !profile?.owner_status || profile.owner_status === "none";

    if (wantsOwner && notAppliedYet) {
      return NextResponse.redirect(`${origin}/mekan-sahibi-ol`);
    }
  }

  return NextResponse.redirect(`${origin}/mekanlar`);
}
