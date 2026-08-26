"use client";

import { useEffect, useRef } from "react";

/**
 * Hero görselini scroll ile yavaşça aşağı kaydırır — sayfa kayarken görsel
 * metinden daha yavaş hareket eder, derinlik hissi verir.
 *
 * requestAnimationFrame ile tek bir yazma yapar; scroll dinleyicisi pasiftir,
 * yani kaydırmayı bloke etmez. Hero ekrandan çıkınca tamamen durur.
 */
export function HeroParallax({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let ticking = false;
    let visible = true;

    function update() {
      ticking = false;
      if (!el || !visible) return;
      // Hero yüksekliğinin en fazla %18'i kadar kayar.
      const offset = Math.min(window.scrollY * 0.18, window.innerHeight * 0.18);
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    // Hero görünmüyorken hiç hesap yapma.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) onScroll();
      },
      { threshold: 0 }
    );
    io.observe(el);

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 will-change-transform">
      {children}
    </div>
  );
}
