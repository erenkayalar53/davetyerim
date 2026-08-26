import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "davetyerim.com ile iletişime geçin — mekan kaydı, Premium abonelik ve iş birlikleri için bize ulaşın.",
  alternates: { canonical: "/iletisim" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:pt-40">
      <Reveal>
        <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
          İletişim
        </span>
        <h1 className="mt-5 font-display text-fluid-section font-semibold text-ink">
          Bize ulaşın
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">
          Mekan kaydı, Premium abonelik, iş birliği veya başka bir konuda —
          size en geç bir iş günü içinde dönüş yapıyoruz.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <Reveal>
          <a
            href="mailto:info@davetyerim.com"
            className="block h-full rounded-[1.75rem] border border-hairline bg-parchment p-8 shadow-float transition-all duration-700 ease-lux hover:-translate-y-1 hover:shadow-lift"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
              E-posta
            </p>
            <p className="mt-3 font-display text-xl font-semibold text-bordeaux">
              info@davetyerim.com
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Genel sorular ve destek için
            </p>
          </a>
        </Reveal>
        <Reveal delay={100}>
          <a
            href="mailto:mekan@davetyerim.com"
            className="block h-full rounded-[1.75rem] border border-hairline bg-parchment p-8 shadow-float transition-all duration-700 ease-lux hover:-translate-y-1 hover:shadow-lift"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
              Mekan Sahipleri
            </p>
            <p className="mt-3 font-display text-xl font-semibold text-bordeaux">
              mekan@davetyerim.com
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Kayıt, Premium abonelik ve vitrin başvuruları
            </p>
          </a>
        </Reveal>
      </div>
    </div>
  );
}
