import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VenueDirectory, directoryTitle } from "@/components/venue-directory";
import {
  isFilteredView,
  parseFilters,
  type SearchParams,
} from "@/lib/search-params";
import { cityFromSlug, getCityVenueCount } from "@/lib/data";
import { FEATURED_CITIES, slugifyTr } from "@/lib/constants";

interface PageProps {
  params: Promise<{ sehir: string }>;
  searchParams: Promise<SearchParams>;
}

/**
 * Yalnızca envanterin yoğun olduğu iller derleme anında üretilir.
 * Kalan 69 il yine çalışır, ilk istekte sunucuda oluşturulur — 81 ilin
 * tamamını her derlemede önceden üretmek build süresini boşuna uzatırdı.
 */
export function generateStaticParams() {
  return FEATURED_CITIES.map((city) => ({ sehir: slugifyTr(city) }));
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
  const title = directoryTitle(sehir, filters.categories);

  // Envanteri olmayan il sayfası ince içeriktir; dizine girmesin ama
  // içindeki bağlantılar taranmaya devam etsin.
  const venueCount = await getCityVenueCount(city);
  const noIndex = isFilteredView(sp) || venueCount === 0;

  return {
    title: venueCount === 0 ? `${city} Davet Mekanları` : `${title} ve Fiyatları`,
    description:
      venueCount === 0
        ? `${city} için mekan listemiz hazırlanıyor. Bölgede işletmeniz varsa ücretsiz mekan sayfanızı hemen açabilirsiniz.`
        : `${city} bölgesindeki düğün, nişan ve davet mekanlarını keşfedin. Kişi başı fiyatları karşılaştırın, kapasiteye göre filtreleyin, ücretsiz teklif alın.`,
    alternates: { canonical: `/mekanlar/${sehir}` },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
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
