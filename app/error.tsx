"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Sayfa hatası:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-8xl font-light text-bordeaux/25">!</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
        Bir şeyler ters gitti
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Sayfa yüklenirken beklenmedik bir hata oluştu. Tekrar denemek çoğu
        zaman yeterli olur.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-bordeaux px-6 py-3 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-bordeaux-deep"
        >
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="rounded-full border border-hairline bg-parchment px-6 py-3 text-sm font-medium text-ink transition-colors duration-500 ease-lux hover:text-bordeaux"
        >
          Ana Sayfa
        </Link>
      </div>
      {error.digest && (
        <p className="mt-8 text-[11px] text-mute">Hata kodu: {error.digest}</p>
      )}
    </div>
  );
}
