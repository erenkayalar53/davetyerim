"use client";

import { useEffect, useState } from "react";

export interface VenueTab {
  id: string;
  label: string;
}

export function VenueTabs({ tabs }: { tabs: VenueTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
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
    const y = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <div className="sticky top-20 z-30 -mx-4 mb-8 border-y border-hairline bg-cream/85 px-4 backdrop-blur-xl sm:top-24">
      <div className="scroll-thin flex gap-1 overflow-x-auto py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => scrollTo(tab.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors duration-300 ease-lux ${
              active === tab.id
                ? "bg-bordeaux text-cream"
                : "text-ink-soft hover:bg-cream-deep hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
