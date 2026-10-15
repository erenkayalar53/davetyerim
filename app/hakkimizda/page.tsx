import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "davetyerim.com — düğün, nişan, kına ve kurumsal etkinlik mekanlarını tek çatı altında toplayan Türkiye'nin davet mekanı platformu.",
  alternates: { canonical: "/hakkimizda" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:pt-40">
      <Reveal>
        <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
          Hakkımızda
        </span>
        <h1 className="mt-5 font-display text-fluid-section font-semibold text-ink">
          Doğru mekan, her şeyin başlangıcı.
        </h1>
      </Reveal>

      <Reveal className="mt-10 space-y-6 leading-relaxed text-ink-soft">
        <p>
          Bir düğünün, bir nişanın ya da özenle planlanmış bir kurumsal davetin
          hikayesi hep aynı soruyla başlar: <em>&ldquo;Nerede?&rdquo;</em>{" "}
          davetyerim.com, bu sorunun cevabını kolaylaştırmak için kuruldu.
        </p>
        <p>
          Türkiye&apos;nin dört bir yanındaki düğün salonlarını, kır
          bahçelerini, tarihi mekanları, beach club&apos;ları ve davet evlerini
          tek platformda topluyoruz. Kapasiteye, kişi başı fiyata, şehre ve
          mekan özelliklerine göre filtreleyin; fotoğrafları inceleyin,
          mekanlardan ücretsiz teklif alın.
        </p>
        <p>
          Mekan sahipleri için modelimiz nettir: komisyon almıyoruz.
          Rezervasyon başına kesinti yok, gizli ücret yok. Kazandığınız her iş
          tamamen sizindir. Her mekanın ihtiyacı farklı olduğu için hazır paket
          satmıyoruz; bize ulaşın, birlikte belirleyelim.
        </p>
      </Reveal>

      <Reveal className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/mekanlar"
          className="rounded-full bg-bordeaux px-6 py-3 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-bordeaux-deep"
        >
          Mekanları Keşfet
        </Link>
        <Link
          href="/firmalar-icin"
          className="rounded-full border border-hairline bg-parchment px-6 py-3 text-sm font-medium text-ink transition-colors duration-500 ease-lux hover:border-bordeaux/40 hover:text-bordeaux"
        >
          Firmalar İçin
        </Link>
      </Reveal>
    </div>
  );
}
