import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SearchBox } from "@/components/search-box";
import { VenueCard } from "@/components/venue-card";
import { getFeaturedVenues, getCityCounts, getFavoriteVenueIds } from "@/lib/data";
import { CATEGORIES } from "@/lib/constants";
import { IconArrowUpRight } from "@/components/icons";
import { DARK_BLUR } from "@/lib/image-placeholder";
import { HeroParallax } from "@/components/hero-parallax";

const CATEGORY_IMAGES: Record<string, string> = {
  dugun:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  nisan:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
  kina: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=80",
  sunnet:
    "https://images.unsplash.com/photo-1530023367847-a683933f4172?auto=format&fit=crop&w=1200&q=80",
  "dogum-gunu":
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
  davet:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
  kurumsal:
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80",
};

export default async function HomePage() {
  const [featured, cities, favoriteIds] = await Promise.all([
    getFeaturedVenues(6),
    getCityCounts(),
    getFavoriteVenueIds(),
  ]);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-32">
        <HeroParallax>
          <Image
            src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2400&q=80"
            alt="Zarif bir davet mekanında düğün hazırlığı"
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={DARK_BLUR}
            className="object-cover ken-burns"
          />
        </HeroParallax>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-cream" />

        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
          <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-cream backdrop-blur-sm">
            Türkiye&apos;nin Davet Mekanı Platformu
          </span>
          <h1 className="mt-8 font-display text-[clamp(2.6rem,7vw,5.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
            Hayalindeki davetin
            <br />
            <em className="font-light italic text-blush">mekanı burada.</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Düğünden nişana, kına gecesinden kurumsal davete — yüzlerce mekanı
            karşılaştır, kişi başı fiyatları gör, ücretsiz teklif al.
          </p>

          <div className="mt-10 w-full">
            <SearchBox />
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-white/80">
            <div className="text-center">
              <p className="font-display text-2xl font-semibold text-white">
                {cities.reduce((sum, c) => sum + c.count, 0)}+
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em]">Mekan</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="font-display text-2xl font-semibold text-white">
                {cities.length}
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em]">Şehir</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="font-display text-2xl font-semibold text-white">
                %100
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em]">
                Ücretsiz Teklif
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- GÜVEN ŞERİDİ ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Belge Kontrollü İşletmeler",
              text: "Türkiye'deki mekan platformlarının çoğunda böyle bir kontrol yok. Vergi levhası ve ruhsatı incelenen mekanlara “Doğrulanmış” rozeti veriyoruz.",
            },
            {
              title: "Şeffaf Fiyatlandırma",
              text: "Gizli paket ya da sürpriz ücret yok; kişi başı fiyatları ve mekan sahibi planlarımızı açıkça paylaşıyoruz.",
            },
            {
              title: "Komisyonsuz Model",
              text: "Rezervasyonunuzdan kesinti almayız. Mekan sahipleri kazandığı her işi tamamen kendine saklar.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div className="h-full rounded-[1.5rem] border border-hairline bg-parchment p-6 shadow-float">
                <p className="font-display text-lg font-semibold text-ink">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {item.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- KATEGORİLER ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
        <Reveal>
          <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
            Etkinlik Türleri
          </span>
          <h2 className="mt-5 max-w-2xl font-display text-fluid-section font-semibold text-ink">
            Her davetin kendine göre bir sahnesi var
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-12">
          {CATEGORIES.map((cat, i) => (
            <Reveal
              key={cat.slug}
              delay={i * 60}
              className={
                i === 0
                  ? "col-span-2 md:col-span-6 md:row-span-2"
                  : "md:col-span-3"
              }
            >
              <Link
                href={`/mekanlar?kategori=${cat.slug}`}
                className={`group relative block h-full overflow-hidden rounded-[1.5rem] border border-hairline bg-parchment p-1.5 shadow-float transition-all duration-700 ease-lux hover:-translate-y-1 hover:shadow-lift ${
                  i === 0 ? "min-h-64 md:min-h-full" : "min-h-40"
                }`}
              >
                <div className="relative h-full min-h-[inherit] overflow-hidden rounded-[calc(1.5rem-0.375rem)]">
                  <Image
                    src={CATEGORY_IMAGES[cat.slug]}
                    alt={`${cat.label} mekanları`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    placeholder="blur"
                    blurDataURL={DARK_BLUR}
                    className="object-cover transition-transform duration-1000 ease-lux group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                  <p
                    className={`absolute bottom-4 left-5 font-display font-semibold text-white ${
                      i === 0 ? "text-2xl sm:text-3xl" : "text-lg"
                    }`}
                  >
                    {cat.label}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- ÖNE ÇIKAN MEKANLAR ---------- */}
      <section className="border-y border-hairline bg-parchment/60 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="rounded-full border border-hairline bg-cream px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
                Seçki
              </span>
              <h2 className="mt-5 font-display text-fluid-section font-semibold text-ink">
                Öne çıkan mekanlar
              </h2>
            </div>
            <Link
              href="/mekanlar"
              className="group inline-flex w-max items-center gap-2 rounded-full border border-hairline bg-cream py-2.5 pl-5 pr-2 text-sm font-medium text-ink transition-all duration-500 ease-lux hover:border-bordeaux/40 hover:text-bordeaux"
            >
              Tümünü Gör
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blush text-bordeaux transition-transform duration-500 ease-lux group-hover:translate-x-0.5">
                <IconArrowUpRight size={14} strokeWidth={2.2} />
              </span>
            </Link>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((venue, i) => (
              <Reveal key={venue.id} delay={i * 80}>
                <VenueCard venue={venue} favorited={favoriteIds.has(venue.id)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- ŞEHİRLER ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
        <Reveal>
          <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
            Keşfet
          </span>
          <h2 className="mt-5 font-display text-fluid-section font-semibold text-ink">
            Şehrine göre mekan bul
          </h2>
        </Reveal>

        <div className="mt-12 flex flex-wrap gap-3">
          {cities.map((c, i) => (
            <Reveal key={c.slug} delay={i * 40}>
              <Link
                href={`/mekanlar/${c.slug}`}
                className="group flex items-center gap-3 rounded-full border border-hairline bg-parchment py-2.5 pl-5 pr-3 shadow-float transition-all duration-500 ease-lux hover:-translate-y-0.5 hover:border-bordeaux/40"
              >
                <span className="font-display text-base font-medium text-ink transition-colors group-hover:text-bordeaux">
                  {c.city}
                </span>
                <span className="rounded-full bg-blush px-2.5 py-0.5 text-xs font-medium text-bordeaux">
                  {c.count}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- NASIL ÇALIŞIR ---------- */}
      <section className="border-y border-hairline bg-cream-deep/50 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="text-center">
            <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
              Nasıl Çalışır
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-fluid-section font-semibold text-ink">
              Üç adımda mekanını ayarla
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Keşfet & Filtrele",
                text: "Şehrine, davetli sayına ve bütçene göre yüzlerce mekanı filtrele; fotoğrafları ve kişi başı fiyatları incele.",
              },
              {
                step: "02",
                title: "Karşılaştır",
                text: "Beğendiğin mekanların kapasitesini, özelliklerini ve fiyat aralıklarını yan yana değerlendir.",
              },
              {
                step: "03",
                title: "Ücretsiz Teklif Al",
                text: "Tek formla mekana ulaş; tarihine özel fiyat teklifini doğrudan mekan sahibinden al.",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 100}>
                <div className="h-full rounded-[1.75rem] border border-hairline bg-parchment p-1.5 shadow-float">
                  <div className="flex h-full flex-col rounded-[calc(1.75rem-0.375rem)] bg-cream p-7">
                    <span className="font-display text-4xl font-light text-bordeaux/30">
                      {item.step}
                    </span>
                    <h3 className="mt-5 font-display text-xl font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                      {item.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- MEKAN SAHİPLERİ CTA ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-hairline bg-ink p-1.5 shadow-lift">
            <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] px-6 py-16 sm:px-16 sm:py-20">
              <Image
                src="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=2000&q=80"
                alt="Akşam davetinde ışıklandırılmış davet alanı"
                fill
                sizes="100vw"
                placeholder="blur"
                blurDataURL={DARK_BLUR}
                className="object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/40" />
              <div className="relative z-10 max-w-xl">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-cream">
                  Mekan Sahipleri İçin
                </span>
                <h2 className="mt-6 font-display text-fluid-title font-semibold text-white">
                  Mekanını binlerce çifte ulaştır
                </h2>
                <p className="mt-4 text-base leading-relaxed text-white/80">
                  Komisyon yok, sürpriz kesinti yok. Mekanını ücretsiz ekle,
                  gelen teklif isteklerini gör; dilersen aylık abonelikle
                  vitrine çık.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/panel/mekan-ekle"
                    className="group flex items-center gap-2 rounded-full bg-cream py-2.5 pl-6 pr-2 text-sm font-medium text-ink transition-all duration-500 ease-lux hover:bg-white active:scale-[0.98]"
                  >
                    Mekanını Ücretsiz Ekle
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 transition-transform duration-500 ease-lux group-hover:translate-x-0.5">
                      <IconArrowUpRight size={15} strokeWidth={2.2} />
                    </span>
                  </Link>
                  <Link
                    href="/fiyatlandirma"
                    className="flex items-center rounded-full border border-white/25 px-6 py-2.5 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-white/10"
                  >
                    Planları İncele
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
