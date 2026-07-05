# davetyerim.com

Türkiye için etkinlik mekanı marketplace'i — düğün, nişan, kına, sünnet, doğum günü, davet ve kurumsal etkinlik mekanları. Next.js 16 + Supabase.

## Özellikler

- **Mekan keşfi:** şehir, kategori, mekan tipi, kapasite, kişi başı fiyat ve 15 mekan özelliğine göre filtreleme
- **Mekan detayı:** galeri, kişi başı fiyat, kapasite, özellikler, harita, ücretsiz teklif formu
- **Mekan sahibi paneli:** kayıt/giriş, 5 adımlı mekan ekleme sihirbazı, fotoğraf yükleme, gelen teklif istekleri
- **Admin paneli:** onay kuyruğu, Premium plan yönetimi, vitrin kontrolü
- **Gelir modeli:** komisyonsuz aylık abonelik (Free / Premium)
- **SEO:** SSR, şehir bazlı landing sayfaları, schema.org JSON-LD, dinamik sitemap

## Kurulum

```bash
npm install
npm run dev
```

Supabase bağlanmadan da site **demo modunda** çalışır (21 örnek mekan, salt okunur). Panel, kayıt ve teklif kaydı için Supabase gerekir.

## Supabase Kurulumu (5 dakika)

1. [supabase.com](https://supabase.com) üzerinde ücretsiz proje oluşturun.
2. **SQL Editor**'de sırasıyla çalıştırın:
   - `supabase/migration.sql` (tablolar, RLS, storage bucket)
   - `supabase/seed.sql` (21 örnek mekan — isteğe bağlı)
3. **Project Settings → API**'den anahtarları alın ve kopyalayın:
   ```bash
   cp .env.example .env.local
   # NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini doldurun
   ```
4. Sunucuyu yeniden başlatın: `npm run dev`

### Admin hesabı oluşturma

1. Siteden normal şekilde kayıt olun (`/kayit`).
2. Supabase SQL Editor'de:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'sizin@mailiniz.com');
   ```
3. `/admin` adresine gidin — onay kuyruğu ve plan yönetimi oradadır.

## Yapı

```
app/                  # Sayfalar (App Router)
  mekanlar/           # Listeleme + [sehir] SEO landing
  mekan/[slug]/       # Mekan detayı
  panel/              # Mekan sahibi paneli + sihirbaz
  admin/              # Admin onay/plan paneli
  actions/            # Server Actions (auth, venues, leads, admin)
components/           # UI bileşenleri
lib/                  # Veri katmanı, tipler, sabitler, Supabase istemcileri
supabase/             # migration.sql + seed.sql
scripts/              # generate-seed.mjs (seed.sql üretici)
```

## Deploy (Vercel)

1. Repoyu GitHub'a itin, Vercel'de import edin.
2. Environment Variables kısmına iki Supabase anahtarını ekleyin.
3. `lib/constants.ts` içindeki `SITE_URL` üretim alan adınızla eşleşmeli (davetyerim.com).

## Yol Haritası (Faz 2)

- iyzico ile online Premium abonelik ödemesi
- Kullanıcı yorumları ve puanlama
- Müsaitlik takvimi
- Blog / SEO içerik motoru
- Mekan karşılaştırma
