import Link from "next/link";
import { Fragment, type ReactNode } from "react";

// Rehber yazıları için markdown alt kümesi: H2/H3, paragraf, sıralı/sırasız
// liste, alıntı, tablo, kalın metin ve bağlantı. Harici bağımlılık yok.
// İç bağlantı SEO'nun ana kazancı olduğu için link desteği zorunlu.

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const isExternal = href.startsWith("http");
      if (isExternal) {
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-bordeaux underline decoration-bordeaux/30 underline-offset-2 transition-colors hover:decoration-bordeaux"
          >
            {label}
          </a>
        );
      }
      return (
        <Link
          key={i}
          href={href}
          className="font-medium text-bordeaux underline decoration-bordeaux/30 underline-offset-2 transition-colors hover:decoration-bordeaux"
        >
          {label}
        </Link>
      );
    }

    return <Fragment key={i}>{part}</Fragment>;
  });
}

function slugifyHeading(text: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", I: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return text
    .replace(/[çğıöşüÇĞİIÖŞÜ]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function isTableRow(line: string): boolean {
  return line.startsWith("|") && line.endsWith("|");
}

function splitRow(line: string): string[] {
  return line
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

export function ArticleBody({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  let bullets: string[] = [];
  let numbers: string[] = [];
  let quote: string[] = [];
  let table: string[][] = [];
  let key = 0;

  function flushBullets() {
    if (bullets.length === 0) return;
    blocks.push(
      <ul
        key={`ul-${key++}`}
        className="my-5 flex list-disc flex-col gap-2 pl-5 text-ink-soft"
      >
        {bullets.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
    bullets = [];
  }

  function flushNumbers() {
    if (numbers.length === 0) return;
    blocks.push(
      <ol
        key={`ol-${key++}`}
        className="my-5 flex list-decimal flex-col gap-2 pl-5 text-ink-soft"
      >
        {numbers.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {renderInline(item)}
          </li>
        ))}
      </ol>
    );
    numbers = [];
  }

  function flushQuote() {
    if (quote.length === 0) return;
    blocks.push(
      <blockquote
        key={`bq-${key++}`}
        className="my-6 rounded-r-2xl border-l-2 border-bordeaux bg-parchment py-4 pl-5 pr-4 text-ink-soft"
      >
        {quote.map((line, i) => (
          <p key={i} className="leading-relaxed">
            {renderInline(line)}
          </p>
        ))}
      </blockquote>
    );
    quote = [];
  }

  function flushTable() {
    if (table.length === 0) return;
    const [head, ...rows] = table;
    blocks.push(
      <div
        key={`table-${key++}`}
        className="my-6 overflow-x-auto rounded-2xl border border-hairline"
      >
        <table className="w-full min-w-[32rem] border-collapse text-sm">
          <thead className="bg-parchment">
            <tr>
              {head.map((cell, i) => (
                <th
                  key={i}
                  className="border-b border-hairline px-4 py-3 text-left font-medium text-ink"
                >
                  {renderInline(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-hairline/60 last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-ink-soft">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    table = [];
  }

  function flushAll() {
    flushBullets();
    flushNumbers();
    flushQuote();
    flushTable();
  }

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushAll();
      continue;
    }

    if (isTableRow(line)) {
      flushBullets();
      flushNumbers();
      flushQuote();
      const cells = splitRow(line);
      // Hizalama satırını (|---|---|) atla
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
      table.push(cells);
      continue;
    }
    flushTable();

    if (line.startsWith("### ")) {
      flushAll();
      const text = line.slice(4);
      blocks.push(
        <h3
          key={`h3-${key++}`}
          id={slugifyHeading(text)}
          className="mt-10 scroll-mt-32 font-display text-xl font-semibold text-ink"
        >
          {renderInline(text)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      flushAll();
      const text = line.slice(3);
      blocks.push(
        <h2
          key={`h2-${key++}`}
          id={slugifyHeading(text)}
          className="mt-14 scroll-mt-32 font-display text-2xl font-semibold text-ink sm:text-3xl"
        >
          {renderInline(text)}
        </h2>
      );
    } else if (line.startsWith("> ")) {
      flushBullets();
      flushNumbers();
      quote.push(line.slice(2));
    } else if (/^\d+[.)]\s+/.test(line)) {
      flushBullets();
      flushQuote();
      numbers.push(line.replace(/^\d+[.)]\s+/, ""));
    } else if (/^[-*]\s+/.test(line)) {
      flushNumbers();
      flushQuote();
      bullets.push(line.replace(/^[-*]\s+/, ""));
    } else {
      flushAll();
      blocks.push(
        <p key={`p-${key++}`} className="mt-5 leading-[1.85] text-ink-soft">
          {renderInline(line)}
        </p>
      );
    }
  }

  flushAll();

  return <div className="[&>*:first-child]:mt-0">{blocks}</div>;
}
