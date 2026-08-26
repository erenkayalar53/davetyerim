import { Skeleton, VenueGridSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:pt-36">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-3 h-4 w-72 max-w-full" />
      <div className="mt-10">
        <VenueGridSkeleton count={4} />
      </div>
    </div>
  );
}
