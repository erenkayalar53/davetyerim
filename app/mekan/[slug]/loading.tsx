import { Skeleton, VenueCardSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:pt-36">
      {/* Sayfa yolu */}
      <Skeleton className="h-3 w-72" />

      {/* Başlık */}
      <Skeleton className="mt-6 h-11 w-3/4 max-w-2xl" />
      <Skeleton className="mt-3 h-4 w-1/2 max-w-md" />

      {/* Galeri */}
      <Skeleton className="mt-8 aspect-[16/9] w-full rounded-[1.75rem]" />
      <div className="mt-3 flex gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-28 shrink-0 rounded-2xl" />
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Sekmeler */}
          <div className="flex gap-2 border-b border-hairline pb-3">
            {["w-20", "w-16", "w-24", "w-16", "w-20"].map((w, i) => (
              <Skeleton key={i} className={`h-7 rounded-full ${w}`} />
            ))}
          </div>

          <Skeleton className="mt-8 h-6 w-40" />
          <div className="mt-4 flex flex-col gap-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          {/* Özellik ızgarası */}
          <Skeleton className="mt-10 h-6 w-44" />
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Teklif formu kartı */}
        <aside>
          <Skeleton className="h-[420px] w-full rounded-[1.75rem]" />
        </aside>
      </div>

      {/* Benzer mekanlar */}
      <Skeleton className="mt-16 h-8 w-56" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <VenueCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
