/**
 * Demo (örnek) mekan verisinin gösterilip gösterilmeyeceğini belirler.
 *
 * Kural: canlı sitede demo veri ASLA görünmez. Supabase yapılandırılmamışsa
 * production'da mekan listeleri boş döner — sahte mekan yayınlamaktansa boş
 * vitrin tercih edilir. Sahte kayıtlar hem kullanıcıyı yanıltır, hem gerçek
 * işletme adları taşıdığında haksız rekabet riski doğurur, hem de arama
 * motoruna kalitesiz içerik olarak gider.
 *
 * Geliştirme ve test için `ALLOW_DEMO_DATA=true` ile açıkça açılabilir;
 * bu bayrak Supabase bağlı olsa bile demo veriyi öne alır, böylece veritabanına
 * dokunmadan arayüz denenebilir. Bayrağın açık olduğu her durumda mekan
 * sayfaları `noindex` döner (bkz. venueRobots).
 *
 * Not: Bu modül bilerek `lib/supabase/server` içinden import yapmaz — o dosya
 * `next/headers` kullandığı için sunucuya bağımlıdır. Burada yalnızca
 * NEXT_PUBLIC_ değişkenleri okunduğundan modül her yerde güvenle kullanılabilir.
 */
function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function demoDataEnabled(): boolean {
  if (process.env.ALLOW_DEMO_DATA === "true") return true;
  if (supabaseConfigured()) return false;
  return process.env.NODE_ENV !== "production";
}

/**
 * Mekan sayfalarının robots meta değeri.
 *
 * Demo veri gösterilirken sayfa dizine alınmamalı: içerik gerçek değil.
 * Önizleme dağıtımlarında da bu koruma devrede kalır.
 */
export function venueRobots() {
  return demoDataEnabled() ? { index: false, follow: false } : undefined;
}
