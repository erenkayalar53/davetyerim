"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, CITIES, slugifyTr } from "@/lib/constants";

export function SearchBox() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [guests, setGuests] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set("kategori", category);
    if (guests) params.set("kisi", guests);
    const base = city ? `/mekanlar/${slugifyTr(city)}` : "/mekanlar";
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full max-w-3xl flex-col gap-2 rounded-[1.75rem] border border-hairline bg-parchment/85 p-2 shadow-lift backdrop-blur-xl sm:flex-row sm:items-center sm:rounded-full"
    >
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        aria-label="Şehir seçin"
        className="h-12 flex-1 rounded-full bg-transparent px-5 text-sm text-ink outline-none transition-colors hover:bg-cream-deep/60"
      >
        <option value="">Tüm Şehirler</option>
        {CITIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="hidden h-6 w-px bg-hairline sm:block" />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        aria-label="Etkinlik türü seçin"
        className="h-12 flex-1 rounded-full bg-transparent px-5 text-sm text-ink outline-none transition-colors hover:bg-cream-deep/60"
      >
        <option value="">Etkinlik Türü</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.slug} value={cat.slug}>
            {cat.label}
          </option>
        ))}
      </select>

      <div className="hidden h-6 w-px bg-hairline sm:block" />

      <input
        type="number"
        min={1}
        value={guests}
        onChange={(e) => setGuests(e.target.value)}
        placeholder="Davetli sayısı"
        aria-label="Davetli sayısı"
        className="h-12 w-full rounded-full bg-transparent px-5 text-sm text-ink outline-none transition-colors placeholder:text-mute hover:bg-cream-deep/60 sm:w-36"
      />

      <button
        type="submit"
        className="group flex h-12 items-center justify-center gap-2 rounded-full bg-bordeaux pl-6 pr-2 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.98]"
      >
        Mekan Bul
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-lux group-hover:translate-x-0.5 group-hover:scale-105">
          ↗
        </span>
      </button>
    </form>
  );
}
