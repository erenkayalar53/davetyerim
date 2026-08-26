import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Accordion, type QA } from "@/components/accordion";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description:
    "davetyerim.com hakkında çiftlerin ve mekan sahiplerinin en çok sorduğu sorular: mekan bulma, teklif alma, doğrulanmış işletmeler, üyelik ve daha fazlası.",
  alternates: { canonical: "/sss" },
};

const REASONS = [
  {
    title: "Doğrulanmış işletmeler",
    text: "Türkiye'deki mekan platformlarının çoğunda böyle bir kontrol yok. Biz vergi levhası ve işyeri ruhsatını inceleyip onaylanan mekanlara “Doğrulanmış” rozeti veriyoruz — dolandırıcılık riskine karşı gerçek bir güvence.",
  },
  {
    title: "Şeffaf kişi başı fiyat",
    text: "Yemekli/alkollü paketler dahil kişi başı fiyatları açıkça görün, sürprizle karşılaşmayın.",
  },
  {
    title: "Ücretsiz ve hızlı teklif",
    text: "Tek formla birden fazla mekandan teklif alın; aramakla vakit kaybetmeyin.",
  },
];

const COUPLE_FAQ: QA[] = [
  {
    q: "davetyerim.com'u kullanmak ücretli mi?",
    a: "Hayır. Çiftler ve ziyaretçiler için tamamen ücretsizdir. Mekanları arayabilir, favorileyebilir ve teklif isteyebilirsiniz — hiçbir ücret ödemezsiniz.",
  },
  {
    q: "Mekanlardan nasıl teklif alırım?",
    a: "Beğendiğiniz mekanın sayfasındaki “Ücretsiz Teklif Al” formunu doldurmanız yeterli. Tarihiniz ve davetli sayınızla birlikte isteğiniz doğrudan mekan sahibine iletilir; kısa sürede sizinle iletişime geçilir.",
  },
  {
    q: "“Doğrulanmış İşletme” rozeti ne anlama geliyor?",
    a: "Bu rozeti taşıyan mekanların vergi levhası ve işyeri açma/çalışma ruhsatı gibi belgeleri ekibimizce incelenmiştir. Türkiye'deki mekan platformlarının çoğunda belge bazlı bir kontrol yapılmaz; biz bunu ziyaretçilerimize güven vermek için önemli bir adım olarak görüyoruz. Rozetli mekanlar gerçek, kayıtlı ve yasal olarak işletilen mekanlardır.",
  },
  {
    q: "Kişi başı fiyatlar kesin mi?",
    a: "Fiyatlar mekanların belirttiği güncel aralıklardır ve menü, sezon, davetli sayısına göre değişebilir. Kesin fiyat için mutlaka teklif formuyla mekandan net teklif alın.",
  },
  {
    q: "Kaporayı platform üzerinden mi ödüyorum?",
    a: "Hayır, davetyerim.com bir tanıştırma platformudur; ödeme veya kapora işlemleri sizinle mekan arasında olur. Güvenliğiniz için kaporayı yazılı sözleşme veya fatura almadan göndermemenizi öneririz.",
  },
  {
    q: "Bir mekanı nasıl kaydederim / karşılaştırırım?",
    a: "Kalp ikonuna dokunarak mekanları Favorilerim'e ekleyin. Böylece beğendiğiniz mekanların kişi başı fiyatını, kapasitesini ve özelliklerini bir arada değerlendirebilirsiniz.",
  },
];

const OWNER_FAQ: QA[] = [
  {
    q: "Mekanımı eklemek ücretli mi?",
    a: "Mekanınızı ücretsiz ekleyebilir ve teklif istekleri almaya başlayabilirsiniz. Komisyon almıyoruz. Daha fazla görünürlük isterseniz aylık Premium aboneliğe geçebilirsiniz.",
  },
  {
    q: "Neden komisyon yerine abonelik?",
    a: "Rezervasyon başına kesinti yapmıyoruz; kazandığınız her iş tamamen sizindir. Sadece görünürlüğünüzü artırmak isterseniz sabit aylık Premium ücreti ödersiniz — böylece maliyetiniz öngörülebilir olur.",
  },
  {
    q: "Mekan sahibi olmak için ne gerekiyor?",
    a: "Ücretsiz hesap açıp “Mekan Sahibi Ol” bölümünden işletme başvurusu yapmanız gerekir. İşletme adı, telefon, şehir ve belgelerinizi (vergi levhası, işyeri ruhsatı) yüklersiniz; ekibimiz doğruladıktan sonra hesabınız aktifleşir.",
  },
  {
    q: "Hangi belgeleri yüklemem gerekiyor?",
    a: "“Doğrulanmış İşletme” rozeti için vergi levhası ve işyeri açma/çalışma ruhsatı önerilir; alkollü paket sunuyorsanız alkol belgesi de gerekir. Belgeleriniz gizli tutulur, yalnızca doğrulama ekibimiz görür.",
  },
  {
    q: "Mekanım ne zaman yayına girer?",
    a: "Başvurunuz onaylandıktan sonra mekanınızı ekleyebilirsiniz. Eklenen her mekan, kalite ve güven için ekibimizce kısa bir incelemeden geçer; onaylandığında yayına girer ve binlerce çift tarafından görülür.",
  },
  {
    q: "Gelen teklif isteklerini nasıl görürüm?",
    a: "Panelinizde tüm teklif istekleri; çiftin adı, telefonu, etkinlik tarihi ve davetli sayısıyla listelenir. Ayrıca mekanınızın kaç kez görüntülendiğini ve kaç kişi tarafından favorilendiğini de görürsünüz.",
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [...COUPLE_FAQ, ...OWNER_FAQ].map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-32 sm:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Reveal className="text-center">
        <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
          Sıkça Sorulan Sorular
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Merak edilenler
        </h1>
      </Reveal>

      {/* Neden davetyerim */}
      <Reveal className="mt-14">
        <div className="rounded-[2rem] border border-hairline bg-ink p-1.5 shadow-lift">
          <div className="rounded-[calc(2rem-0.375rem)] bg-ink px-6 py-10 sm:px-10">
            <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Neden davetyerim.com?
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {REASONS.map((r) => (
                <div
                  key={r.title}
                  className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5"
                >
                  <p className="font-display text-lg font-semibold text-blush">
                    {r.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Çiftler için */}
      <section className="mt-16">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Çiftler & Ziyaretçiler İçin
          </h2>
        </Reveal>
        <Reveal className="mt-6">
          <Accordion items={COUPLE_FAQ} />
        </Reveal>
      </section>

      {/* Mekan sahipleri için */}
      <section className="mt-16">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Mekan Sahipleri İçin
          </h2>
        </Reveal>
        <Reveal className="mt-6">
          <Accordion items={OWNER_FAQ} />
        </Reveal>
      </section>

      {/* CTA */}
      <Reveal className="mt-16">
        <div className="flex flex-col items-center gap-4 rounded-[1.75rem] border border-hairline bg-parchment p-10 text-center">
          <p className="font-display text-2xl font-semibold text-ink">
            Sorunuz mu var?
          </p>
          <p className="max-w-md text-sm text-ink-soft">
            Aradığınız yanıtı bulamadıysanız bize yazın, en kısa sürede
            dönüş yapalım.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/mekanlar"
              className="rounded-full bg-bordeaux px-6 py-3 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-bordeaux-deep"
            >
              Mekanları Keşfet
            </Link>
            <Link
              href="/iletisim"
              className="rounded-full border border-hairline bg-cream px-6 py-3 text-sm font-medium text-ink transition-colors duration-500 ease-lux hover:text-bordeaux"
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
