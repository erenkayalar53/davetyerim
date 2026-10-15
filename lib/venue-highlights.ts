import { featureLabel } from "./constants";
import type { Venue } from "./types";

/**
 * Mekan kartında gösterilecek öne çıkan özellikler.
 *
 * Bir mekanın 35 özelliğinin hepsi eşit değerde değil: "deniz manzarası"
 * kullanıcının listede eleme yapmasını sağlar, "klima" sağlamaz. Bu sıra,
 * ayırt ediciliğe göre elle dizildi — listede ne kadar az mekanda bulunuyorsa
 * ve karar üzerinde ne kadar etkiliyse o kadar yukarıda.
 */
const PRIORITY: string[] = [
  // Manzara — en güçlü ayırt edici
  "bogaz-manzarasi",
  "deniz-manzarasi",
  "gol-manzarasi",
  "doga-manzarasi",
  "sehir-manzarasi",

  // Konum ve alan karakteri
  "deniz-kenari",
  "havuz-basi",
  "bahce",
  "acik-alan",
  "kapali-alan",

  // Etkinliği mekanda tamamlamayı sağlayanlar
  "nikah-alani",
  "konaklama",
  "kisin-acik",

  // Servis kapsamı
  "alkol-servisi",
  "yemekli",
  "disaridan-organizasyon",

  // Sahne ve teknik
  "canli-muzik",
  "sahne-ses-isik",
  "havai-fisek",

  // Konfor
  "gelin-odasi",
  "otopark",
  "vale",
  "engelli-erisimi",
  "cocuk-oyun-alani",
];

/** Kartta en fazla kaç etiket gösterilecek. */
const MAX_HIGHLIGHTS = 3;

/**
 * Mekanın özelliklerinden kartta gösterilecek olanların etiketlerini döndürür.
 * Öncelik listesinde olmayan özellikler, liste tükenirse sona eklenir —
 * yeni bir özellik eklendiğinde sessizce kaybolmasın diye.
 */
export function venueHighlights(
  venue: Venue,
  limit: number = MAX_HIGHLIGHTS
): string[] {
  if (!venue.features?.length) return [];

  const owned = new Set(venue.features);

  const ranked = PRIORITY.filter((slug) => owned.has(slug));
  const rest = venue.features.filter((slug) => !PRIORITY.includes(slug));

  return [...ranked, ...rest].slice(0, limit).map(featureLabel);
}
