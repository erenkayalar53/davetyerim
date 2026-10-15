"use client";

import { useEffect, useState } from "react";

/**
 * Mobilde ekranın altına sabitlenen dönüşüm çubuğu.
 * Teklif formu görünür alana girdiğinde kendini gizler — formun kendi
 * gönder butonunu kapatmasın diye.
 */
export function VenueCtaBar({ priceLabel }: { priceLabel: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById("teklif");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -25% 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  function scrollToForm() {
    const el = document.getElementById("teklif");
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 104;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-parchment/90 px-4 backdrop-blur-xl transition-transform duration-500 ease-lux lg:hidden ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-mute">
            Kişi başı
          </p>
          <p className="truncate font-display text-lg font-semibold text-bordeaux">
            {priceLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={scrollToForm}
          className="shrink-0 rounded-full bg-bordeaux px-6 py-3.5 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.98]"
        >
          Teklif Al
        </button>
      </div>
    </div>
  );
}
