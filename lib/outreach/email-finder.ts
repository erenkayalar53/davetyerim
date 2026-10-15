import { outreachConfig } from "./config";
import { fetchPage, sleep } from "./http";
import { isAllowed, loadRobots } from "./robots";
import { normalizePhone } from "./normalize";
import type { EmailSource } from "./types";

export interface EmailCandidate {
  email: string;
  source: EmailSource;
  confidence: number;
  foundOn: string;
}

export interface EnrichResult {
  email: string;
  emailSource: EmailSource;
  confidence: number;
  phone: string;
  pagesVisited: number;
  error: string;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}/g;
const EMAIL_EXACT_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,24}$/;

/** Sayfalarda sürekli karşımıza çıkan ama işe yaramayan adresler. */
const BLOCKED_DOMAINS = [
  "example.com", "example.org", "domain.com", "yourdomain.com", "email.com",
  "sentry.io", "sentry-next.wixpress.com", "wixpress.com", "wix.com",
  "godaddy.com", "squarespace.com", "shopify.com", "wordpress.com",
  "cloudflare.com", "googlemail.com", "schema.org", "w3.org", "adobe.com",
];

/** Görsel/betik dosya adlarının e-posta sanılmasını engeller. */
const FILE_EXT_RE = /\.(png|jpe?g|gif|webp|svg|css|js|json|woff2?|ttf|ico|mp4|pdf)$/i;

const FREE_MAIL = [
  "gmail.com", "hotmail.com", "outlook.com", "yahoo.com",
  "yandex.com", "yandex.com.tr", "windowslive.com", "icloud.com", "mynet.com",
];

/** İşletme iletişimi için tipik kutu adları — bunlar daha değerli. */
const ROLE_LOCALPARTS = [
  "info", "iletisim", "bilgi", "rezervasyon", "satis", "kurumsal",
  "contact", "hello", "merhaba", "organizasyon", "destek",
];

/**
 * Bu kutulara iş birliği teklifi gitmez: ya otomatik ya da alakasız bir
 * departmandır. Büyük zincirlerin sitesinde ilk bulunan adres genelde
 * bunlardan biri oluyor.
 */
const NEVER_LOCALPARTS =
  /^(no-?reply|postmaster|abuse|webmaster|admin|accessibility|privacy|legal|kvkk|dpo|gdpr|careers?|kariyer|ik|hr|basin|press|media|investor|security|spam)$/;

const CONTACT_HINTS = [
  "iletisim", "iletişim", "contact", "bize-ulasin", "bizeulasin",
  "hakkimizda", "hakkinda", "about", "kurumsal", "rezervasyon",
];

/**
 * Mekanın kendi sitesini gezip iletişim e-postasını bulur.
 * robots.txt'e uyar, sayfa sayısını ve süreyi sınırlar, hiçbir zaman throw etmez.
 */
export async function findEmailForWebsite(website: string): Promise<EnrichResult> {
  const empty: EnrichResult = {
    email: "",
    emailSource: "",
    confidence: 0,
    phone: "",
    pagesVisited: 0,
    error: "",
  };

  if (!website) return { ...empty, error: "site-yok" };

  let origin: string;
  let siteDomain: string;
  try {
    const url = new URL(website);
    origin = url.origin;
    siteDomain = url.hostname.replace(/^www\./, "");
  } catch {
    return { ...empty, error: "gecersiz-url" };
  }

  const robots = await loadRobots(origin);

  const queue: string[] = [];
  const seen = new Set<string>();
  const candidates: EmailCandidate[] = [];
  let phone = "";
  let pagesVisited = 0;
  let lastError = "";

  const enqueue = (url: string) => {
    if (queue.length + pagesVisited >= outreachConfig.maxPagesPerSite) return;
    if (seen.has(url)) return;
    seen.add(url);
    queue.push(url);
  };

  enqueue(website);

  while (queue.length > 0 && pagesVisited < outreachConfig.maxPagesPerSite) {
    const target = queue.shift()!;

    let pathname = "/";
    try {
      pathname = new URL(target).pathname;
    } catch {
      continue;
    }
    if (!isAllowed(robots, pathname)) continue;

    if (pagesVisited > 0) await sleep(outreachConfig.crawlDelayMs);

    const page = await fetchPage(target);
    pagesVisited += 1;

    if (!page.html) {
      if (pagesVisited === 1) lastError = page.error ?? `http-${page.status}`;
      continue;
    }

    const html = decodeCloudflareEmails(page.html);
    const isContactPage = CONTACT_HINTS.some((hint) => pathname.toLowerCase().includes(hint));

    candidates.push(...extractEmails(html, target, siteDomain, isContactPage));
    if (!phone) phone = extractPhone(html);

    // İlk sayfadan iletişim sayfalarını kuyruğa al
    if (pagesVisited === 1) {
      for (const link of findContactLinks(html, target)) enqueue(link);
    }

    // Yüksek güvenli bir adres bulduysak gezmeye devam etmeye gerek yok
    if (candidates.some((c) => c.confidence >= 90)) break;
  }

  if (candidates.length === 0) {
    return { ...empty, phone, pagesVisited, error: lastError || "eposta-bulunamadi" };
  }

  const best = candidates.sort((a, b) => b.confidence - a.confidence)[0];
  return {
    email: best.email,
    emailSource: best.source,
    confidence: best.confidence,
    phone,
    pagesVisited,
    error: "",
  };
}

