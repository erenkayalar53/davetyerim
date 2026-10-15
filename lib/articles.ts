import fs from "node:fs";
import path from "node:path";

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  cover: string;
  coverAlt: string;
  keywords: string[];
  /** Yazıdan mekan listelerine iç bağlantı için şehir adları. */
  linkCities: string[];
  /** Yazıdan mekan listelerine iç bağlantı için mekan türü slug'ları. */
  linkTypes: string[];
  readingMinutes: number;
  body: string;
}

export const ARTICLE_CATEGORIES = [
  { slug: "mekan-secimi", label: "Mekan Seçimi" },
  { slug: "butce", label: "Bütçe & Fiyatlar" },
  { slug: "hazirlik", label: "Düğün Hazırlığı" },
  { slug: "sehir-rehberi", label: "Şehir Rehberleri" },
  { slug: "ilham", label: "İlham & Konsept" },
] as const;

export function articleCategoryLabel(slug: string): string {
  return ARTICLE_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "rehber");

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** `---` blokları arasındaki `anahtar: değer` satırlarını okur. */
function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  body: string;
} {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, body: normalized.trim() };

  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^["'](.*)["']$/, "$1");
    if (key) data[key] = value;
  }

  return { data, body: normalized.slice(match[0].length).trim() };
}

function toArticle(fileName: string, raw: string): Article {
  const { data, body } = parseFrontmatter(raw);
  const words = body.split(/\s+/).filter(Boolean).length;
  const publishedAt = data.publishedAt ?? "";

  return {
    slug: fileName.replace(/\.md$/, ""),
    title: data.title ?? fileName,
    description: data.description ?? "",
    category: data.category ?? "mekan-secimi",
    publishedAt,
    updatedAt: data.updatedAt || publishedAt,
    cover: data.cover ?? "",
    coverAlt: data.coverAlt || data.title || "",
    keywords: splitList(data.keywords),
    linkCities: splitList(data.linkCities),
    linkTypes: splitList(data.linkTypes),
    readingMinutes: Math.max(1, Math.round(words / 200)),
    body,
  };
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => toArticle(file, fs.readFileSync(path.join(CONTENT_DIR, file), "utf8")))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getArticle(slug: string): Article | null {
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  return toArticle(`${slug}.md`, fs.readFileSync(file, "utf8"));
}

export function getArticlesByCategory(category: string): Article[] {
  return getAllArticles().filter((a) => a.category === category);
}

/** Önce aynı kategoriden, yetmezse en yeni yazılardan tamamlar. */
export function getRelatedArticles(article: Article, limit = 3): Article[] {
  const others = getAllArticles().filter((a) => a.slug !== article.slug);
  const sameCategory = others.filter((a) => a.category === article.category);
  const rest = others.filter((a) => a.category !== article.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

/**
 * "## Sıkça Sorulan Sorular" başlığı altındaki her H3'ü soru, ardından gelen
 * paragrafları cevap olarak alır. Böylece FAQ schema'sı ile sayfadaki içerik
 * asla birbirinden ayrı düşmez — tek kaynak, tek yazı.
 */
export function extractFaq(body: string): { q: string; a: string }[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const faq: { q: string; a: string }[] = [];

  let inFaqSection = false;
  let question = "";
  let answer: string[] = [];

  function flush() {
    if (question && answer.length > 0) {
      faq.push({ q: question, a: answer.join(" ").trim() });
    }
    question = "";
    answer = [];
  }

  for (const raw of lines) {
    const line = raw.trim();

    if (line.startsWith("## ")) {
      flush();
      inFaqSection = /sıkça sorulan sorular/i.test(line.slice(3));
      continue;
    }
    if (!inFaqSection) continue;

    if (line.startsWith("### ")) {
      flush();
      question = line.slice(4).trim();
    } else if (line) {
      answer.push(line.replace(/^[-*]\s+/, "").replace(/\*\*/g, ""));
    }
  }
  flush();

  return faq;
}
