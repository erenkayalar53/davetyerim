import Link from "next/link";
import type { SearchParams } from "@/lib/search-params";

interface PaginationProps {
  total: number;
  pageSize: number;
  currentPage: number;
  basePath: string;
  searchParams: SearchParams;
}

function buildHref(
  basePath: string,
  sp: SearchParams,
  page: number
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (key === "sayfa" || value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.set(key, value);
  }
  if (page > 1) params.set("sayfa", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({
  total,
  pageSize,
  currentPage,
  basePath,
  searchParams,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Sayfalama" className="mt-14 flex justify-center gap-2">
      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(basePath, searchParams, page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors duration-300 ${
            page === currentPage
              ? "bg-bordeaux text-cream"
              : "border border-hairline bg-parchment text-ink-soft hover:border-bordeaux/40 hover:text-bordeaux"
          }`}
        >
          {page}
        </Link>
      ))}
    </nav>
  );
}
