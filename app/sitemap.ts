import type { MetadataRoute } from "next";
import { getApprovedVenuesForSitemap } from "@/lib/data";
import { CITIES, SITE_URL, slugifyTr } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const venues = await getApprovedVenuesForSitemap();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/mekanlar`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/fiyatlandirma`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/sss`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/hakkimizda`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/iletisim`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/gizlilik`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const cityPages: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${SITE_URL}/mekanlar/${slugifyTr(city)}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const venuePages: MetadataRoute.Sitemap = venues.map((v) => ({
    url: `${SITE_URL}/mekan/${v.slug}`,
    lastModified: v.updated_at ? new Date(v.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...cityPages, ...venuePages];
}
