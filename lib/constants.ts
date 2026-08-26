export const CATEGORIES = [
  { slug: "dugun", label: "Düğün" },
  { slug: "nisan", label: "Nişan" },
  { slug: "kina", label: "Kına Gecesi" },
  { slug: "sunnet", label: "Sünnet" },
  { slug: "dogum-gunu", label: "Doğum Günü" },
  { slug: "davet", label: "Davet & Kokteyl" },
  { slug: "kurumsal", label: "Kurumsal Etkinlik" },
] as const;

export const VENUE_TYPES = [
  { slug: "dugun-salonu", label: "Düğün Salonu" },
  { slug: "kir-bahcesi", label: "Kır Bahçesi" },
  { slug: "otel", label: "Otel" },
  { slug: "restoran", label: "Restoran" },
  { slug: "yali", label: "Yalı & Boğaz" },
  { slug: "tekne", label: "Tekne" },
  { slug: "tarihi-mekan", label: "Tarihi Mekan" },
  { slug: "beach-club", label: "Plaj & Beach Club" },
  { slug: "cati-teras", label: "Çatı & Teras" },
  { slug: "balo-salonu", label: "Balo Salonu" },
  { slug: "davet-evi", label: "Davet Evi" },
  { slug: "kokteyl-mekani", label: "Kokteyl Mekanı" },
  { slug: "kultur-merkezi", label: "Kültür Merkezi" },
  { slug: "kosk-konak", label: "Köşk & Konak" },
] as const;

// Düğün.com tarzı gruplandırılmış mekan özellikleri.
// Mevcut slug'lar korundu; yeni özellikler eklendi.
export const FEATURE_GROUPS = [
  {
    title: "Manzara & Konum",
    features: [
      { slug: "deniz-manzarasi", label: "Deniz Manzarası" },
      { slug: "bogaz-manzarasi", label: "Boğaz Manzarası" },
      { slug: "gol-manzarasi", label: "Göl Manzarası" },
      { slug: "doga-manzarasi", label: "Doğa Manzarası" },
      { slug: "sehir-manzarasi", label: "Şehir Manzarası" },
      { slug: "deniz-kenari", label: "Deniz Kenarı" },
      { slug: "havuz-basi", label: "Havuz Başı" },
    ],
  },
  {
    title: "Alan Türü",
    features: [
      { slug: "acik-alan", label: "Açık Alan" },
      { slug: "kapali-alan", label: "Kapalı Alan" },
      { slug: "bahce", label: "Bahçe" },
      { slug: "kisin-acik", label: "Kışın da Hizmet" },
    ],
  },
  {
    title: "İkram & Menü",
    features: [
      { slug: "yemekli", label: "Yemekli Servis" },
      { slug: "kokteyl-bufe", label: "Kokteyl" },
      { slug: "alkol-servisi", label: "Alkol Servisi" },
      { slug: "disaridan-organizasyon", label: "Dışarıdan Organizasyon" },
    ],
  },
  {
    title: "Sahne & Teknik",
    features: [
      { slug: "sahne-ses-isik", label: "Sahne & Ses-Işık" },
      { slug: "dj", label: "DJ" },
      { slug: "canli-muzik", label: "Canlı Müzik / Orkestra" },
      { slug: "led-ekran", label: "LED Ekran" },
      { slug: "havai-fisek", label: "Havai Fişek İzni" },
      { slug: "surpriz-gosteri", label: "Sürpriz Gösteri" },
    ],
  },
  {
    title: "Konfor",
    features: [
      { slug: "klima", label: "Klima" },
      { slug: "gelin-odasi", label: "Gelin Odası" },
      { slug: "damat-odasi", label: "Damat Odası" },
      { slug: "nikah-alani", label: "Nikah Alanı" },
      { slug: "otopark", label: "Otopark" },
      { slug: "vale", label: "Vale Hizmeti" },
      { slug: "engelli-erisimi", label: "Engelli Erişimi" },
      { slug: "konaklama", label: "Konaklama" },
      { slug: "cocuk-oyun-alani", label: "Çocuk Oyun Alanı" },
    ],
  },
  {
    title: "Ekstra Hizmetler",
    features: [
      { slug: "cicek-susleme", label: "Çiçek & Süsleme" },
      { slug: "gelin-arabasi", label: "Gelin Arabası" },
      { slug: "foto-video", label: "Fotoğraf & Video" },
      { slug: "organizasyon", label: "Organizasyon Danışmanı" },
      { slug: "servis-elemani", label: "Servis Elemanları" },
    ],
  },
] as const;

export const FEATURES: { slug: string; label: string }[] = FEATURE_GROUPS.flatMap(
  (g) => g.features.map((f) => ({ slug: f.slug as string, label: f.label as string }))
);

export const CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Antalya",
  "Bursa",
  "Muğla",
  "Adana",
  "Gaziantep",
  "Kocaeli",
  "Mersin",
  "Eskişehir",
  "Trabzon",
] as const;

export const CAPACITY_RANGES = [
  { min: 0, max: 100, label: "0 – 100 kişi" },
  { min: 100, max: 250, label: "100 – 250 kişi" },
  { min: 250, max: 500, label: "250 – 500 kişi" },
  { min: 500, max: 1000, label: "500 – 1000 kişi" },
  { min: 1000, max: 100000, label: "1000+ kişi" },
] as const;

export const PRICE_RANGES = [
  { min: 0, max: 750, label: "750 ₺'ye kadar" },
  { min: 750, max: 1500, label: "750 – 1.500 ₺" },
  { min: 1500, max: 3000, label: "1.500 – 3.000 ₺" },
  { min: 3000, max: 6000, label: "3.000 – 6.000 ₺" },
  { min: 6000, max: 1000000, label: "6.000 ₺ üzeri" },
] as const;

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function venueTypeLabel(slug: string): string {
  return VENUE_TYPES.find((t) => t.slug === slug)?.label ?? slug;
}

export function venueTypesLabels(slugs: string[]): string[] {
  return slugs.map(venueTypeLabel);
}

// Mekan sahibinin fiyat paketi eklerken kullanabileceği hazır şablonlar
export const MENU_PACKAGE_PRESETS = [
  { name: "Yemekli Menü (Alkolsüz)", includes_food: true, includes_alcohol: false },
  { name: "Yemekli Menü (Alkollü)", includes_food: true, includes_alcohol: true },
  { name: "Kokteyl İkramı", includes_food: true, includes_alcohol: false },
  { name: "Sadece Mekan Kiralama", includes_food: false, includes_alcohol: false },
] as const;

export function featureLabel(slug: string): string {
  return FEATURES.find((f) => f.slug === slug)?.label ?? slug;
}

export function formatPrice(n: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);
}

export function slugifyTr(text: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return text
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SITE_NAME = "Davet Yerim";
export const SITE_URL = "https://davetyerim.com";
export const SITE_DESCRIPTION =
  "Düğün, nişan, kına, sünnet ve kurumsal etkinlikler için Türkiye'nin dört bir yanından yüzlerce mekanı keşfedin. Kişi başı fiyatları karşılaştırın, ücretsiz teklif alın.";
