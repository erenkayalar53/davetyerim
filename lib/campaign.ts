import type { Campaign } from "./types";

/**
 * Kampanya yardımcıları.
 *
 * Kampanyanın süresi dolduğunda hem kartta hem detay sayfasında gösterimi
 * durmalı — bitmiş bir indirimi göstermek teklif isteyen çifti karşı tarafta
 * hayal kırıklığına uğratır ve mekan sahibiyle aramızda sorun çıkarır.
 */

/**
 * "2026-08-31" gibi bir tarihi, o günün YEREL saatle sonuna çevirir.
 *
 * Doğrudan `new Date("2026-08-31")` demek işe yaramaz: tarih-yalnız biçim
 * UTC gece yarısı olarak ayrıştırılır, üstüne `setHours` yerel saate göre
 * çalışır ve ikisi karışınca Türkiye'de (UTC+3) kampanya son gününde 3 saat
 * erken kapanır. Bu yüzden gün, ay ve yıl elle verilir.
 */
function endOfLocalDay(value: string): Date | null {
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);
  }

  // Saat bilgisi de içeren ISO damgaları olduğu gibi ayrıştırılır
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(23, 59, 59, 999);
  return parsed;
}

/** Süresi dolmuş veya boş kampanyalar için false döner. */
export function isCampaignActive(campaign: Campaign | null): campaign is Campaign {
  if (!campaign) return false;
  if (!campaign.valid_until) return true; // süresiz kampanya

  const end = endOfLocalDay(campaign.valid_until);
  if (!end) return true; // bozuk tarih kampanyayı gizlemesin

  return end.getTime() >= Date.now();
}

/**
 * Kampanyanın bitmesine kalan tam gün. Süresiz kampanyada null döner.
 * Aciliyet etiketi yalnızca son iki hafta için anlamlıdır; daha uzun süre
 * kalan kampanyada "son 60 gün" yazmak aciliyeti değersizleştirir.
 */
export function campaignDaysLeft(campaign: Campaign): number | null {
  if (!campaign.valid_until) return null;

  const end = endOfLocalDay(campaign.valid_until);
  if (!end) return null;

  // Saat farkıyla değil takvim günüyle sayılır: 4 Eylül'de biten bir kampanya,
  // 1 Eylül sabahı da gecesi de "3 gün" kalmış olmalı. Ham milisaniye farkını
  // yukarı yuvarlamak, günün saatine göre 3 ile 4 arasında gidip gelirdi.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  const days = Math.round(
    (endDay.getTime() - startOfToday.getTime()) / 86_400_000
  );
  return days < 0 ? null : days;
}

/** Aciliyet etiketi gösterilecek en uzun süre (gün). */
const URGENCY_WINDOW_DAYS = 14;

/** "Son 3 gün" gibi bir etiket — süre uzunsa null döner. */
export function urgencyLabel(campaign: Campaign): string | null {
  const days = campaignDaysLeft(campaign);
  if (days === null || days > URGENCY_WINDOW_DAYS) return null;
  if (days === 0) return "Son gün";
  return `Son ${days} gün`;
}

/** İndirim uygulanmış kişi başı fiyat. İndirim yoksa fiyatı aynen döndürür. */
export function discountedPrice(price: number, campaign: Campaign | null): number {
  if (!isCampaignActive(campaign) || !campaign.discount_pct) return price;

  const pct = Math.min(90, Math.max(0, campaign.discount_pct));
  return Math.round(price * (1 - pct / 100));
}

/** Kartta üstü çizili fiyat gösterilecek mi? */
export function hasVisibleDiscount(campaign: Campaign | null): boolean {
  return isCampaignActive(campaign) && Boolean(campaign.discount_pct);
}
