import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { ArticleCard } from "@/components/article-card";
import {
  ARTICLE_CATEGORIES,
  articleCategoryLabel,
  getArticlesByCategory,
} from "@/lib/articles";

interface PageProps {
  params: Promise<{ kategori: string }>;
}

export function generateStaticParams() {
  return ARTICLE_CATEGORIES.map((c) => ({ kategori: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { kategori } = await params;
  const known = ARTICLE_CATEGORIES.find((c) => c.slug === kategori);
  if (!known) return {};

  return {
    title: `${known.label} — Düğün ve Davet Rehberi`,
    description: `${known.label} konusundaki rehber yazıları: davet hazırlığınızda karar vermenizi kolaylaştıracak pratik bilgiler.`,
    alternates: { canonical: `/rehber/kategori/${known.slug}` },
  };
}

export default async function GuideCategoryPage({ params }: PageProps) {
  const { kategori } = await params;
  if (!ARTICLE_CATEGORIES.some((c) => c.slug === kategori)) notFound();

  const articles = getArticlesByCategory(kategori);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:pt-36">
      <nav aria-label="Sayfa yolu" className="text-xs text-mute">
        <Link href="/" className="hover:text-bordeaux">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <Link href="/rehber" className="hover:text-bordeaux">Rehber</Link>
      </nav>

      <Reveal className="mt-6">
        <h1 className="font-display text-fluid-section font-semibold text-ink">
          {articleCategoryLabel(kategori)}
        </h1>
      </Reveal>

      <Reveal className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/rehber"
          className="rounded-full border border-hairline bg-parchment px-4 py-2 text-sm text-ink-soft transition-colors duration-500 ease-lux hover:border-bordeaux/40 hover:text-bordeaux"
        >
          Tümü
        </Link>
        {ARTICLE_CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/rehber/kategori/${category.slug}`}
            className={`rounded-full border px-4 py-2 text-sm transition-colors duration-500 ease-lux ${
              category.slug === kategori
                ? "border-bordeaux/30 bg-blush text-bordeaux"
                : "border-hairline bg-parchment text-ink-soft hover:border-bordeaux/40 hover:text-bordeaux"
            }`}
          >
            {category.label}
          </Link>
        ))}
      </Reveal>

      {articles.length === 0 ? (
        <p className="mt-16 text-sm text-ink-soft">
          Bu kategoride henüz yazı yok.{" "}
          <Link href="/rehber" className="text-bordeaux hover:underline">
            Tüm rehbere göz atın.
          </Link>
        </p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <Reveal key={article.slug} delay={i * 80}>
              <ArticleCard article={article} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
