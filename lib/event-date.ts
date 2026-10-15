/**
 * Etkinlik tarihi yardımcıları — tarih filtresi ve date input'ları buradan beslenir.
 *
 * Tarihler her yerde YYYY-MM-DD düz metni olarak taşınır; Date nesnesi URL'de
 * ve sorgularda saat dilimi sürprizi çıkarıyor.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Bugün (UTC). Date input'larının `min` değeri bundan gelir — geçmiş günler
 * tarayıcı seviyesinde seçilemez olur.
 *
 * Neden yerel saat değil: bu değer SSR sırasında sunucuda, sonra istemcide
 * yeniden hesaplanıyor. Yerel güne bakılsa saat dilimleri ayrıldığında iki
 * taraf farklı `min` üretip hydration uyuşmazlığı çıkarırdı. UTC her iki
 * tarafta aynı sonucu verir ve en kötü durumda bir gün hoşgörülü olur —
 * geçerli bir "bugün"ü yanlışlıkla engellemekten iyidir. Projedeki diğer
 * tarih alanları (lead-form, batch-quote-form) da aynı yaklaşımı kullanıyor.
 */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * URL'den gelen tarihi doğrular: biçim YYYY-MM-DD olmalı, takvimde gerçekten
 * var olmalı ve geçmişte kalmamalı. Geçersizse undefined döner, yani filtre
 * hiç uygulanmamış sayılır.
 *
 * Eşik bir gün geriden alınıyor ki kullanıcının saat diliminde hâlâ "bugün"
 * olan bir tarih düşmesin. Geçmiş tarihi asıl engelleyen input'un `min`
 * değeri; buradaki kontrol elle yazılmış veya eskimiş URL'lere karşı.
 */
export function parseEventDate(value: string | undefined): string | undefined {
  if (!value || !ISO_DATE.test(value)) return undefined;

  // "2026-02-31" gibi biçimi doğru ama takvimde olmayan tarihleri ayıkla.
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  if (parsed.toISOString().slice(0, 10) !== value) return undefined;

  const floor = new Date();
  floor.setUTCDate(floor.getUTCDate() - 1);
  if (value < floor.toISOString().slice(0, 10)) return undefined;

  return value;
}
