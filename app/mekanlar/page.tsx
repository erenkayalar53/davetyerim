import type { Metadata } from "next";
import { VenueDirectory, directoryTitle } from "@/components/venue-directory";
import { parseFilters, type SearchParams } from "@/lib/search-params";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const title = directoryTitle(undefined, filters.categories);
  return {
    title: `${title} ve Fiyatları`,
    description: `${title} — kapasite, kişi başı fiyat ve mekan özelliklerine göre karşılaştırın, ücretsiz teklif alın.`,
    alternates: { canonical: "/mekanlar" },
  };
}

export default async function VenuesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return <VenueDirectory searchParams={sp} />;
}
