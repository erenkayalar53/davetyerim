import { outreachConfig } from "../config";
import { fetchPage, sleep } from "../http";
import { isAllowed, loadRobots } from "../robots";
import type { RawProspect } from "../types";
import type { DiscoverQuery, DiscoverResult, ProspectSourceAdapter } from "./types";

/**
 * Jenerik mekan dizini adaptörü.
 *
 * Hedefe özel bir kazıyıcı DEĞİLDİR: yalnızca sayfaya gömülü Schema.org
 * JSON-LD verisini okur (LocalBusiness / EventVenue / ItemList). Bu yüzden
 * sayfa tasarımı değişse bile çalışmaya devam eder ve sitenin kendi
 * yayınladığı yapılandırılmış veriden başka bir şey almaz.
 *
 * robots.txt'e uyar; izin yoksa hiçbir şey döndürmez.
 *
 * Kurulum (env):
 *   OUTREACH_DIRECTORY_URL=https://ornek-dizin.com/dugun-salonlari/{city}?sayfa={page}
 *   OUTREACH_DIRECTORY_PAGES=3
 *
 * SORUMLULUK NOTU: Üçüncü taraf bir dizinden toplu veri çekmek, o sitenin
 * kullanım şartlarına ve Türkiye'de FSEK m.6/11 (veritabanı hakkı) ile
 * TTK m.55 (haksız rekabet) hükümlerine takılabilir. Bu adaptörü yalnızca
 * izinli olduğunuz kaynaklar için etkinleştirin.
 */
export const directorySource: ProspectSourceAdapter = {
  key: "directory",
  label: "Mekan dizini (JSON-LD)",

  isConfigured() {
    return Boolean(process.env.OUTREACH_DIRECTORY_URL);
  },

  async discover({ city, limit }: DiscoverQuery): Promise<DiscoverResult> {
    const template = process.env.OUTREACH_DIRECTORY_URL;
    if (!template) {
      return { prospects: [], error: "OUTREACH_DIRECTORY_URL tanımlı değil" };
    }

    const pages = Number(process.env.OUTREACH_DIRECTORY_PAGES ?? 2) || 2;
    const citySlug = slugForUrl(city);
    const prospects: RawProspect[] = [];

    for (let page = 1; page <= pages && prospects.length < limit; page++) {
      const url = template
        .replaceAll("{city}", citySlug)
        .replaceAll("{page}", String(page));

      let origin: string;
      let pathname: string;
      try {
        const parsed = new URL(url);
        origin = parsed.origin;
        pathname = parsed.pathname;
      } catch {
        return { prospects, error: `Geçersiz OUTREACH_DIRECTORY_URL: ${url}` };
      }

      const robots = await loadRobots(origin);
      if (!isAllowed(robots, pathname)) {
        return { prospects, error: `robots.txt bu yolu kapatmış: ${pathname}` };
      }

      if (page > 1) await sleep(outreachConfig.crawlDelayMs);

      const result = await fetchPage(url);
      if (!result.html) {
        return { prospects, error: result.error ?? `http-${result.status}` };
      }

      const found = extractFromJsonLd(result.html, city);
      if (found.length === 0) break; // sayfa boş — devam etmenin anlamı yok
      prospects.push(...found);
    }

    return { prospects: prospects.slice(0, limit) };
  },
};

function slugForUrl(city: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u",
  };
  return city
    .split("")
    .map((ch) => map[ch] ?? map[ch.toLocaleLowerCase("tr")] ?? ch)
    .join("")
    .toLocaleLowerCase("tr")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const VENUE_TYPES = new Set([
  "LocalBusiness", "EventVenue", "Place", "Restaurant", "Hotel",
  "BanquetHall", "Organization",
]);

function extractFromJsonLd(html: string, city: string): RawProspect[] {
  const prospects: RawProspect[] = [];

  for (const match of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(match[1].trim());
    } catch {
      continue; // bozuk JSON-LD yaygın; sessizce atla
    }
    collect(parsed, city, prospects);
  }

  return prospects;
}

function collect(node: unknown, city: string, out: RawProspect[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collect(item, city, out);
    return;
  }
  if (!node || typeof node !== "object") return;

  const obj = node as Record<string, unknown>;

  // ItemList → itemListElement → item
  if (Array.isArray(obj.itemListElement)) {
    for (const el of obj.itemListElement) {
      const item = (el as Record<string, unknown>)?.item ?? el;
      collect(item, city, out);
    }
  }
  if (Array.isArray(obj["@graph"])) collect(obj["@graph"], city, out);

  const types = ([] as string[]).concat(
    (obj["@type"] as string | string[] | undefined) ?? []
  );
  if (!types.some((t) => VENUE_TYPES.has(t))) return;

  const name = typeof obj.name === "string" ? obj.name.trim() : "";
  if (!name) return;

  out.push({
    source: "directory",
    source_ref: typeof obj["@id"] === "string" ? obj["@id"] : "",
    name,
    city,
    address: readAddress(obj.address),
    phone: typeof obj.telephone === "string" ? obj.telephone : "",
    website: typeof obj.url === "string" ? obj.url : "",
    email: typeof obj.email === "string" ? obj.email : "",
  });
}

function readAddress(address: unknown): string {
  if (typeof address === "string") return address;
  if (!address || typeof address !== "object") return "";

  const a = address as Record<string, unknown>;
  return [a.streetAddress, a.addressLocality, a.addressRegion]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join(", ");
}
