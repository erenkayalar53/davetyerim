/**
 * Outreach sisteminin tüm ayarlanabilir değerleri tek yerde.
 * Hepsi env ile ezilebilir; env yoksa güvenli varsayılan kullanılır.
 */

function num(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function str(key: string, fallback = ""): string {
  return (process.env[key] ?? fallback).trim();
}

function list(key: string, fallback: string[]): string[] {
  const raw = str(key);
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const outreachConfig = {
  /** Cron'un tek çalıştırmada harcayabileceği süre (ms). Vercel limiti 60sn. */
  runBudgetMs: num("OUTREACH_RUN_BUDGET_MS", 45_000),

  /** Bir çalıştırmada kaç adayın sitesi taranıp e-posta aranacak. */
  enrichPerRun: num("OUTREACH_ENRICH_PER_RUN", 10),

  /** Bir çalıştırmada kaç taslak mesaj üretilecek. */
  draftPerRun: num("OUTREACH_DRAFT_PER_RUN", 20),

  /** Bir çalıştırmada kaç onaylı mesaj gönderilecek — kademeli gönderim. */
  sendPerRun: num("OUTREACH_SEND_PER_RUN", 8),

  /** Aynı adaya iki mesaj arasında geçmesi gereken en az gün. */
  minDaysBetweenContacts: num("OUTREACH_MIN_DAYS_BETWEEN", 7),

  /** Site taramasında tek bir HTTP isteği için zaman aşımı (ms). */
  fetchTimeoutMs: num("OUTREACH_FETCH_TIMEOUT_MS", 8_000),

  /** Aynı siteye ardışık istekler arasında beklenecek süre (ms) — nazik crawl. */
  crawlDelayMs: num("OUTREACH_CRAWL_DELAY_MS", 1_200),

  /** Bir sitede e-posta ararken en fazla kaç sayfa açılacak. */
  maxPagesPerSite: num("OUTREACH_MAX_PAGES_PER_SITE", 4),

  /** Crawler'ın kendini tanıttığı User-Agent. */
  userAgent: str(
    "OUTREACH_USER_AGENT",
    "DavetYerimBot/1.0 (+https://davetyerim.com/hakkimizda; isletme-isbirligi)"
  ),

  /** Keşif yapılacak şehirler. */
  cities: list("OUTREACH_CITIES", [
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
  ]),

  /** Google Places'e sorulacak arama terimleri. */
  searchTerms: list("OUTREACH_SEARCH_TERMS", [
    "düğün salonu",
    "kır düğünü mekanı",
    "balo salonu",
    "davet salonu",
    "kına gecesi mekanı",
    "düğün oteli",
  ]),

  /** Varsayılan keşif kaynağı. */
  source: str("OUTREACH_SOURCE", "google_places"),

  googlePlacesKey: str("GOOGLE_PLACES_API_KEY"),

  resendKey: str("RESEND_API_KEY"),
  /** Gönderen adresi — Resend'de doğrulanmış domain olmalı. */
  fromEmail: str("OUTREACH_FROM_EMAIL", "isbirligi@davetyerim.com"),
  fromName: str("OUTREACH_FROM_NAME", "Davet Yerim"),
  replyTo: str("OUTREACH_REPLY_TO", ""),

  /** Cron endpoint'ini koruyan gizli anahtar. */
  cronSecret: str("CRON_SECRET"),

  /** Abonelikten çıkma bağlantısını imzalayan anahtar. */
  unsubscribeSecret: str("OUTREACH_UNSUBSCRIBE_SECRET"),

  /** Resend webhook imza doğrulama anahtarı (Svix). */
  webhookSecret: str("RESEND_WEBHOOK_SECRET"),

  /**
   * true ise cron sadece keşfeder/taslak üretir, HİÇ mail göndermez.
   * İlk kurulumda açık bırakmak güvenlidir.
   */
  dryRun: str("OUTREACH_DRY_RUN", "false").toLowerCase() === "true",
} as const;

export function isOutreachConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
