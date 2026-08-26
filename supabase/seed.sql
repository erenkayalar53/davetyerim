-- davetyerim.com örnek mekan verisi (otomatik üretildi)
-- migration.sql'den SONRA Supabase SQL Editor'de çalıştırın.
-- Not: owner_id null bırakılır; bu mekanlar platform tarafından eklenmiş sayılır.

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Bosphorus Garden Yalısı', 'bosphorus-garden-yalisi', 'Boğaz''ın hemen kıyısında, asırlık çınarların gölgesinde tarihi bir yalı bahçesi. Deniz kenarında nikah, gün batımında kokteyl ve yıldızların altında yemekli davet — hepsi tek mekanda. 700 kişiye kadar açık alan kapasitesiyle İstanbul''un en prestijli düğün adreslerinden biri.', 'İstanbul',
     'Sarıyer', 'Yeniköy Mah. Köybaşı Cad. No:12, Sarıyer/İstanbul', '0212 555 01 01', '0532 555 01 01',
     150, 700, 4500, 9000,
     'yali', array['dugun', 'nisan', 'davet', 'kurumsal']::text[], array['deniz-kenari', 'acik-alan', 'alkol-servisi', 'yemekli', 'gelin-odasi', 'sahne-ses-isik', 'otopark', 'havai-fisek']::text[],
     'approved', 'premium', true)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80', 1),
  ('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80', 2),
  ('https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=80', 3)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Vadi Kır Bahçesi', 'vadi-kir-bahcesi', 'Polonezköy ormanlarının içinde, şehirden 25 dakika uzaklıkta huzurlu bir kır düğünü mekanı. Göl kenarı nikah alanı, ahşap pergolalar ve profesyonel mutfak ekibiyle kır düğünü hayali kuranlar için tasarlandı.', 'İstanbul',
     'Beykoz', 'Polonezköy Yolu 4. km, Beykoz/İstanbul', '0216 555 02 02', '0533 555 02 02',
     100, 450, 1800, 3500,
     'kir-bahcesi', array['dugun', 'nisan', 'kina']::text[], array['acik-alan', 'havuz-basi', 'yemekli', 'gelin-odasi', 'otopark', 'cocuk-oyun-alani']::text[],
     'approved', 'premium', true)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1600&q=80', 1),
  ('https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=80', 2)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Pera Palas Balo Salonu', 'pera-palas-balo-salonu', '1892''den bu yana İstanbul''un en zarif davetlerine ev sahipliği yapan tarihi balo salonu. Kristal avizeler, altın varak detaylar ve dönem mimarisiyle klasik ve görkemli bir düğün isteyenlerin ilk tercihi.', 'İstanbul',
     'Beyoğlu', 'Meşrutiyet Cad. No:52, Beyoğlu/İstanbul', '0212 555 03 03', '0532 555 03 03',
     80, 300, 5500, 12000,
     'balo-salonu', array['dugun', 'nisan', 'davet', 'kurumsal']::text[], array['kapali-alan', 'alkol-servisi', 'yemekli', 'gelin-odasi', 'sahne-ses-isik', 'konaklama', 'engelli-erisimi']::text[],
     'approved', 'premium', true)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1530023367847-a683933f4172?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1600&q=80', 1),
  ('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80', 2)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Marina Yacht Events', 'marina-yacht-events', 'Boğaz turu eşliğinde düğün, nişan ve özel davetler için lüks tekne filosu. 50 kişilik butik teknelerden 300 kişilik mega yatlara kadar seçenekler; DJ, ikram ve dekorasyon dahil paketler sunulur.', 'İstanbul',
     'Kadıköy', 'Kalamış Marina, Kadıköy/İstanbul', '0216 555 04 04', '0533 555 04 04',
     50, 300, 2500, 6000,
     'tekne', array['dugun', 'nisan', 'dogum-gunu', 'davet', 'kurumsal']::text[], array['deniz-kenari', 'acik-alan', 'kapali-alan', 'alkol-servisi', 'yemekli', 'sahne-ses-isik']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Terrace 34 Rooftop', 'terrace-34-rooftop', 'Şehrin 24. katında, 360 derece İstanbul manzaralı modern bir çatı terası. Nişan, kokteyl ve kurumsal lansmanlar için minimalist dekorasyon, açık bar ve profesyonel etkinlik ekibi.', 'İstanbul',
     'Şişli', 'Büyükdere Cad. No:120 Kat:24, Şişli/İstanbul', '0212 555 05 05', '0532 555 05 05',
     40, 180, 2000, 4500,
     'cati-teras', array['nisan', 'dogum-gunu', 'davet', 'kurumsal']::text[], array['acik-alan', 'kapali-alan', 'alkol-servisi', 'yemekli', 'sahne-ses-isik', 'engelli-erisimi']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Ankara Anadolu Davet Sarayı', 'ankara-anadolu-davet-sarayi', 'Başkentin merkezinde 1000 kişi kapasiteli görkemli davet salonu. LED ekranlar, profesyonel ışık sistemi ve zengin menü alternatifleriyle büyük düğünler ve kurumsal galalar için ideal.', 'Ankara',
     'Çankaya', 'Atatürk Bulvarı No:88, Çankaya/Ankara', '0312 555 06 06', '0534 555 06 06',
     300, 1000, 900, 2200,
     'dugun-salonu', array['dugun', 'nisan', 'kina', 'sunnet', 'kurumsal']::text[], array['kapali-alan', 'yemekli', 'gelin-odasi', 'sahne-ses-isik', 'otopark', 'engelli-erisimi']::text[],
     'approved', 'premium', true)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80', 1),
  ('https://images.unsplash.com/photo-1530023367847-a683933f4172?auto=format&fit=crop&w=1600&q=80', 2)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Gölbaşı Bahçe Düğün', 'golbasi-bahce-dugun', 'Mogan Gölü kıyısında gün batımı manzaralı kır düğünü bahçesi. Göl kenarında nikah masası, geniş yeşil alan ve mangal-barbekü seçenekleriyle samimi ve doğal bir düğün atmosferi.', 'Ankara',
     'Gölbaşı', 'Mogan Gölü Kıyısı No:5, Gölbaşı/Ankara', '0312 555 07 07', '0535 555 07 07',
     100, 400, 750, 1600,
     'kir-bahcesi', array['dugun', 'nisan', 'kina', 'sunnet', 'dogum-gunu']::text[], array['acik-alan', 'yemekli', 'otopark', 'cocuk-oyun-alani', 'havai-fisek']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('İzmir Kordon Beach Club', 'izmir-kordon-beach-club', 'Ege''nin turkuaz sularına sıfır, beyaz kumsalda bohem düğünler için tasarlanmış beach club. Kumsalda çıplak ayak nikah, deniz kenarında akşam yemeği ve gece yarısına kadar dans.', 'İzmir',
     'Çeşme', 'Ilıca Plajı Mevkii, Çeşme/İzmir', '0232 555 08 08', '0536 555 08 08',
     80, 350, 2800, 5500,
     'beach-club', array['dugun', 'nisan', 'dogum-gunu', 'davet']::text[], array['deniz-kenari', 'acik-alan', 'alkol-servisi', 'yemekli', 'sahne-ses-isik', 'havai-fisek']::text[],
     'approved', 'premium', true)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=80', 1),
  ('https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=80', 2)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Alsancak Tarihi Havagazı Fabrikası', 'alsancak-tarihi-havagazi-fabrikasi', 'Endüstriyel mirası koruyan taş duvarlı tarihi yapı; modern ışıklandırma ve geniş avlusuyla alternatif düğünler, sergiler ve kurumsal etkinlikler için karakter dolu bir mekan.', 'İzmir',
     'Konak', 'Liman Cad. No:1, Konak/İzmir', '0232 555 09 09', '0537 555 09 09',
     100, 600, 1200, 2800,
     'tarihi-mekan', array['dugun', 'davet', 'kurumsal']::text[], array['acik-alan', 'kapali-alan', 'disaridan-organizasyon', 'sahne-ses-isik', 'otopark', 'engelli-erisimi']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Urla Bağ Evi', 'urla-bag-evi', 'Urla''nın üzüm bağları arasında butik bir taş ev ve bahçesi. 150 kişiye kadar samimi düğünler, uzun masa akşam yemekleri ve şarap eşliğinde nişan davetleri için Ege''nin saklı cenneti.', 'İzmir',
     'Urla', 'Bağlararası Mevkii No:23, Urla/İzmir', '0232 555 10 10', '0538 555 10 10',
     30, 150, 1900, 3800,
     'kir-bahcesi', array['dugun', 'nisan', 'dogum-gunu', 'davet']::text[], array['acik-alan', 'alkol-servisi', 'yemekli', 'konaklama', 'otopark']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Antalya Mira Resort & Events', 'antalya-mira-resort-events', 'Akdeniz kıyısında 5 yıldızlı resort bünyesinde düğün ve balayı paketleri. Deniz manzaralı teras, havuz başı kokteyl alanı ve konaklamalı düğün organizasyonlarıyla yerli ve yabancı çiftlerin gözdesi.', 'Antalya',
     'Belek', 'Belek Turizm Merkezi, Serik/Antalya', '0242 555 11 11', '0539 555 11 11',
     100, 800, 3200, 7500,
     'otel', array['dugun', 'nisan', 'davet', 'kurumsal']::text[], array['deniz-kenari', 'havuz-basi', 'acik-alan', 'kapali-alan', 'alkol-servisi', 'yemekli', 'gelin-odasi', 'konaklama', 'engelli-erisimi', 'sahne-ses-isik']::text[],
     'approved', 'premium', true)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80', 1),
  ('https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=80', 2)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Kaleiçi Taş Konak', 'kaleici-tas-konak', 'Kaleiçi''nin tarihi dokusunda restore edilmiş Osmanlı konağı ve avlusu. Portakal ağaçları altında butik nişan, kına gecesi ve 120 kişiye kadar özel davetler için romantik bir atmosfer.', 'Antalya',
     'Muratpaşa', 'Kaleiçi Mah. Hesapçı Sok. No:18, Muratpaşa/Antalya', '0242 555 12 12', '0530 555 12 12',
     30, 120, 1400, 2900,
     'tarihi-mekan', array['nisan', 'kina', 'dogum-gunu', 'davet']::text[], array['acik-alan', 'kapali-alan', 'yemekli', 'alkol-servisi', 'gelin-odasi']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Bursa Koza Han Davet Bahçesi', 'bursa-koza-han-davet-bahcesi', 'Uludağ manzaralı geniş davet bahçesi ve kapalı salon alternatifi bir arada. Yağmur planı dahil kış-yaz her mevsim düğün yapılabilen esnek yapısıyla Bursa''nın en çok tercih edilen mekanlarından.', 'Bursa',
     'Osmangazi', 'Çekirge Cad. No:45, Osmangazi/Bursa', '0224 555 13 13', '0531 555 13 13',
     150, 600, 850, 1900,
     'kir-bahcesi', array['dugun', 'nisan', 'kina', 'sunnet']::text[], array['acik-alan', 'kapali-alan', 'yemekli', 'gelin-odasi', 'otopark', 'cocuk-oyun-alani', 'sahne-ses-isik']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Nilüfer Grand Salon', 'nilufer-grand-salon', 'Modern mimarisi ve 800 kişilik kapasitesiyle Bursa''nın en büyük düğün salonlarından. Zengin menü seçenekleri, LED sahne ve ücretsiz gelin arabası süsleme hizmeti sunar.', 'Bursa',
     'Nilüfer', 'İzmir Yolu 8. km, Nilüfer/Bursa', '0224 555 14 14', '0532 555 14 14',
     250, 800, 700, 1500,
     'dugun-salonu', array['dugun', 'kina', 'sunnet', 'nisan']::text[], array['kapali-alan', 'yemekli', 'gelin-odasi', 'sahne-ses-isik', 'otopark', 'engelli-erisimi']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1530023367847-a683933f4172?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Bodrum Marina Vista', 'bodrum-marina-vista', 'Bodrum marinasına ve kaleye bakan teras restoranı. Gün batımında nikah, beyaz örtülü uzun masalarda akşam yemeği ve Ege esintili kokteyl davetleri için sofistike bir sahne.', 'Muğla',
     'Bodrum', 'Neyzen Tevfik Cad. No:88, Bodrum/Muğla', '0252 555 15 15', '0533 555 15 15',
     50, 250, 3000, 6500,
     'restoran', array['dugun', 'nisan', 'dogum-gunu', 'davet', 'kurumsal']::text[], array['deniz-kenari', 'acik-alan', 'alkol-servisi', 'yemekli', 'sahne-ses-isik']::text[],
     'approved', 'premium', true)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=1600&q=80', 1),
  ('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80', 2)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Datça Badem Bahçesi', 'datca-badem-bahcesi', 'Badem ağaçları ve begonviller arasında, taş evlerle çevrili doğal bir düğün bahçesi. Küçük ve samimi düğünler için 120 kişiye kadar kapasite; organik ikramlar ve yerel şarap servisi.', 'Muğla',
     'Datça', 'Eski Datça Mah. No:7, Datça/Muğla', '0252 555 16 16', '0534 555 16 16',
     20, 120, 1600, 3200,
     'kir-bahcesi', array['dugun', 'nisan', 'dogum-gunu']::text[], array['acik-alan', 'alkol-servisi', 'yemekli', 'konaklama']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Adana Şato Davet', 'adana-sato-davet', 'Şato mimarisiyle dikkat çeken, havuzlu ve geniş bahçeli davet kompleksi. Görkemli giriş merdiveni, havuz başı kokteyl alanı ve 900 kişilik kapasitesiyle bölgenin en iddialı mekanı.', 'Adana',
     'Sarıçam', 'Kozan Yolu 12. km, Sarıçam/Adana', '0322 555 17 17', '0535 555 17 17',
     200, 900, 800, 1800,
     'davet-evi', array['dugun', 'nisan', 'kina', 'sunnet']::text[], array['havuz-basi', 'acik-alan', 'kapali-alan', 'yemekli', 'gelin-odasi', 'sahne-ses-isik', 'otopark', 'havai-fisek']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Gaziantep Zeugma Konağı', 'gaziantep-zeugma-konagi', 'Antep taşından tarihi bir konakta, avlulu ve fıstık ağaçlarıyla çevrili otantik davet mekanı. Yöresel mutfağın en seçkin örnekleriyle kına geceleri ve nişan törenleri için eşsiz bir seçenek.', 'Gaziantep',
     'Şahinbey', 'Bey Mah. Atatürk Bulvarı No:34, Şahinbey/Gaziantep', '0342 555 18 18', '0536 555 18 18',
     50, 250, 650, 1400,
     'tarihi-mekan', array['dugun', 'nisan', 'kina', 'dogum-gunu']::text[], array['acik-alan', 'kapali-alan', 'yemekli', 'gelin-odasi']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1530023367847-a683933f4172?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Sapanca Göl Panorama', 'sapanca-gol-panorama', 'Sapanca Gölü''ne nazır, orman içinde bungalov konaklamalı düğün ve etkinlik tesisi. Göl kenarında nikah iskelesi, cam kubbeli kış bahçesi ve doğayla iç içe kurumsal kamp organizasyonları.', 'Kocaeli',
     'Kartepe', 'Sapanca Gölü Kuzey Kıyısı No:3, Kartepe/Kocaeli', '0262 555 19 19', '0537 555 19 19',
     60, 300, 1500, 3000,
     'kir-bahcesi', array['dugun', 'nisan', 'davet', 'kurumsal']::text[], array['acik-alan', 'kapali-alan', 'yemekli', 'konaklama', 'otopark', 'cocuk-oyun-alani']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Trabzon Boztepe Panorama Salon', 'trabzon-boztepe-panorama-salon', 'Boztepe''den şehir ve deniz manzarasına hakim modern düğün salonu. Karadeniz misafirperverliğiyle zengin ikram menüleri, horon ekibi organizasyonu ve 600 kişilik ferah salon.', 'Trabzon',
     'Ortahisar', 'Boztepe Mah. Manzara Sok. No:9, Ortahisar/Trabzon', '0462 555 20 20', '0538 555 20 20',
     150, 600, 600, 1300,
     'dugun-salonu', array['dugun', 'nisan', 'kina', 'sunnet']::text[], array['kapali-alan', 'yemekli', 'gelin-odasi', 'sahne-ses-isik', 'otopark', 'engelli-erisimi']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('Eskişehir Porsuk Nehri Teras', 'eskisehir-porsuk-nehri-teras', 'Porsuk Nehri kıyısında, gondol manzaralı şık bir teras mekanı. Nişan, mezuniyet ve doğum günü davetleri için genç ve modern bir atmosfer; canlı müzik ve kokteyl barı mevcut.', 'Eskişehir',
     'Odunpazarı', 'Porsuk Bulvarı No:21, Odunpazarı/Eskişehir', '0222 555 21 21', '0539 555 21 21',
     30, 150, 900, 2000,
     'cati-teras', array['nisan', 'dogum-gunu', 'davet', 'kurumsal']::text[], array['acik-alan', 'kapali-alan', 'alkol-servisi', 'yemekli', 'sahne-ses-isik']::text[],
     'approved', 'free', false)
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
  ('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80', 0),
  ('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80', 1)
) as photo(url, ord);

