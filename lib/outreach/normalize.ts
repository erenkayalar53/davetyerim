import { slugifyTr } from "@/lib/constants";
import type { RawProspect } from "./types";

/** "Kır Bahçesi Düğün Salonu" + "İstanbul" → "kir-bahcesi-dugun-salonu|istanbul" */
export function dedupeKey(name: string, city: string): string {
  return `${slugifyTr(cleanVenueName(name))}|${slugifyTr(city)}`;
}

/**
 * Mekan adından arama gürültüsünü temizler: baştaki/sondaki tırnak,
 * fazla boşluk, sondaki şehir/ilçe eki ("... - İstanbul").
 */
export function cleanVenueName(raw: string): string {
  return raw
    .replace(/["'“”]/g, "")
    .replace(/\s*[-–|]\s*(istanbul|ankara|izmir|antalya|bursa)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Türk telefon numarasını +90XXXXXXXXXX biçimine getirir.
 *
 * Kaynak çoğu zaman bir `tel:` bağlantısı olduğu için önce URL kodlaması
 * çözülür — aksi halde "%20+0080..." gibi kullanılamaz değerler DB'ye girer.
 * Makul uzunlukta olmayan hiçbir şey döndürülmez; yanlış numara, boş
 * numaradan daha zararlıdır.
 */
export function normalizePhone(raw: string): string {
  if (!raw) return "";

  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    // zaten çözülmüş ya da bozuk kodlama — olduğu gibi devam
  }

  const hasPlus = value.trimStart().startsWith("+");
  const only = value.replace(/\D/g, "");

  if (only.length === 10 && /^[2-5]/.test(only)) return `+90${only}`;
  if (only.length === 11 && only.startsWith("0")) return `+90${only.slice(1)}`;
  if (only.length === 12 && only.startsWith("90")) return `+${only}`;

  // Uluslararası çevir öneki (00…) artı işaretine dönüşür
  if (only.startsWith("00") && only.length >= 12) return `+${only.slice(2)}`;

  if (only.length >= 10 && only.length <= 15) return hasPlus ? `+${only}` : only;
  return "";
}

/** Website adresini şemalı, izsiz (utm vb.) ve sondaki slash'sız hale getirir. */
export function normalizeWebsite(raw: string): string {
  if (!raw) return "";
  let value = raw.trim();
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;

  try {
    const url = new URL(value);
    // Sosyal medya profilleri site sayılmaz — orada iletişim sayfası yok.
    if (/(facebook|instagram|twitter|x)\.com$/i.test(url.hostname)) return "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

const TR_CITIES = [
  "İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Muğla", "Adana",
  "Gaziantep", "Kocaeli", "Mersin", "Eskişehir", "Trabzon", "Konya",
  "Kayseri", "Samsun", "Denizli", "Sakarya", "Aydın", "Balıkesir", "Tekirdağ",
];

/**
 * Google'ın döndürdüğü uzun adresten şehir ve ilçeyi çıkarır.
 * Biçim genelde: "Mah. Sok. No:1, 34000 İlçe/Şehir, Türkiye"
 */
export function parseAddress(address: string): { city: string; district: string } {
  if (!address) return { city: "", district: "" };

  const slashMatch = address.match(/([^,/\d]+)\/([^,/]+)/);
  if (slashMatch) {
    const district = slashMatch[1].trim();
    const city = slashMatch[2].replace(/türkiye/i, "").trim();
    if (city) return { city, district };
  }

  const found = TR_CITIES.find((c) =>
    address.toLocaleLowerCase("tr").includes(c.toLocaleLowerCase("tr"))
  );
  return { city: found ?? "", district: "" };
}

/** Ham adayı DB satırına çevirir. Eksik alanlar boş string olur, null olmaz. */
export function toProspectRow(raw: RawProspect) {
  const name = cleanVenueName(raw.name);
  const parsed = parseAddress(raw.address ?? "");
  const city = raw.city?.trim() || parsed.city;
  const district = raw.district?.trim() || parsed.district;

  return {
    source: raw.source,
    source_ref: raw.source_ref ?? "",
    name,
    city,
    district,
    address: (raw.address ?? "").trim(),
    phone: normalizePhone(raw.phone ?? ""),
    website: normalizeWebsite(raw.website ?? ""),
    email: (raw.email ?? "").trim().toLowerCase(),
    email_source: raw.email ? ("source" as const) : ("" as const),
    email_confidence: raw.email ? 70 : 0,
    rating: raw.rating ?? null,
    rating_count: raw.rating_count ?? null,
    dedupe_key: dedupeKey(name, city),
    status: raw.email ? ("ready" as const) : ("new" as const),
  };
}
