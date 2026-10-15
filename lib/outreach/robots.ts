import { fetchPage } from "./http";

/**
 * robots.txt'i okuyup bizim User-Agent için izin verilen yolları belirler.
 * Dosya yoksa veya okunamazsa "izin var" kabul edilir (standart davranış).
 */
interface RobotsRules {
  disallow: string[];
  allow: string[];
}

const cache = new Map<string, RobotsRules>();

export async function loadRobots(origin: string): Promise<RobotsRules> {
  const cached = cache.get(origin);
  if (cached) return cached;

  const result = await fetchPage(`${origin}/robots.txt`);
  const rules = result.html ? parseRobots(result.html) : { disallow: [], allow: [] };
  cache.set(origin, rules);
  return rules;
}

/**
 * Sadece "User-agent: *" bloğunu okur. Bize özel bir blok tanımlanmışsa
 * yine yıldız bloğuna uyarız — daha kısıtlayıcı olan taraf güvenli olandır.
 */
function parseRobots(text: string): RobotsRules {
  const rules: RobotsRules = { disallow: [], allow: [] };
  let inStarBlock = false;

  for (const line of text.split(/\r?\n/)) {
    const clean = line.split("#")[0].trim();
    if (!clean) continue;

    const [rawKey, ...rest] = clean.split(":");
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(":").trim();

    if (key === "user-agent") {
      inStarBlock = value === "*";
      continue;
    }
    if (!inStarBlock || !value) continue;

    if (key === "disallow") rules.disallow.push(value);
    if (key === "allow") rules.allow.push(value);
  }

  return rules;
}

export function isAllowed(rules: RobotsRules, pathname: string): boolean {
  const matchLength = (patterns: string[]) =>
    patterns
      .filter((p) => p !== "" && pathname.startsWith(p.replace(/\*$/, "")))
      .reduce((longest, p) => Math.max(longest, p.length), 0);

  const denied = matchLength(rules.disallow);
  if (denied === 0) return true;

  // Daha uzun (daha spesifik) Allow kuralı Disallow'u ezer.
  return matchLength(rules.allow) >= denied;
}
