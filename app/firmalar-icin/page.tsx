import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { OwnerInquiryForm } from "@/components/owner-inquiry-form";
import { IconCheck } from "@/components/icons";

export const metadata: Metadata = {
  title: "Mekanınızı davetyerim'e Ekleyin",
  description:
    "Düğün salonu, kır bahçesi veya davet mekanı işletiyorsanız davetyerim'de yerinizi alın. Rezervasyon komisyonu yok, aylık abonelik modeli.",
  alternates: { canonical: "/firmalar-icin" },
};

const BENEFITS = [
  {
    title: "Komisyon almıyoruz",
    text: "Rezervasyon başına kesinti yok. Çiftle anlaştığınızda kazandığınız iş bütünüyle sizin kalır.",
  },
  {
    title: "Teklif istekleri doğrudan size",
    text: "İlgilenen çiftler tarih ve davetli sayısıyla birlikte panelinize düşer. Aracı yok, gecikme yok.",
  },
  {
    title: "Doğrulanmış İşletme rozeti",
    text: "Belgelerinizi kontrol ediyoruz. Türkiye'deki mekan platformlarının çoğunda yapılmayan bu adım, sizi sıradan ilanlardan ayırır.",
  },
  {
    title: "Görünürlük istatistikleri",
    text: "Mekanınız kaç kez görüntülendi, kaç kişi favoriledi, hangi tarihler soruldu — hepsini panelinizden görün.",
  },
];

const STEPS = [
  {
    title: "Formu doldurun",
    text: "Mekanınızın adı, şehri ve iletişim bilginiz yeterli.",
  },
  {
    title: "Sizi arayalım",
    text: "En geç bir iş günü içinde arayıp mekanınızı, kapasitenizi ve hedefinizi konuşuyoruz.",
  },
  {
    title: "Size özel çözüm",
    text: "Mekanınızın büyüklüğüne ve sezonunuza göre uygun paketi birlikte belirliyoruz.",
  },
  {
    title: "Yayına alalım",
    text: "Fotoğraf, menü ve kapasite bilgilerinizi biz yükleyelim; siz sadece onaylayın.",
  },
];

export default function ForBusinessesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:pt-40">
      <Reveal className="text-center">
        <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
          Firmalar İçin
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-6xl">
          Komisyon yok.
          <br />
          <em className="font-light italic text-bordeaux">
            Sadece doğru çiftler.
          </em>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
          Düğün salonu, kır bahçesi, otel ya da davet mekanı işletiyorsanız
          davetyerim&apos;de yerinizi alın. Her mekanın ihtiyacı farklı — bu
          yüzden hazır paket satmıyoruz. Bizi arayın, birlikte belirleyelim.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
        <div>
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Neden davetyerim?
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((benefit, i) => (
              <Reveal key={benefit.title} delay={i * 90}>
                <div className="h-full rounded-[1.75rem] border border-hairline bg-parchment p-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/15 text-sage">
                    <IconCheck size={14} strokeWidth={2.6} />
                  </span>
                  <p className="mt-4 font-display text-lg font-semibold text-ink">
                    {benefit.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {benefit.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Nasıl işliyor?
            </h2>
          </Reveal>
          <ol className="mt-6 flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 80}>
                <li className="flex gap-4 rounded-[1.5rem] border border-hairline bg-parchment px-6 py-5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blush font-display text-sm font-semibold text-bordeaux">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-ink">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {step.text}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={120} className="lg:sticky lg:top-28">
          <OwnerInquiryForm />
        </Reveal>
      </div>
    </div>
  );
}
