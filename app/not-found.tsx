import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-8xl font-light text-bordeaux/25">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
        Aradığınız sayfa bulunamadı
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Sayfa kaldırılmış veya adres değişmiş olabilir. Mekanları keşfetmeye
        devam edin.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-bordeaux px-6 py-3 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-bordeaux-deep"
        >
          Ana Sayfa
        </Link>
        <Link
          href="/mekanlar"
          className="rounded-full border border-hairline bg-parchment px-6 py-3 text-sm font-medium text-ink transition-colors duration-500 ease-lux hover:text-bordeaux"
        >
          Mekanlara Göz At
        </Link>
      </div>
    </div>
  );
}
