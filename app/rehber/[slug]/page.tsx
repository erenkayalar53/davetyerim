import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { ArticleBody } from "@/components/article-body";
import { ArticleCard } from "@/components/article-card";
import {
  articleCategoryLabel,
  extractFaq,
  getAllArticles,
  getArticle,
  getRelatedArticles,
} from "@/lib/articles";
import { SITE_NAME, SITE_URL, slugifyTr, venueTypeLabel } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords.length > 0 ? article.keywords : undefined,
    alternates: { canonical: `/rehber/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      ...(article.cover ? { images: [{ url: article.cover }] } : {}),
    },
  };
}

function formatDate(value: string): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const faq = extractFaq(article.body);
  const related = getRelatedArticles(article);
  const url = `${SITE_URL}/rehber/${article.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: url,
    // Google, Article için görsel bekler. Yazıya özel kapak yoksa sitenin
    // üretilen OG görseli kullanılır; alanın hiç bulunmaması, jenerik bir
    // görsele düşmekten daha kötü değerlendiriliyor.
    image: article.cover
      ? `${SITE_URL}${article.cover}`
      : `${SITE_URL}/opengraph-image`,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Rehber", item: `${SITE_URL}/rehber` },
      {
        "@type": "ListItem",
        position: 3,
        name: articleCategoryLabel(article.category),
        item: `${SITE_URL}/rehber/kategori/${article.category}`,
      },
      { "@type": "ListItem", position: 4, name: article.title, item: url },
    ],
  };

  const faqJsonLd =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  const hasVenueLinks =
    article.linkCities.length > 0 || article.linkTypes.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <nav aria-label="Sayfa yolu" className="text-xs text-mute">
        <Link href="/" className="hover:text-bordeaux">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <Link href="/rehber" className="hover:text-bordeaux">Rehber</Link>
        <span className="mx-2">/</span>
        <Link
          href={`/rehber/kategori/${article.category}`}
          className="hover:text-bordeaux"
        >
          {articleCategoryLabel(article.category)}
        </Link>
      </nav>

      <header className="mt-6">
        <h1 className="font-display text-fluid-section font-semibold leading-tight text-ink">
          {article.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          {article.description}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-mute">
          <time dateTime={article.updatedAt}>
            {formatDate(article.updatedAt)} güncellendi
          </time>
          <span>·</span>
          <span>{article.readingMinutes} dakika okuma</span>
        </div>
      </header>

      {article.cover && (
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[1.75rem] bg-cream-deep">
          <Image
            src={article.cover}
            alt={article.coverAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <article className="mt-12">
        <ArticleBody content={article.body} />
      </article>

      {hasVenueLinks && (
        <Reveal className="mt-16">
          <div className="rounded-[1.75rem] border border-hairline bg-parchment p-8">
            <p className="font-display text-xl font-semibold text-ink">
              Mekan aramaya başlayın
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Bu yazıdaki kriterlere uyan mekanları filtreleyerek görün ve
              ücretsiz teklif alın.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {article.linkCities.map((city) => (
                <Link
                  key={city}
                  href={`/mekanlar/${slugifyTr(city)}`}
                  className="rounded-full border border-hairline bg-cream px-4 py-2 text-sm text-ink-soft transition-colors duration-500 ease-lux hover:border-bordeaux/40 hover:text-bordeaux"
                >
                  {city} mekanları
                </Link>
              ))}
              {article.linkTypes.map((type) => (
                <Link
                  key={type}
                  href={`/mekanlar?tip=${type}`}
                  className="rounded-full border border-hairline bg-cream px-4 py-2 text-sm text-ink-soft transition-colors duration-500 ease-lux hover:border-bordeaux/40 hover:text-bordeaux"
                >
                  {venueTypeLabel(type)}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold text-ink">
            İlgili yazılar
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {related.slice(0, 2).map((item, i) => (
              <Reveal key={item.slug} delay={i * 80}>
                <ArticleCard article={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
