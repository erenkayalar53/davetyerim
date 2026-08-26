/**
 * Sosyal paylaşım (OG) görselleri için ortak yardımcılar.
 *
 * Satori woff2 okuyamaz; Google Fonts modern bir User-Agent görmediğinde
 * truetype döner. `text` parametresiyle yalnızca kullanılan karakterler
 * indirilir — dosya birkaç KB'de kalır.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** Marka paleti — globals.css ile birebir aynı. */
export const OG = {
  cream: "#faf6ef",
  creamDeep: "#f2eadd",
  parchment: "#fffdf8",
  ink: "#221b14",
  inkSoft: "#57493c",
  mute: "#8d7f6f",
  bordeaux: "#7e2a3a",
  blush: "#f2e3dc",
  sage: "#77806b",
  gold: "#a9853f",
} as const;

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600 | 700;
  style: "normal";
}

async function loadGoogleFont(
  family: string,
  weight: number,
  text: string
): Promise<ArrayBuffer | null> {
  try {
    const url =
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}` +
      `&text=${encodeURIComponent(text)}`;
    const css = await fetch(url).then((r) => r.text());
    const src = css.match(/src:\s*url\((.+?)\)\s*format\('(?:opentype|truetype)'\)/);
    if (!src) return null;
    return await fetch(src[1]).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * Görselde geçen metne göre başlık + gövde fontlarını indirir.
 * Ağ hatasında boş dizi döner; ImageResponse o durumda gömülü
 * yedek fontuna düşer, görsel yine üretilir.
 */
export async function ogFonts(text: string): Promise<OgFont[]> {
  const [display, body] = await Promise.all([
    loadGoogleFont("Fraunces", 600, text),
    loadGoogleFont("Plus+Jakarta+Sans", 500, text),
  ]);

  const fonts: OgFont[] = [];
  if (display) fonts.push({ name: "Fraunces", data: display, weight: 600, style: "normal" });
  if (body) fonts.push({ name: "Jakarta", data: body, weight: 400, style: "normal" });
  return fonts;
}

/** Fontun taşıması gereken tüm karakterler (Türkçe dahil). */
export function ogCharset(...parts: (string | number | null | undefined)[]) {
  const base = "abcçdefgğhıijklmnoöprsştuüvyzqwxABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZQWX0123456789.,:;–—·|/()₺%+&'\" ";
  return base + parts.filter(Boolean).join("");
}
