import { Fragment, type ReactNode } from "react";

// Kontrollü bir markdown alt kümesini (H2/H3, paragraf, liste, kalın) render eder.
// Harici bağımlılık yok; içerik mekan açıklaması gibi güvenilir kaynaktan gelir.

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function RichText({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  function flushList() {
    if (listItems.length === 0) return;
    blocks.push(
      <ul
        key={`ul-${key++}`}
        className="my-4 flex list-disc flex-col gap-1.5 pl-5 text-ink-soft"
      >
        {listItems.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      blocks.push(
        <h3
          key={`h3-${key++}`}
          className="mt-6 font-display text-lg font-semibold text-ink"
        >
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h2
          key={`h2-${key++}`}
          className="mt-8 font-display text-2xl font-semibold text-ink"
        >
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      flushList();
      blocks.push(
        <h2
          key={`h1-${key++}`}
          className="mt-8 font-display text-2xl font-semibold text-ink"
        >
          {renderInline(line.slice(2))}
        </h2>
      );
    } else if (/^[-*]\s+/.test(line)) {
      listItems.push(line.replace(/^[-*]\s+/, ""));
    } else {
      flushList();
      blocks.push(
        <p key={`p-${key++}`} className="mt-4 leading-relaxed text-ink-soft">
          {renderInline(line)}
        </p>
      );
    }
  }
  flushList();

  return <div className="[&>*:first-child]:mt-0">{blocks}</div>;
}
