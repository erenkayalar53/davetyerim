import { SITE_URL, SITE_NAME } from "@/lib/constants";
import type { Prospect } from "./types";

export interface RenderedMessage {
  subject: string;
  text: string;
  html: string;
}

export interface TemplateContext {
  prospect: Prospect;
  unsubscribeUrl: string;
}

export interface OutreachTemplate {
  key: string;
  label: string;
  step: number;
  render(ctx: TemplateContext): RenderedMessage;
}

/** "İstanbul'daki" / "Ankara'daki" — Türkçe ünlü uyumuna göre ek. */
function locative(city: string): string {
  if (!city) return "bölgenizdeki";
  const lastVowel = [...city.toLocaleLowerCase("tr")]
    .reverse()
    .find((ch) => "aeıioöuü".includes(ch));
  const back = lastVowel ? "aıou".includes(lastVowel) : true;
  const hard = "fstkçşhp".includes(city[city.length - 1].toLocaleLowerCase("tr"));
  const suffix = back ? (hard ? "'taki" : "'daki") : hard ? "'teki" : "'deki";
  return `${city}${suffix}`;
}

/** İlk mesaj: kısa, satış dilinden uzak, tek net eylem çağrısı. */
const introTemplate: OutreachTemplate = {
  key: "intro",
  label: "İlk tanışma",
  step: 1,

  render({ prospect, unsubscribeUrl }) {
    const venue = prospect.name;
    const where = locative(prospect.city);

    const subject = `${venue} — ${SITE_NAME}'de ücretsiz mekan sayfası`;

    // Mekan adı daima "için" edatıyla kullanılıyor: Türkçe'de iyelik/belirtme
    // eki mekan adının son harfine göre değişiyor ve şablonda yanlış ek
    // ("Salonu'i") üretmek mesajı anında özensiz gösteriyor.
    const text = `Merhaba,

${SITE_NAME} olarak düğün, nişan, kına ve kurumsal etkinlik arayan çiftleri
mekanlarla buluşturan bir platform kuruyoruz. Şu sıra ${where} mekanları
listeliyoruz ve ${venue} için de bir sayfa açmak istedik.

Sizden bir ücret talep etmiyoruz: komisyon almıyoruz, rezervasyona karışmıyoruz.
Mekan sayfanız ücretsiz açılıyor; gelen teklif talepleri doğrudan size iletiliyor.

Sayfanızı sizin adınıza hazırlamamızı isterseniz bu e-postayı yanıtlamanız yeterli.
Kendiniz oluşturmak isterseniz: ${SITE_URL}/firmalar-icin

İyi çalışmalar,
${SITE_NAME} ekibi
${SITE_URL}

---
Bu ileti, işletmenizin herkese açık iletişim bilgileri üzerinden ticari bir
iş birliği teklifi olarak gönderilmiştir. Bir daha ileti almak istemiyorsanız:
${unsubscribeUrl}`;

    return { subject, text, html: toHtml(text, unsubscribeUrl) };
  },
};

/** Takip mesajı: daha da kısa, baskı yok, kapanış tonu. */
const followUpTemplate: OutreachTemplate = {
  key: "follow_up",
  label: "Hatırlatma",
  step: 2,

  render({ prospect, unsubscribeUrl }) {
    const venue = prospect.name;

    const subject = `${venue} — kısa bir hatırlatma`;

    const text = `Merhaba,

Geçen hafta ${SITE_NAME} için yazmıştım; gözden kaçmış olabilir diye kısaca
tekrar iletiyorum.

${venue} için ücretsiz mekan sayfası hâlâ açık. İlgilenmiyorsanız bu e-postayı
yok sayabilirsiniz, bir daha yazmayacağım.

İlgileniyorsanız tek yapmanız gereken bu iletiyi yanıtlamak.

İyi çalışmalar,
${SITE_NAME} ekibi
${SITE_URL}

---
İleti almayı durdurmak için: ${unsubscribeUrl}`;

    return { subject, text, html: toHtml(text, unsubscribeUrl) };
  },
};

export const TEMPLATES: OutreachTemplate[] = [introTemplate, followUpTemplate];

export function getTemplate(key: string): OutreachTemplate | null {
  return TEMPLATES.find((t) => t.key === key) ?? null;
}

export function templateForStep(step: number): OutreachTemplate {
  return TEMPLATES.find((t) => t.step === step) ?? introTemplate;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Düz metni sade HTML'e çevirir. Görsel, tablo, takip pikseli yok —
 * ne kadar sade olursa spam filtresinden o kadar rahat geçer.
 */
export function toHtml(text: string, unsubscribeUrl: string): string {
  const [body, footer] = text.split("\n---\n");

  const paragraphs = body
    .trim()
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 16px">${linkify(escapeHtml(p.trim()))}</p>`)
    .join("");

  const footerHtml = footer
    ? `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e6e0d6;font-size:12px;color:#8a8175">
         ${linkify(escapeHtml(footer.trim()))}
       </p>`
    : `<p style="margin:24px 0 0;font-size:12px;color:#8a8175">
         <a href="${escapeHtml(unsubscribeUrl)}" style="color:#8a8175">İleti almayı durdur</a>
       </p>`;

  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#2b2622;max-width:560px">
${paragraphs}${footerHtml}
</div>`;
}

function linkify(escaped: string): string {
  return escaped
    .replace(/\n/g, "<br>")
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" style="color:#7b2d3b">$1</a>'
    );
}
