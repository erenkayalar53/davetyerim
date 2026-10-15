"use client";

import { useEffect, useRef, useState } from "react";

export interface VenueTab {
  id: string;
  label: string;
  count?: number;
}

export function VenueStickyBar({
  venueName,
  priceLabel,
  tabs,
}: {
  venueName: string;
  priceLabel: string;
  tabs: VenueTab[];
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(tabs[0]?.id);

  // Başlık bloğu ekranın üstünden çıkınca bar devreye girer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Bar devredeyken site header'ı geri çekilir — kural globals.css'te
  useEffect(() => {
    if (shown) document.body.dataset.venueBar = "on";
    else delete document.body.dataset.venueBar;
    return () => {
      delete document.body.dataset.venueBar;
    };
  }, [shown]);

  // Okunan bölümü sekmede işaretle
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-160px 0px -60% 0px", threshold: 0 }
    );
    tabs.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tabs]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = (barRef.current?.offsetHeight ?? 104) + 16;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - offset,
      behavior: "smooth",
    });
  }

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />

      <div
        ref={barRef}
        className={`fixed inset-x-0 top-0 z-50 hidden border-b border-hairline bg-parchment/95 backdrop-blur-xl transition-transform duration-500 ease-lux motion-reduce:transition-none md:block ${
          shown ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4">
          <p className="truncate font-display text-lg font-semibold text-ink">
            {venueName}
          </p>
          <div className="flex shrink-0 items-center gap-5">
            <p className="text-sm">
              <span className="text-mute">Kişi başı</span>{" "}
              <span className="font-medium text-bordeaux">{priceLabel}</span>
            </p>
            <button
              type="button"
              onClick={() => scrollTo("teklif")}
              className="rounded-full bg-bordeaux px-5 py-2 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.98]"
            >
              Teklif Al
            </button>
          </div>
        </div>

        <nav
          aria-label="Bölümler"
          className="border-t border-hairline/60"
        >
          <div className="scroll-thin mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollTo(tab.id)}
                aria-current={active === tab.id ? "true" : undefined}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-300 ease-lux ${
                  active === tab.id
                    ? "bg-blush font-medium text-bordeaux"
                    : "text-ink-soft hover:bg-cream-deep hover:text-ink"
                }`}
              >
                {tab.label}
                {tab.count ? (
                  <span className="ml-1 text-mute">({tab.count})</span>
                ) : null}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
