# Mekan Erişim Otomasyonu

Şehir şehir düğün mekanı bulur, sitelerinden iletişim e-postasını çıkarır, Türkçe
tanışma mesajı hazırlar ve **senin onayından sonra** kademeli olarak gönderir.

Panel: `/admin/outreach`

---

## Akış

```
keşif            zenginleştirme        taslak            onay             gönderim
(kaynak API)  →  (mekanın sitesi)  →  (şablon)   →   (sen, panelde)  →  (Resend, kademeli)
   new              ready              drafted          approved            contacted
```

Her adım bağımsız ve **idempotent**: cron yarıda kesilirse bir sonraki tur kaldığı
yerden devam eder. Aynı mekan iki kez eklenmez (`dedupe_key`), aynı mesaj iki kez
gönderilmez (`status='sending'` ile kilitlenir).

---

## Kurulum

### 1. Veritabanı

Supabase SQL Editor'de çalıştır:

```
supabase/migration-v8.sql
```

Altı tablo oluşur: `outreach_prospects`, `outreach_messages`, `outreach_events`,
`outreach_suppression`, `outreach_runs`, `outreach_state`. Hepsi admin-only RLS'li.

### 2. Ortam değişkenleri

`.env.example` içindeki outreach bölümünü `.env.local`'e (ve Vercel'e) kopyala.

**Zorunlu:**

| Değişken | Nereden |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` |
| `CRON_SECRET` | `openssl rand -base64 32` |

> `SUPABASE_SERVICE_ROLE_KEY` RLS'i baypas eder. Asla `NEXT_PUBLIC_` ile
> başlamamalı ve asla git'e girmemeli. `lib/outreach/admin-client.ts` dosyasındaki
> `server-only` importu, bu anahtarın client bundle'a sızmasını derleme
> zamanında engeller.

**Keşif için** (biri yeterli):
- `GOOGLE_PLACES_API_KEY` — Google Cloud → Places API (New) etkinleştir
- ya da hiçbiri: panelden elle liste yapıştır

**Gönderim için:**
- `RESEND_API_KEY`
- `OUTREACH_FROM_EMAIL` — Resend'de **doğrulanmış** domain olmalı

### 3. Resend domain doğrulaması

`davetyerim.com` domaini alınana kadar mail gönderimi yapma. Domain alındıktan sonra:

1. Resend → Domains → Add Domain → `davetyerim.com`
2. Verilen **SPF**, **DKIM** ve **DMARC** kayıtlarını DNS'e ekle
3. Doğrulama yeşile dönene kadar bekle

Bu üç kayıt olmadan gönderilen toplu mail Gmail'de doğrudan spam'e düşer.

### 4. Webhook (önerilir)

Resend → Webhooks → Add Endpoint:

```
https://davetyerim.com/api/outreach/webhook
```

Üretilen imza anahtarını `RESEND_WEBHOOK_SECRET`'a yaz. Bounce ve spam şikayeti
alan adresler otomatik kara listeye girer — gönderen itibarını koruyan en
önemli mekanizma budur.

### 5. Cron

`vercel.json` her gün 08:00 UTC'de `/api/cron/outreach` çağırır. Vercel bu isteğe
`Authorization: Bearer $CRON_SECRET` başlığını kendisi ekler.

> **Vercel Hobby planında cron günde 1 kez çalışır.** Daha sık istiyorsan ya Pro'ya
> geç ya da cron-job.org gibi bir dış zamanlayıcıdan şu adresi çağır:
> `https://davetyerim.com/api/cron/outreach?key=CRON_SECRET`

---

## İlk çalıştırma (güvenli sıra)

1. `OUTREACH_DRY_RUN=true` bırak — sistem taslak üretir, mail göndermez.
2. Panelden **"Mekan ara"** → adaylar `new` olarak düşer.
3. **"E-posta çıkar"** → siteler taranır, bulunanlar `ready` olur.
4. **"Taslak üret"** → mesajlar onay kuyruğuna girer.
5. Taslakları oku. Metni beğenmezsen **"Mesajı düzenle"** ile değiştir.
6. Kendi adresine bir test gönderimi yap (listeye elle kendi mailini ekle).
7. Her şey doğruysa `OUTREACH_DRY_RUN=false` yap ve az sayıda mesajı onayla.

Onayladığın mesajlar 4'er dakika arayla sıraya girer; cron her turda en fazla
`OUTREACH_SEND_PER_RUN` (varsayılan 8) tanesini gönderir.

---

## Veri kaynakları

Kaynaklar eklenti mimarisiyle yazıldı (`lib/outreach/sources/`). Çekirdek hiçbir
kaynağa bağımlı değil — yenisini eklemek için `ProspectSourceAdapter` arayüzünü
uygulayıp `sources/index.ts`'e eklemek yeterli.

### `google_places` (varsayılan)

Google Places API (New) Text Search. Resmi, kararlı, kullanım şartlarına uygun.
**E-posta döndürmez** — sadece ad/adres/telefon/website verir; e-postayı
`email-finder.ts` mekanın kendi sitesinden çıkarır.

### `directory`

Jenerik dizin adaptörü. Hedefe özel kazıyıcı **değildir**: yalnızca sayfaya gömülü
Schema.org JSON-LD verisini okur (`LocalBusiness`, `EventVenue`, `ItemList`),
robots.txt'e uyar ve istekler arasında bekler.

```
OUTREACH_DIRECTORY_URL=https://ornek-dizin.com/dugun-salonlari/{city}?sayfa={page}
OUTREACH_DIRECTORY_PAGES=2
```

