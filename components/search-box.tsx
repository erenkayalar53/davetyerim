"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, CITIES, slugifyTr } from "@/lib/constants";
import { IconArrowUpRight } from "@/components/icons";
import { todayISO } from "@/lib/event-date";

export function SearchBox() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");

  const today = todayISO();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set("kategori", category);
    if (date) params.set("tarih", date);
    if (guests) params.set("kisi", guests);
    const base = city ? `/mekanlar/${slugifyTr(city)}` : "/mekanlar";
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base);
  }

  return (
    <form
      onSubmit={handleSearch}
      /* Tek satıra beşinci alan (tarih) girdiği için satır düzeni md'den
         itibaren açılıyor; altında alanlar tam genişlikte dikey yığılır. */
      className="flex w-full max-w-4xl flex-col gap-2 rounded-[1.75rem] border border-hairline bg-parchment/85 p-2 shadow-lift backdrop-blur-xl md:flex-row md:items-center md:rounded-full"
    >
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        aria-label="Şehir seçin"
        className="h-12 flex-1 rounded-full bg-transparent px-5 text-sm text-ink outline-none transition-colors hover:bg-cream-deep/60 focus-visible:bg-cream-deep/60 focus-visible:shadow-[inset_0_0_0_2px_var(--color-bordeaux)]"
      >
        <option value="">Tüm Şehirler</option>
        {CITIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="hidden h-6 w-px bg-hairline md:block" />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        aria-label="Etkinlik türü seçin"
        className="h-12 flex-1 rounded-full bg-transparent px-5 text-sm text-ink outline-none transition-colors hover:bg-cream-deep/60 focus-visible:bg-cream-deep/60 focus-visible:shadow-[inset_0_0_0_2px_var(--color-bordeaux)]"
      >
        <option value="">Etkinlik Türü</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.slug} value={cat.slug}>
            {cat.label}
          </option>
        ))}
      </select>

      <div className="hidden h-6 w-px bg-hairline md:block" />

      <input
        type="date"
        min={today}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        aria-label="Etkinlik tarihi"
        className={`h-12 w-full rounded-full bg-transparent px-5 text-sm outline-none transition-colors hover:bg-cream-deep/60 md:w-[9.5rem] focus-visible:bg-cream-deep/60 focus-visible:shadow-[inset_0_0_0_2px_var(--color-bordeaux)] ${
          date ? "text-ink" : "text-mute"
        }`}
      />

      <div className="hidden h-6 w-px bg-hairline md:block" />

      <input
        type="number"
        min={1}
        value={guests}
        onChange={(e) => setGuests(e.target.value)}
        placeholder="Davetli sayısı"
        aria-label="Davetli sayısı"
        className="h-12 w-full rounded-full bg-transparent px-5 text-sm text-ink outline-none transition-colors placeholder:text-mute hover:bg-cream-deep/60 md:w-[8.5rem] focus-visible:bg-cream-deep/60 focus-visible:shadow-[inset_0_0_0_2px_var(--color-bordeaux)]"
      />

      <button
        type="submit"
        className="group flex h-12 items-center justify-center gap-2 rounded-full bg-bordeaux pl-6 pr-2 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.98]"
      >
        Mekan Bul
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-lux group-hover:translate-x-0.5 group-hover:scale-105">
          <IconArrowUpRight size={15} strokeWidth={2.2} />
        </span>
      </button>
    </form>
  );
}
