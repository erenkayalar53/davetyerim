import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ArticleCard } from "@/components/article-card";
import { ARTICLE_CATEGORIES, getAllArticles } from "@/lib/articles";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Düğün ve Davet Rehberi",
  description:
    "Düğün mekanı seçimi, bütçe planlama, kapasite hesabı ve sözleşme detayları — davetyerim rehberinde davet hazırlığının her adımı için pratik bilgiler.",
  alternates: { canonical: "/rehber" },
};

export default function GuideIndexPage() {
  const articles = getAllArticles();
  const [featured, ...rest] = articles;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Düğün ve Davet Rehberi",
    url: `${SITE_URL}/rehber`,
    hasPart: articles.map((a) => ({
      "@type": "Article",
      headline: a.title,
      url: `${SITE_URL}/rehber/${a.slug}`,
      datePublished: a.publishedAt,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Reveal>
        <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
          Rehber
        </span>
        <h1 className="mt-5 max-w-3xl font-display text-fluid-section font-semibold text-ink">
          Düğün ve davet rehberi
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">
          Mekan seçiminden bütçeye, kapasite hesabından sözleşmede dikkat
          edilecek maddelere kadar — kararlarınızı kolaylaştıracak pratik
          içerikler.
        </p>
      </Reveal>

      <Reveal className="mt-8 flex flex-wrap gap-2">
        {ARTICLE_CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/rehber/kategori/${category.slug}`}
            className="rounded-full border border-hairline bg-parchment px-4 py-2 text-sm text-ink-soft transition-colors duration-500 ease-lux hover:border-bordeaux/40 hover:text-bordeaux"
          >
            {category.label}
          </Link>
        ))}
      </Reveal>

      {articles.length === 0 ? (
        <p className="mt-16 text-sm text-ink-soft">
          Rehber yazıları çok yakında burada olacak.
        </p>
      ) : (
        <>
          <Reveal className="mt-12">
            <ArticleCard article={featured} featured />
          </Reveal>

          {rest.length > 0 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article, i) => (
                <Reveal key={article.slug} delay={i * 80}>
                  <ArticleCard article={article} />
                </Reveal>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
