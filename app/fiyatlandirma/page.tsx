import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { IconCheck } from "@/components/icons";

export const metadata: Metadata = {
  title: "Mekan Sahipleri İçin Fiyatlandırma — Komisyonsuz Abonelik",
  description:
    "Mekanınızı davetyerim.com'a ücretsiz ekleyin. Komisyon yok — dilerseniz aylık Premium abonelikle vitrine çıkın, telefonunuz görünsün, listede üst sırada yer alın.",
  alternates: { canonical: "/fiyatlandirma" },
};

const PLANS = [
  {
    name: "Ücretsiz",
    price: "0 ₺",
    period: "her zaman",
    description: "Mekanınızı platforma taşıyın, teklif istekleri almaya başlayın.",
    features: [
      "Mekan profili ve detay sayfası",
      "3 fotoğraf",
      "Teklif isteği formu ile lead alma",
      "Arama sonuçlarında listelenme",
      "Panel üzerinden istek takibi",
    ],
    cta: "Ücretsiz Başla",
    href: "/kayit",
    highlight: false,
  },
  {
    name: "Premium",
    price: "990 ₺",
    period: "aylık · istediğiniz zaman iptal",
    description:
      "Vitrine çıkın, doğrudan aranın. Komisyon yok — kazandığınız her iş sizin.",
    features: [
      "Sınırsız fotoğraf",
      "Telefon ve WhatsApp butonu görünür",
      "Arama sonuçlarında üst sıra",
      "“Öne Çıkan” rozeti",
      "Ana sayfa vitrininde yer alma",
      "Öncelikli destek",
    ],
    cta: "Premium'a Geç",
    href: "/kayit",
    highlight: true,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:pt-40">
      <Reveal className="text-center">
        <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
          Mekan Sahipleri İçin
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-6xl">
          Komisyon yok.
          <br />
          <em className="font-light italic text-bordeaux">Sadece abonelik.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
          Rezervasyon başına kesinti yapmıyoruz. Ücretsiz listelenin;
          hazır olduğunuzda aylık Premium ile görünürlüğünüzü artırın.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {PLANS.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 120}>
            <div
              className={`h-full rounded-[2rem] border p-1.5 shadow-float transition-shadow duration-700 hover:shadow-lift ${
                plan.highlight
                  ? "border-bordeaux/30 bg-bordeaux"
                  : "border-hairline bg-parchment"
              }`}
            >
              <div
                className={`flex h-full flex-col rounded-[calc(2rem-0.375rem)] p-8 ${
                  plan.highlight ? "bg-bordeaux text-cream" : "bg-cream"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`text-[10px] font-medium uppercase tracking-[0.25em] ${
                      plan.highlight ? "text-blush" : "text-mute"
                    }`}
                  >
                    {plan.name}
                  </p>
                  {plan.highlight && (
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-cream">
                      Önerilen
                    </span>
                  )}
                </div>
                <p className="mt-5 font-display text-5xl font-semibold">
                  {plan.price}
                  <span
                    className={`ml-2 text-sm font-normal ${
                      plan.highlight ? "text-blush" : "text-mute"
                    }`}
                  >
                    / {plan.period}
                  </span>
                </p>
                <p
                  className={`mt-4 text-sm leading-relaxed ${
                    plan.highlight ? "text-white/80" : "text-ink-soft"
                  }`}
                >
                  {plan.description}
                </p>

                <ul className="mt-8 flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.highlight
                            ? "bg-white/15 text-cream"
                            : "bg-sage/15 text-sage"
                        }`}
                      >
                        <IconCheck size={11} strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-10 rounded-full py-3.5 text-center text-sm font-medium transition-all duration-500 ease-lux active:scale-[0.98] ${
                    plan.highlight
                      ? "bg-cream text-bordeaux hover:bg-white"
                      : "bg-ink text-cream hover:bg-ink-soft"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16">
        <div className="rounded-[1.75rem] border border-hairline bg-parchment p-8 text-center">
          <p className="font-display text-xl font-semibold text-ink">
            Premium&apos;a nasıl geçilir?
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
            Şu an Premium aktivasyonu ekibimiz tarafından yapılıyor. Ücretsiz
            kaydınızı oluşturun, ardından{" "}
            <Link href="/iletisim" className="font-medium text-bordeaux hover:underline">
              iletişim sayfasından
            </Link>{" "}
            bize ulaşın — aynı gün aktive edelim.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
