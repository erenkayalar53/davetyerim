"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { toggleDateAvailability } from "@/app/actions/availability";

export function AvailabilityManager({
  venueId,
  initialUnavailableDates,
}: {
  venueId: string;
  initialUnavailableDates: string[];
}) {
  const router = useRouter();
  const [dates, setDates] = useState<Set<string>>(
    new Set(initialUnavailableDates)
  );
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleToggle(date: string, currentlyUnavailable: boolean) {
    setError(null);
    setPendingDate(date);
    startTransition(async () => {
      const result = await toggleDateAvailability(
        venueId,
        date,
        !currentlyUnavailable
      );
      if (result.ok) {
        setDates((prev) => {
          const next = new Set(prev);
          if (currentlyUnavailable) next.delete(date);
          else next.add(date);
          return next;
        });
        router.refresh();
      } else {
        setError(result.message);
      }
      setPendingDate(null);
    });
  }

  return (
    <div>
      <AvailabilityCalendar
        unavailableDates={Array.from(dates)}
        editable
        pendingDate={pendingDate}
        onToggle={handleToggle}
      />
      {error && <p className="mt-3 text-sm text-bordeaux">{error}</p>}
      <p className="mt-3 text-xs text-mute">
        Bir tarihe tıklayarak dolu / müsait olarak işaretleyebilirsiniz.
        Ziyaretçiler bu takvimi mekanınızın sayfasında görür.
      </p>
    </div>
  );
}
