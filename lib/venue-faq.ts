import type { FaqItem, Venue } from "./types";
import {
  FEATURE_GROUPS,
  categoryLabel,
  featureLabel,
  formatPrice,
} from "./constants";

/**
 * Mekan verisinden sıkça sorulan soruları üretir.
 *
 * Kural: yalnızca elimizde veri olan sorular üretilir. Bir özellik işaretli
 * değilse "Hayır" cevabı ÜRETİLMEZ — mekan sahibi o kutuyu doldurmamış da
 * olabilir ve yanlış bir olumsuz cevabı FAQ schema'sına basmak istemiyoruz.
 */

/** JS'in toLowerCase'i "İ" için birleşen noktalı "i̇" üretir; önce eşliyoruz. */
function trLower(text: string): string {
  return text.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
}

function joinTr(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} ve ${items[items.length - 1]}`;
}

/** Cümle içinde küçültür ama DJ, LED gibi kısaltmaları bozmaz. */
function lowerLabel(label: string): string {
  return label
    .split(" ")
    .map((word) =>
      word.length > 1 && /^[A-ZÇĞİÖŞÜ&-]+$/.test(word) ? word : trLower(word)
    )
    .join(" ");
}

function labelsFromGroups(
  venue: Venue,
  groupTitles: string[],
  exclude: string[] = []
): string[] {
  const slugs = FEATURE_GROUPS.filter((g) =>
    groupTitles.includes(g.title)
  ).flatMap((g) => g.features.map((f) => f.slug as string));
  return venue.features
    .filter((slug) => slugs.includes(slug) && !exclude.includes(slug))
    .map((slug) => lowerLabel(featureLabel(slug)));
}

/** İşaretliyse olumlu cevabı üretilen tekil olanak soruları. */
const AMENITY_QUESTIONS: {
  slug: string;
  question: string;
  answer: (name: string) => string;
}[] = [
  {
    slug: "otopark",
    question: "Otopark var mı?",
    answer: (n) => `Evet, ${n} misafirleriniz için otopark imkanı sunuyor.`,
  },
  {
    slug: "vale",
    question: "Vale hizmeti var mı?",
    answer: (n) => `Evet, ${n} vale hizmeti veriyor.`,
  },
  {
    slug: "nikah-alani",
    question: "Nikah töreni yapılabiliyor mu?",
    answer: (n) =>
      `Evet, ${n} bünyesinde nikah töreni için ayrılmış bir alan bulunuyor.`,
  },
  {
    slug: "gelin-odasi",
    question: "Gelin odası var mı?",
    answer: (n) => `Evet, ${n} gelin odası sunuyor.`,
  },
  {
    slug: "alkol-servisi",
    question: "Alkol servisi yapılıyor mu?",
    answer: (n) =>
      `Evet, ${n} alkol servisi yapıyor. Paket kapsamı için fiyatlar bölümüne bakabilirsiniz.`,
  },
  {
    slug: "disaridan-organizasyon",
    question: "Dışarıdan organizasyon firması getirebilir miyim?",
    answer: (n) =>
      `Evet, ${n} dışarıdan organizasyon firmasıyla çalışmanıza izin veriyor.`,
  },
  {
    slug: "engelli-erisimi",
    question: "Engelli erişimi var mı?",
    answer: (n) => `Evet, ${n} engelli erişimine uygun.`,
  },
  {
    slug: "konaklama",
    question: "Misafirler için konaklama imkanı var mı?",
    answer: (n) => `Evet, ${n} konaklama imkanı sunuyor.`,
  },
  {
    slug: "kisin-acik",
    question: "Kış aylarında da hizmet veriyor mu?",
    answer: (n) => `Evet, ${n} kış aylarında da organizasyon kabul ediyor.`,
  },
];

export function buildVenueFaqs(venue: Venue): FaqItem[] {
  const name = venue.name;
  const items: FaqItem[] = [];

  // Fiyat
  const priceRange = `${formatPrice(venue.price_min)} – ${formatPrice(venue.price_max)} ₺`;
  if (venue.menu_packages.length > 0) {
    const lines = venue.menu_packages.map((p) => {
      const weekday = p.price_weekday ?? p.price;
      const weekend = p.price_weekend ?? p.price;
      return weekday === weekend
        ? `${p.name} kişi başı ${formatPrice(weekday)} ₺`
        : `${p.name} hafta içi kişi başı ${formatPrice(weekday)} ₺, hafta sonu ${formatPrice(weekend)} ₺`;
    });
    items.push({
      q: `${name} fiyatları ne kadar?`,
      a: `${name} kişi başı ${priceRange} aralığında hizmet veriyor. Paketler: ${joinTr(lines)}. Fiyatlar kişi sayısına ve tarihe göre değişebilir; güncel teklif için sayfadaki formu doldurabilirsiniz.`,
    });
  } else {
    items.push({
      q: `${name} fiyatları ne kadar?`,
      a: `${name} kişi başı ${priceRange} aralığında hizmet veriyor. Fiyatlar kişi sayısına, tarihe ve menü tercihine göre değişiyor; net fiyat için sayfadaki formdan ücretsiz teklif alabilirsiniz.`,
    });
  }

  // Kapasite
  const areas = venue.capacity_areas.filter((a) => a.name);
  items.push({
    q: `${name} kaç kişilik?`,
    a:
      `${name}, ${venue.capacity_min} kişiden ${venue.capacity_max} kişiye kadar davet ağırlıyor.` +
      (areas.length > 0
        ? ` Alan bazında: ${joinTr(
            areas.map((a) => `${a.name} ${a.min}–${a.max} kişi`)
          )}.`
        : ""),
  });

  // Organizasyon türleri
  if (venue.categories.length > 0) {
    items.push({
      q: `${name} hangi organizasyonlara ev sahipliği yapıyor?`,
      a: `${name}; ${joinTr(
        venue.categories.map((c) => trLower(categoryLabel(c)))
      )} organizasyonlarına ev sahipliği yapıyor.`,
    });
  }

  // Sunulan hizmetler
  // "Dışarıdan organizasyon" bir hizmet değil, izin — kendi sorusu var.
  const services = labelsFromGroups(
    venue,
    ["İkram & Menü", "Sahne & Teknik", "Ekstra Hizmetler"],
    ["disaridan-organizasyon"]
  );
  if (services.length > 0) {
    items.push({
      q: `${name} hangi hizmetleri sunuyor?`,
      a: `${name} organizasyonunuz için ${joinTr(services)} hizmetleri sunuyor.`,
    });
  }

  // Alan yapısı
  const areaTypes = labelsFromGroups(venue, ["Alan Türü", "Manzara & Konum"]);
  if (areaTypes.length > 0) {
    items.push({
      q: `${name} açık alan mı, kapalı alan mı?`,
      a: `${name} ${joinTr(areaTypes)} özelliklerine sahip. Detaylı liste için özellikler bölümüne bakabilirsiniz.`,
    });
  }

  // Olanaklar — yalnızca işaretli olanlar
  for (const amenity of AMENITY_QUESTIONS) {
    if (venue.features.includes(amenity.slug)) {
      items.push({ q: amenity.question, a: amenity.answer(name) });
    }
  }

  // Kampanya
  if (venue.campaign) {
    const extras = [
      venue.campaign.discount_pct
        ? `%${venue.campaign.discount_pct} indirim`
        : null,
      venue.campaign.min_guests
        ? `en az ${venue.campaign.min_guests} kişilik davetler için`
        : null,
      venue.campaign.valid_until
        ? `${new Date(venue.campaign.valid_until).toLocaleDateString("tr-TR")} tarihine kadar geçerli`
        : null,
    ].filter(Boolean) as string[];
    items.push({
      q: `${name} için güncel kampanya var mı?`,
      a:
        `Evet — ${venue.campaign.title}. ${venue.campaign.text}`.trim() +
        (extras.length > 0 ? ` (${joinTr(extras)}.)` : ""),
    });
  }

  // Konum
  items.push({
    q: `${name} nerede?`,
    a:
      `${name}, ${venue.city}${
        venue.district ? ` ili ${venue.district} ilçesinde` : " ilinde"
      } bulunuyor.` +
      (venue.address ? ` Açık adres: ${venue.address}.` : "") +
      " Yol tarifi için konum bölümündeki haritayı kullanabilirsiniz.",
  });

  // Rezervasyon
  items.push({
    q: `${name} için nasıl teklif alabilirim?`,
    a: `Sayfadaki teklif formunu doldurmanız yeterli. Tarih ve kişi sayınızı ilettiğinizde ${name} size doğrudan dönüş yapıyor. Teklif almak ücretsiz, herhangi bir komisyon alınmıyor.`,
  });

  return items;
}

/**
 * Mekan sahibinin elle girdiği sorular önceliklidir; üretilenlerden aynı
 * soruyu tekrar edenler elenir.
 */
export function venueFaqs(venue: Venue): FaqItem[] {
  const manual = venue.faqs.filter((f) => f.q && f.a);
  const seen = new Set(manual.map((f) => trLower(f.q).replace(/[^\wçğıöşü]/g, "")));

  const generated = buildVenueFaqs(venue).filter((f) => {
    const key = trLower(f.q).replace(/[^\wçğıöşü]/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return [...manual, ...generated];
}