/**
 * Cloudflare'in "email protection" ile gizlediği adresleri açar.
 * Türkiye'deki işletme sitelerinde çok yaygın; açmazsak e-postaların
 * önemli bir kısmını kaçırırız.
 */
export function decodeCloudflareEmails(html: string): string {
  return html.replace(
    /data-cfemail=["']([0-9a-f]+)["']/gi,
    (match, hex: string) => {
      const decoded = decodeCfEmail(hex);
      return decoded ? `data-cfemail="${hex}">${decoded}<!--` : match;
    }
  );
}

function decodeCfEmail(hex: string): string {
  try {
    const key = parseInt(hex.slice(0, 2), 16);
    let out = "";
    for (let i = 2; i < hex.length; i += 2) {
      out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
    }
    return EMAIL_EXACT_RE.test(out.toLowerCase()) ? out : "";
  } catch {
    return "";
  }
}

function extractEmails(
  html: string,
  pageUrl: string,
  siteDomain: string,
  isContactPage: boolean
): EmailCandidate[] {
  const found = new Map<string, EmailCandidate>();

  const add = (raw: string, source: EmailSource) => {
    const email = raw.trim().toLowerCase().replace(/^mailto:/, "").split("?")[0];
    if (!isUsableEmail(email)) return;

    const confidence = scoreEmail(email, siteDomain, source, isContactPage);
    const existing = found.get(email);
    if (!existing || existing.confidence < confidence) {
      found.set(email, { email, source, confidence, foundOn: pageUrl });
    }
  };

  for (const match of html.matchAll(/href=["']mailto:([^"'?]+)/gi)) {
    add(match[1], "mailto");
  }
  for (const match of html.matchAll(EMAIL_RE)) {
    add(match[0], "page_text");
  }
  // "info [at] mekan.com" gibi gizlemeler
  for (const match of html.matchAll(
    /([a-z0-9._%+-]+)\s*(?:\[at\]|\(at\)|&#64;|\s+at\s+)\s*([a-z0-9.-]+\.[a-z]{2,10})/gi
  )) {
    add(`${match[1]}@${match[2]}`, "page_text");
  }

  return [...found.values()];
}

function isUsableEmail(email: string): boolean {
  if (!email || email.length > 100) return false;
  if (!EMAIL_EXACT_RE.test(email)) return false;
  if (FILE_EXT_RE.test(email)) return false;

  const domain = email.split("@")[1];
  if (!domain || domain.split(".").some((part) => part.length === 0)) return false;
  if (BLOCKED_DOMAINS.some((blocked) => domain === blocked || domain.endsWith(`.${blocked}`))) {
    return false;
  }
  // "2x@3x.png" gibi retina görsel adları
  if (/^\d+x$/.test(email.split("@")[0])) return false;
  return true;
}

function scoreEmail(
  email: string,
  siteDomain: string,
  source: EmailSource,
  isContactPage: boolean
): number {
  const [localPart, domain] = email.split("@");

  let score = source === "mailto" ? 78 : 58;

  const sameDomain =
    domain === siteDomain ||
    domain.endsWith(`.${siteDomain}`) ||
    siteDomain.endsWith(`.${domain}`);

  if (sameDomain) score += 14;
  else if (FREE_MAIL.includes(domain)) score += 2;
  else score -= 12; // başka bir firmanın adresi olabilir (ajans, tedarikçi)

  if (ROLE_LOCALPARTS.includes(localPart)) score += 6;
  if (isContactPage) score += 4;
  if (NEVER_LOCALPARTS.test(localPart)) score -= 45;

  return Math.max(0, Math.min(100, score));
}

function findContactLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];

  for (const match of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    const href = match[1];
    if (/^(mailto|tel|javascript):/i.test(href)) continue;

    let resolved: URL;
    try {
      resolved = new URL(href, baseUrl);
    } catch {
      continue;
    }

    // Sadece aynı site içinde gezeriz
    if (resolved.hostname.replace(/^www\./, "") !== new URL(baseUrl).hostname.replace(/^www\./, "")) {
      continue;
    }

    const path = resolved.pathname.toLowerCase();
    if (CONTACT_HINTS.some((hint) => path.includes(hint))) {
      resolved.hash = "";
      resolved.search = "";
      links.push(resolved.toString());
    }
  }

  // İletişim sayfası en değerlisi; hakkımızda daha geride kalsın
  return [...new Set(links)]
    .sort((a, b) => contactRank(a) - contactRank(b))
    .slice(0, outreachConfig.maxPagesPerSite - 1);
}

function contactRank(url: string): number {
  const path = url.toLowerCase();
  if (path.includes("iletisim") || path.includes("contact")) return 0;
  if (path.includes("rezervasyon")) return 1;
  if (path.includes("kurumsal")) return 2;
  return 3;
}

function extractPhone(html: string): string {
  const telMatch = html.match(/href=["']tel:([^"']+)["']/i);
  if (telMatch) {
    const normalized = normalizePhone(telMatch[1]);
    if (normalized) return normalized;
  }

  // Serbest metinde numara ararken alan kodunu daraltmak şart: gevşek desen
  // fiyat/tarih dizilerini telefon sanıp uydurma numara üretiyor.
  // GSM 50x–55x, sabit hat 2xx/3xx/4xx.
  const text = html.replace(/<[^>]+>/g, " ");
  const phoneMatch = text.match(
    /(?<!\d)(?:\+90|0)\s*\(?(?:5[0-5]\d|2[1-6]\d|3[1-8]\d|4[1-8]\d)\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}(?!\d)/
  );
  return phoneMatch ? normalizePhone(phoneMatch[0]) : "";
}