> **Sorumluluk notu:** Üçüncü taraf bir dizinden toplu veri çekmek o sitenin
> kullanım şartlarına, FSEK m.6/11 (veritabanı hakkı) ve TTK m.55 (haksız
> rekabet) hükümlerine takılabilir. Ayrıca bu dizinler mekanın e-postasını
> genelde göstermez — oradan en fazla isim/şehir çıkar, e-posta için yine site
> taraması gerekir. Yalnızca izinli olduğun kaynaklar için etkinleştir.

### Elle liste

Panelden yapıştır — her satır `Ad;Şehir;Telefon;Website;E-posta`. E-posta boşsa
sistem siteden kendisi bulmaya çalışır.

---

## E-posta bulma nasıl çalışıyor

`lib/outreach/email-finder.ts`:

1. `robots.txt` okunur; kapalı yollar gezilmez.
2. Ana sayfa açılır, iletişim/hakkımızda linkleri kuyruğa alınır (en fazla 4 sayfa).
3. Her sayfada `mailto:` linkleri, düz metin adresler ve `info [at] mekan.com`
   gibi gizlemeler taranır.
4. **Cloudflare email protection** çözülür — Türk işletme sitelerinde çok yaygın;
   çözülmezse adreslerin önemli kısmı kaçar.
5. Adaylar puanlanır: aynı domain +14, `info@`/`iletisim@` +6, iletişim sayfası +4,
   `noreply@` −40, başka firmanın domaini −12.
6. En yüksek puanlı adres seçilir; puanı panelde "güven %" olarak görünür.

İstekler arasında `OUTREACH_CRAWL_DELAY_MS` (1.2sn) beklenir ve crawler kendini
`DavetYerimBot/1.0` olarak tanıtır.

---

## KVKK / İYS uyumu

Kurulan sistemin uyum tarafında yaptıkları:

- Her mailde **abonelik iptal bağlantısı** (HMAC imzalı, `/api/outreach/abonelik-iptal`)
- **`List-Unsubscribe` + tek tık POST** başlıkları — Gmail/Outlook toplu gönderimde bunu şart koşuyor
- İptal edilen, bounce alan ve şikayet edilen adresler kalıcı **kara listede**;
  her gönderim öncesi tekrar kontrol edilir
- Mailin altında iletinin neden gönderildiğini açıklayan not

Senin yapman gerekenler:

- Gönderim **yalnızca tacir/esnaf işletmelere** olmalı. 6563 sayılı kanun, tacir ve
  esnafa önceden onay olmadan ticari elektronik ileti göndermeye izin verir; ret
  hakkı saklıdır ve ret gelince derhal durdurulmalıdır (sistem bunu otomatik yapıyor).
- **Şahıslara asla gönderme.** Kişisel bir adres (ad.soyad@gmail.com) çıkarsa
  panelden "Atla" ya da "Kara listeye al" de.
- Hacim büyüdüğünde İYS (İleti Yönetim Sistemi) kaydını değerlendir.

---

## Ayarlar

| Değişken | Varsayılan | Ne yapar |
|---|---|---|
| `OUTREACH_DRY_RUN` | `false` | `true` iken hiç mail göndermez |
| `OUTREACH_ENRICH_PER_RUN` | 10 | Tur başına taranacak site |
| `OUTREACH_DRAFT_PER_RUN` | 20 | Tur başına üretilecek taslak |
| `OUTREACH_SEND_PER_RUN` | 8 | Tur başına gönderilecek mail |
| `OUTREACH_CRAWL_DELAY_MS` | 1200 | Aynı siteye istekler arası bekleme |
| `OUTREACH_MAX_PAGES_PER_SITE` | 4 | Bir sitede açılacak en fazla sayfa |
| `OUTREACH_RUN_BUDGET_MS` | 45000 | Bir turun süre bütçesi (Vercel limiti 60sn) |
| `OUTREACH_CITIES` | 12 şehir | Taranacak şehirler |
| `OUTREACH_SEARCH_TERMS` | 6 terim | Arama sorguları |

---

## Mesaj şablonları

`lib/outreach/templates.ts` — iki adım var:

- **`intro`** (1. mesaj): kısa tanışma, komisyon almadığımızı vurgular, tek CTA
- **`follow_up`** (2. mesaj): hatırlatma, "ilgilenmiyorsanız bir daha yazmayacağım"

Şablonlar Türkçe ünlü uyumuna göre ek koyar (`İstanbul'daki`, `Gaziantep'teki`).
HTML sürümü kasıtlı olarak sade: görsel yok, tablo yok, **takip pikseli yok** —
sadelik spam filtresinden geçmenin en kolay yolu.

Metni her taslakta panelden tek tek düzenleyebilirsin; kalıcı değişiklik için
şablon dosyasını düzenle.

---

## Sorun giderme

| Belirti | Sebep |
|---|---|
| Panel "Sistem henüz kurulmadı" diyor | `SUPABASE_SERVICE_ROLE_KEY` yok |
| "Mekan ara" hiçbir şey bulmuyor | `GOOGLE_PLACES_API_KEY` yok ya da Places API (New) etkin değil |
| Adaylar `no_email` oluyor | Sitede e-posta yok ya da JS ile yükleniyor — telefonla ulaş |
| Cron 401 dönüyor | `CRON_SECRET` Vercel'de tanımlı değil |
| Mailler spam'e düşüyor | SPF/DKIM/DMARC eksik, ya da tur başına gönderim çok yüksek |
| Taslak üretilemiyor | `OUTREACH_UNSUBSCRIBE_SECRET` ve `CRON_SECRET` ikisi de boş |

Son 5 cron turunun özeti panelin üstünde; ayrıntısı `outreach_runs` tablosunda.
