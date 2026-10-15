import Image from "next/image";
import Link from "next/link";
import { articleCategoryLabel, type Article } from "@/lib/articles";

function formatDate(value: string): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ArticleCard({
  article,
  featured = false,
}: {
  article: Article;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/rehber/${article.slug}`}
      className={`group flex h-full overflow-hidden rounded-[1.75rem] border border-hairline bg-parchment shadow-float transition-all duration-700 ease-lux hover:-translate-y-1 hover:shadow-lift ${
        featured ? "flex-col md:flex-row" : "flex-col"
      }`}
    >
      {article.cover && (
        <div
          className={`relative shrink-0 overflow-hidden bg-cream-deep ${
            featured ? "aspect-[16/10] md:aspect-auto md:w-1/2" : "aspect-[16/10]"
          }`}
        >
          <Image
            src={article.cover}
            alt={article.coverAlt}
            fill
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 640px) 100vw, 33vw"}
            className="object-cover transition-transform duration-[1.2s] ease-lux group-hover:scale-[1.04]"
          />
        </div>
      )}

      <div className={`flex flex-1 flex-col p-6 ${featured ? "md:p-9" : ""}`}>
        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-mute">
          <span className="rounded-full bg-blush px-2.5 py-1 font-medium tracking-[0.12em] text-bordeaux">
            {articleCategoryLabel(article.category)}
          </span>
          <span>{article.readingMinutes} dk okuma</span>
        </div>

        <h2
          className={`mt-4 font-display font-semibold text-ink ${
            featured ? "text-2xl sm:text-3xl" : "text-lg"
          }`}
        >
          {article.title}
        </h2>

        <p
          className={`mt-3 leading-relaxed text-ink-soft ${
            featured ? "text-base" : "line-clamp-3 text-sm"
          }`}
        >
          {article.description}
        </p>

        <p className="mt-auto pt-5 text-xs text-mute">
          {formatDate(article.updatedAt)}
        </p>
      </div>
    </Link>
  );
}
