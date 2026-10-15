"use client";

import { useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

const MONTH_NAMES = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildMonthCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Pazartesi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(startOffset).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  return cells;
}

interface AvailabilityCalendarProps {
  unavailableDates: string[];
  editable?: boolean;
  pendingDate?: string | null;
  onToggle?: (date: string, currentlyUnavailable: boolean) => void;
  /**
   * Ziyaretçi takvimden tarih seçebilir. Dolu ve geçmiş günler gerçekten
   * tıklanamaz kalır (disabled) — native date input'ta tek tek gün
   * kapatılamadığı için teklif formu bu modu kullanıyor.
   */
  selectable?: boolean;
  selectedDate?: string | null;
  onSelect?: (date: string) => void;
  /** Yan kolon gibi dar alanlarda tek ay göstermek için. */
  months?: number;
}

export function AvailabilityCalendar({
  unavailableDates,
  editable = false,
  pendingDate = null,
  onToggle,
  selectable = false,
  selectedDate = null,
  onSelect,
  months = 2,
}: AvailabilityCalendarProps) {
  const [monthOffset, setMonthOffset] = useState(0);
  const unavailableSet = new Set(unavailableDates);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function renderMonth(offset: number) {
    const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const year = base.getFullYear();
    const month = base.getMonth();
    const cells = buildMonthCells(year, month);

    return (
      <div
        key={offset}
        className="rounded-2xl border border-hairline bg-parchment p-4"
      >
        <p className="text-center text-sm font-medium text-ink">
          {MONTH_NAMES[month]} {year}
        </p>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-mute">
          {DAY_NAMES.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <span key={`empty-${i}`} />;
            const iso = toISODate(date);
            const isPast = date < today;
            const isUnavailable = unavailableSet.has(iso);
            const isPending = pendingDate === iso;
            const isSelected = selectable && selectedDate === iso;
            const clickable = editable
              ? !isPast && Boolean(onToggle)
              : selectable && !isPast && !isUnavailable && Boolean(onSelect);

            return (
              <button
                key={iso}
                type="button"
                disabled={!clickable || isPending}
                aria-pressed={selectable ? isSelected : undefined}
                onClick={() =>
                  editable
                    ? onToggle?.(iso, isUnavailable)
                    : onSelect?.(iso)
                }
                title={
                  editable
                    ? isUnavailable
                      ? "Müsait yap"
                      : "Dolu olarak işaretle"
                    : isUnavailable
                      ? "Bu tarih dolu — seçilemez"
                      : selectable
                        ? "Bu tarihi seç"
                        : "Müsait görünüyor"
                }
                className={`flex h-8 w-full items-center justify-center rounded-lg text-xs transition-colors duration-200 ${
                  isPast
                    ? "text-mute/40"
                    : isUnavailable
                      ? `bg-bordeaux text-cream${
                          selectable ? " line-through decoration-cream/70" : ""
                        }`
                      : isSelected
                        ? "bg-ink font-semibold text-cream"
                        : "bg-sage/15 text-ink-soft"
                } ${
                  clickable
                    ? "cursor-pointer hover:opacity-80"
                    : isUnavailable && selectable
                      ? "cursor-not-allowed"
                      : "cursor-default"
                } ${isPending ? "opacity-50" : ""}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}
          disabled={monthOffset === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-sm text-ink-soft transition-colors duration-300 hover:border-bordeaux/40 hover:text-bordeaux disabled:cursor-not-allowed disabled:opacity-30"
        >
          <IconChevronLeft size={14} />
          Önceki
        </button>
        <button
          type="button"
          onClick={() => setMonthOffset((m) => m + 1)}
          className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-sm text-ink-soft transition-colors duration-300 hover:border-bordeaux/40 hover:text-bordeaux"
        >
          Sonraki
          <IconChevronRight size={14} />
        </button>
      </div>

      <div
        className={`mt-4 grid gap-4 ${months > 1 ? "sm:grid-cols-2" : ""}`}
      >
        {Array.from({ length: months }, (_, i) => monthOffset + i).map(
          renderMonth
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-soft">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-sage/15" /> Müsait
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-bordeaux" /> Dolu
        </span>
        {selectable && (
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-ink" /> Seçtiğiniz tarih
          </span>
        )}
      </div>
    </div>
  );
}
