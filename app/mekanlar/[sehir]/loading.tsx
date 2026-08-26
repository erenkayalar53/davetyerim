import { VenueGridSkeleton, FiltersSkeleton, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:pt-36">
      <Skeleton className="h-6 w-36 rounded-full" />
      <Skeleton className="mt-4 h-12 w-2/3 max-w-lg" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <FiltersSkeleton />
        </aside>
        <VenueGridSkeleton />
      </div>
    </div>
  );
}
