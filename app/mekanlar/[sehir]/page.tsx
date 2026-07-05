import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VenueDirectory, directoryTitle } from "@/components/venue-directory";
import { parseFilters, type SearchParams } from "@/lib/search-params";
import { cityFromSlug } from "@/lib/data";
import { CITIES, slugifyTr } from "@/lib/constants";

interface PageProps {
  params: Promise<{ sehir: string }>;
  searchParams: Promise<SearchParams>;
}

export function generateStaticParams() {
  return CITIES.map((city) => ({ sehir: slugifyTr(city) }));
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { sehir } = await params;
  const sp = await searchParams;
  const city = cityFromSlug(sehir);
  if (!city) return {};
  const filters = parseFilters(sp, sehir);
  const title = directoryTitle(sehir, filters.category);
  return {
    title: `${title} ve Fiyatları`,
    description: `${city} bölgesindeki düğün, nişan ve davet mekanlarını keşfedin. Kişi başı fiyatları karşılaştırın, kapasiteye göre filtreleyin, ücretsiz teklif alın.`,
    alternates: { canonical: `/mekanlar/${sehir}` },
  };
}

export default async function CityVenuesPage({
  params,
  searchParams,
}: PageProps) {
  const { sehir } = await params;
  if (!cityFromSlug(sehir)) notFound();
  const sp = await searchParams;
  return <VenueDirectory citySlug={sehir} searchParams={sp} />;
}
