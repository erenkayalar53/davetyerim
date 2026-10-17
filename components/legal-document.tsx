import Link from "next/link";
import type { LegalSection } from "@/lib/legal-types";

function sectionId(index: number) {
  return `madde-${index + 1}`;
}

export type LegalRow = { label: string; value: string };

/**
 * Kullanım Koşulları ve KVKK Aydınlatma Metni gibi uzun hukuki sayfaların
 * ortak gövdesi: yürürlük tarihi, içindekiler ve numaralı bölümler.
 *
 * Metin JSX içine gömülmez, veri olarak gelir — böylece mevzuat değiştiğinde
 * yalnızca içerik dosyası güncellenir ve bölüm bağlantıları kendiliğinden
 * yeniden üretilir.
 */
export function LegalDocument({
  title,
  effectiveDate,
  intro,
  sections,
  rows,
}: {
  title: string;
  effectiveDate: string;
  intro: React.ReactNode;
  sections: LegalSection[];
  /** Bölümün `extra` alanı istendiğinde basılacak etiket/değer tablosu. */
  rows?: LegalRow[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:pt-40">
      <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
        Yürürlük tarihi: {effectiveDate}
      </span>
      <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-ink">
        {title}
      </h1>
      <p className="mt-4 leading-relaxed text-ink-soft">{intro}</p>

      <nav
        aria-label="İçindekiler"
        className="mt-10 rounded-[1.5rem] border border-hairline bg-cream-deep/40 p-6"
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
          İçindekiler
        </p>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {sections.map((section, i) => (
            <li key={section.heading}>
              <a
                href={`#${sectionId(i)}`}
                className="text-sm text-ink-soft transition-colors duration-300 hover:text-bordeaux"
              >
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-ink-soft">
        {sections.map((section, i) => (
          <section
            key={section.heading}
            id={sectionId(i)}
            className="scroll-mt-28"
          >
            <h2 className="font-display text-xl font-semibold text-ink">
              {section.heading}
            </h2>
            {section.blocks.map((block, j) =>
              block.type === "p" ? (
                <p key={j} className="mt-3">
                  {block.text}
                </p>
              ) : block.type === "list" ? (
                <ul key={j} className="mt-4 space-y-2.5">
                  {block.items.map((item, k) => (
                    <li key={k} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-[0.5rem] size-1.5 shrink-0 rounded-full bg-bordeaux/40"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  key={j}
                  className="mt-5 overflow-hidden rounded-[1.25rem] border border-hairline bg-parchment"
                >
                  {block.rows.map((row, k) => (
                    <div
                      key={k}
                      className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6 ${
                        k > 0 ? "border-t border-hairline" : ""
                      }`}
                    >
                      <p className="shrink-0 text-[10px] font-medium uppercase leading-5 tracking-[0.2em] text-mute sm:w-56 sm:pt-0.5">
                        {row.label}
                      </p>
                      <p className="text-sm text-ink">{row.value}</p>
                    </div>
                  ))}
                </div>
              )
            )}
            {section.extra === "operatorInfo" && rows && rows.length > 0 && (
              <dl className="mt-5 overflow-hidden rounded-[1.25rem] border border-hairline bg-parchment">
                {rows.map((row, k) => (
                  <div
                    key={row.label}
                    className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6 ${
                      k > 0 ? "border-t border-hairline" : ""
                    }`}
                  >
                    <dt className="shrink-0 text-[10px] font-medium uppercase tracking-[0.2em] text-mute sm:w-56 sm:pt-1">
                      {row.label}
                    </dt>
                    <dd className="text-sm text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        ))}
      </div>

      <p className="mt-16 border-t border-hairline pt-6 text-xs text-mute">
        Bu sayfa bilgilendirme amaçlıdır. Mevzuat değişiklikleri sayfaya
        yansıtılır ve yürürlük tarihi güncellenir. Diğer hukuki metinler:{" "}
        <Link
          href="/kullanim-kosullari"
          className="underline decoration-hairline underline-offset-4 hover:text-bordeaux"
        >
          Kullanım Koşulları
        </Link>{" "}
        ·{" "}
        <Link
          href="/gizlilik"
          className="underline decoration-hairline underline-offset-4 hover:text-bordeaux"
        >
          Gizlilik ve KVKK Aydınlatma Metni
        </Link>
      </p>
    </div>
  );
}
