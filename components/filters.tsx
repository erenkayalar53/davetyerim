"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  CATEGORIES,
  VENUE_TYPES,
  FEATURES,
  CITIES,
  CAPACITY_RANGES,
  PRICE_RANGES,
  slugifyTr,
} from "@/lib/constants";

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-hairline pt-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
        {title}
      </p>
      <div className="mt-3 flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function FilterOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-max rounded-full px-3.5 py-1.5 text-left text-[13px] transition-colors duration-300 ease-lux ${
        active
          ? "bg-bordeaux text-cream"
          : "bg-cream-deep/70 text-ink-soft hover:bg-blush hover:text-bordeaux"
      }`}
    >
      {label}
    </button>
  );
}

export function Filters({ citySlug }: { citySlug?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeFeatures = searchParams.getAll("ozellik");

  function navigate(params: URLSearchParams, nextPath?: string) {
    params.delete("sayfa");
    const qs = params.toString();
    const target = nextPath ?? pathname;
    startTransition(() => {
      router.push(qs ? `${target}?${qs}` : target, { scroll: false });
    });
  }

  function toggleParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) params.delete(key);
    else params.set(key, value);
    navigate(params);
  }

  function toggleFeature(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("ozellik");
    params.delete("ozellik");
    const next = current.includes(value)
      ? current.filter((f) => f !== value)
      : [...current, value];
    next.forEach((f) => params.append("ozellik", f));
    navigate(params);
  }

  function selectCity(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    navigate(params, slug ? `/mekanlar/${slug}` : "/mekanlar");
  }

  function clearAll() {
    startTransition(() => {
      router.push("/mekanlar", { scroll: false });
    });
  }

  const activeCount =
    ["kategori", "tip", "kapasite", "fiyat", "kisi"].filter((k) =>
      searchParams.has(k)
    ).length +
    activeFeatures.length +
    (citySlug ? 1 : 0);

  const body = (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-semibold text-ink">Filtrele</p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-bordeaux underline-offset-2 hover:underline"
          >
            Temizle ({activeCount})
          </button>
        )}
      </div>

      <FilterGroup title="Şehir">
        <select
          value={citySlug ?? ""}
          onChange={(e) => selectCity(e.target.value)}
          className="field"
          aria-label="Şehir filtresi"
        >
          <option value="">Tüm Şehirler</option>
          {CITIES.map((c) => (
            <option key={c} value={slugifyTr(c)}>
              {c}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Etkinlik Türü">
        {CATEGORIES.map((cat) => (
          <FilterOption
            key={cat.slug}
            label={cat.label}
            active={searchParams.get("kategori") === cat.slug}
            onClick={() => toggleParam("kategori", cat.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Mekan Tipi">
        {VENUE_TYPES.map((type) => (
          <FilterOption
            key={type.slug}
            label={type.label}
            active={searchParams.get("tip") === type.slug}
            onClick={() => toggleParam("tip", type.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Davetli Kapasitesi">
        {CAPACITY_RANGES.map((range) => {
          const value = `${range.min}-${range.max}`;
          return (
            <FilterOption
              key={value}
              label={range.label}
              active={searchParams.get("kapasite") === value}
              onClick={() => toggleParam("kapasite", value)}
            />
          );
        })}
      </FilterGroup>

      <FilterGroup title="Kişi Başı Fiyat">
        {PRICE_RANGES.map((range) => {
          const value = `${range.min}-${range.max}`;
          return (
            <FilterOption
              key={value}
              label={range.label}
              active={searchParams.get("fiyat") === value}
              onClick={() => toggleParam("fiyat", value)}
            />
          );
        })}
      </FilterGroup>

      <FilterGroup title="Mekan Özellikleri">
        {FEATURES.map((feature) => (
          <label
            key={feature.slug}
            className="flex cursor-pointer items-center gap-2.5 py-0.5 text-[13px] text-ink-soft"
          >
            <input
              type="checkbox"
              checked={activeFeatures.includes(feature.slug)}
              onChange={() => toggleFeature(feature.slug)}
              className="h-4 w-4 accent-[#7e2a3a]"
            />
            {feature.label}
          </label>
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <>
      {/* Mobil: filtre aç/kapa */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="mb-4 flex w-full items-center justify-between rounded-full border border-hairline bg-parchment px-5 py-3 text-sm font-medium text-ink lg:hidden"
        aria-expanded={mobileOpen}
      >
        Filtrele {activeCount > 0 ? `(${activeCount})` : ""}
        <span
          className={`transition-transform duration-500 ease-lux ${mobileOpen ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      <div
        className={`${mobileOpen ? "block" : "hidden"} rounded-[1.75rem] border border-hairline bg-parchment p-6 shadow-float lg:block`}
      >
        {body}
      </div>
    </>
  );
}
