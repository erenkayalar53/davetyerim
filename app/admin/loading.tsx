import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:pt-36">
      <Skeleton className="h-10 w-44" />
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-[1.5rem]" />
        ))}
      </div>
      <Skeleton className="mt-10 h-96 w-full rounded-[1.75rem]" />
    </div>
  );
}
