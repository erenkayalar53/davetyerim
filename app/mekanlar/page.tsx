import type { Metadata } from "next";
import { VenueDirectory, directoryTitle } from "@/components/venue-directory";
import {
  isFilteredView,
  parseFilters,
  type SearchParams,
} from "@/lib/search-params";
import { hasPublishedVenues } from "@/lib/data";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const title = directoryTitle(undefined, filters.categories);
  // Filtreli görünümler ve envanterin boş olduğu hâl dizine girmemeli.
  const noindex = isFilteredView(sp) || !(await hasPublishedVenues());
  return {
    title: `${title} ve Fiyatları`,
    description: `${title} — kapasite, kişi başı fiyat ve mekan özelliklerine göre karşılaştırın, ücretsiz teklif alın.`,
    alternates: { canonical: "/mekanlar" },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function VenuesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return <VenueDirectory searchParams={sp} />;
}
