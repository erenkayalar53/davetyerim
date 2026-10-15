import type { Venue } from "./types";

/**
 * Yanıt hızı rozeti.
 *
 * Rozet ancak yeterli ölçüm birikince gösterilir: tek bir hızlı yanıta bakıp
 * "1 saatte yanıtlıyor" demek, ikinci talebi üç gün bekleyen çift için
 * doğrudan güven kaybıdır. Az veriyle susmak, yanlış söz vermekten iyidir.
 */
const MIN_SAMPLES = 3;

/** Bu süreden yavaş mekanlarda rozet gösterilmez — reklam değil, sinyal. */
const MAX_USEFUL_MINUTES = 72 * 60;

export function responseTimeLabel(venue: Venue): string | null {
  const minutes = venue.avg_response_minutes;
  if (
    minutes === null ||
    minutes === undefined ||
    venue.response_sample_count < MIN_SAMPLES ||
    minutes > MAX_USEFUL_MINUTES
  ) {
    return null;
  }

  return `${formatDuration(minutes)} içinde yanıtlıyor`;
}

/** Panelde mekan sahibine gösterilen kısa biçim ("2 saat"). */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    // Alt sınır yuvarlama adımıyla aynı: aksi halde 2 dakika "1 dakika",
    // 3 dakika "5 dakika" olarak yazılıp tutarsız görünüyordu.
    const rounded = Math.max(5, Math.round(minutes / 5) * 5);
    return `${rounded} dakika`;
  }

  const hours = minutes / 60;
  if (hours < 24) {
    return `${Math.max(1, Math.round(hours))} saat`;
  }

  const days = Math.round(hours / 24);
  return `${days} gün`;
}

/** Bir talebin gönderilmesiyle yanıtlanması arasında geçen süre. */
export function elapsedMinutes(from: string, to: string | null): number | null {
  const start = new Date(from).getTime();
  const end = to ? new Date(to).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  return Math.max(0, Math.round((end - start) / 60_000));
}
