"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "one-cikan", label: "Öne Çıkanlar" },
  { value: "fiyat-artan", label: "Fiyat (Artan)" },
  { value: "fiyat-azalan", label: "Fiyat (Azalan)" },
  { value: "yeni", label: "En Yeni" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sayfa");
    if (value === "one-cikan") params.delete("sirala");
    else params.set("sirala", value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <select
      value={searchParams.get("sirala") ?? "one-cikan"}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Sıralama"
      className="rounded-full border border-hairline bg-parchment px-4 py-2.5 text-sm text-ink outline-none"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
