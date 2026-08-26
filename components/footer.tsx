import Link from "next/link";
import { CATEGORIES, CITIES, slugifyTr } from "@/lib/constants";
import { IconArrowUpRight } from "@/components/icons";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-hairline bg-cream-deep/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-semibold text-ink">
              davet<span className="text-bordeaux">yerim</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              Türkiye&apos;nin dört bir yanından düğün, nişan ve davet
              mekanlarını keşfedin. Kişi başı fiyatları karşılaştırın,
              ücretsiz teklif alın.
            </p>
            <Link
              href="/panel/mekan-ekle"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-bordeaux/30 px-5 py-2.5 text-sm font-medium text-bordeaux transition-colors duration-500 ease-lux hover:bg-bordeaux hover:text-cream"
            >
              Mekanını Ücretsiz Ekle
              <IconArrowUpRight size={14} />
            </Link>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
              Popüler Şehirler
            </p>
            <ul className="mt-4 space-y-2.5">
              {CITIES.slice(0, 6).map((city) => (
                <li key={city}>
                  <Link
                    href={`/mekanlar/${slugifyTr(city)}`}
                    className="text-sm text-ink-soft transition-colors duration-300 hover:text-bordeaux"
                  >
                    {city} Davet Mekanları
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
              Kategoriler
            </p>
            <ul className="mt-4 space-y-2.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/mekanlar?kategori=${cat.slug}`}
                    className="text-sm text-ink-soft transition-colors duration-300 hover:text-bordeaux"
                  >
                    {cat.label} Mekanları
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
              Kurumsal
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/hakkimizda" className="text-sm text-ink-soft transition-colors duration-300 hover:text-bordeaux">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/fiyatlandirma" className="text-sm text-ink-soft transition-colors duration-300 hover:text-bordeaux">
                  Mekan Sahipleri İçin
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-sm text-ink-soft transition-colors duration-300 hover:text-bordeaux">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/sss" className="text-sm text-ink-soft transition-colors duration-300 hover:text-bordeaux">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/gizlilik" className="text-sm text-ink-soft transition-colors duration-300 hover:text-bordeaux">
                  Gizlilik & KVKK
                </Link>
              </li>
              <li>
                <Link href="/giris" className="text-sm text-ink-soft transition-colors duration-300 hover:text-bordeaux">
                  Mekan Sahibi Girişi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-8 text-xs text-mute sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} davetyerim.com — Tüm hakları saklıdır.</p>
          <p>Türkiye&apos;nin davet mekanı platformu</p>
        </div>
      </div>
    </footer>
  );
}
