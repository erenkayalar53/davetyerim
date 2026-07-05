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
] as const;

export const FEATURES = [
  { slug: "deniz-kenari", label: "Deniz Kenarı" },
  { slug: "havuz-basi", label: "Havuz Başı" },
  { slug: "acik-alan", label: "Açık Alan" },
  { slug: "kapali-alan", label: "Kapalı Alan" },
  { slug: "otopark", label: "Otopark & Vale" },
  { slug: "alkol-servisi", label: "Alkol Servisi" },
  { slug: "yemekli", label: "Yemekli Organizasyon" },
  { slug: "sadece-kiralama", label: "Sadece Kiralama" },
  { slug: "gelin-odasi", label: "Gelin Odası" },
  { slug: "sahne-ses-isik", label: "Sahne & Ses-Işık" },
  { slug: "konaklama", label: "Konaklama" },
  { slug: "engelli-erisimi", label: "Engelli Erişimi" },
  { slug: "cocuk-oyun-alani", label: "Çocuk Oyun Alanı" },
  { slug: "havai-fisek", label: "Havai Fişek İzni" },
  { slug: "jenerator", label: "Jeneratör" },
] as const;

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
