import type { MetadataRoute } from "next";
import { getApprovedVenuesForSitemap, getCityCounts } from "@/lib/data";
import { ARTICLE_CATEGORIES, getAllArticles } from "@/lib/articles";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [venues, cityCounts] = await Promise.all([
    getApprovedVenuesForSitemap(),
    getCityCounts(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/mekanlar`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/rehber`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/firmalar-icin`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/sss`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/hakkimizda`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/iletisim`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/gizlilik`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/kullanim-kosullari`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Sitemap'e yalnızca gerçekten mekanı olan iller girer. Envanteri olmayan
  // il sayfası noindex olduğundan, sitemap'e konursa Google'a çelişkili sinyal
  // gider: "bunu tara" ve "bunu dizine alma". Mekan geldiği anda il otomatik
  // olarak sitemap'e ve dizine girer.
  const cityPages: MetadataRoute.Sitemap = cityCounts
    .filter((c) => c.count > 0)
    .map((c) => ({
      url: `${SITE_URL}/mekanlar/${c.slug}`,
      changeFrequency: "daily",
      priority: 0.8,
    }));

  const venuePages: MetadataRoute.Sitemap = venues.map((v) => ({
    url: `${SITE_URL}/mekan/${v.slug}`,
    lastModified: v.updated_at ? new Date(v.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const guideCategoryPages: MetadataRoute.Sitemap = ARTICLE_CATEGORIES.map(
    (c) => ({
      url: `${SITE_URL}/rehber/kategori/${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.5,
    })
  );

  const articlePages: MetadataRoute.Sitemap = getAllArticles().map((a) => ({
    url: `${SITE_URL}/rehber/${a.slug}`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...cityPages,
    ...venuePages,
    ...guideCategoryPages,
    ...articlePages,
  ];
}
