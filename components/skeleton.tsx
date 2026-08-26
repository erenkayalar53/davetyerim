/**
 * Yükleme iskeletleri.
 *
 * Tüm rotalar sunucuda render edildiği için (dynamic SSR), filtre değişimi ya da
 * sayfa geçişi bir sunucu turu bekletiyor. Bu bileşenler o boşlukta gerçek
 * yerleşimin iskeletini gösterir — kullanıcı sayfanın donduğunu değil,
 * yüklendiğini görür.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

/** Mekan kartı iskeleti — VenueCard ile aynı ölçüler. */
export function VenueCardSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-hairline bg-parchment p-1.5 shadow-float">
      <Skeleton className="aspect-[4/3] w-full rounded-[calc(1.75rem-0.375rem)]" />
      <div className="px-4 pb-4 pt-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2.5 h-3.5 w-1/2" />
        <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}

export function VenueGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <VenueCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Filtre kenar çubuğu iskeleti. */
export function FiltersSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-hairline bg-parchment p-6 shadow-float">
      {[5, 4, 6, 3].map((rows, g) => (
        <div key={g} className={g > 0 ? "mt-7" : ""}>
          <Skeleton className="h-2.5 w-24" />
          <div className="mt-4 flex flex-col gap-2.5">
            {Array.from({ length: rows }, (_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
