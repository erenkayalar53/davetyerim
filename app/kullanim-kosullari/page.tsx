import type { Metadata } from "next";
import Link from "next/link";
import { OPERATOR_INFO } from "@/lib/constants";
import {
  TERMS_EFFECTIVE_DATE,
  TERMS_SECTIONS,
  type LegalSection,
} from "@/lib/legal-terms";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description:
    "davetyerim.com kullanım koşulları — platformun aracı hizmet sağlayıcı sıfatı, kullanıcı ve işletme yükümlülükleri, içerik kaldırma usulü ve sorumluluğun kapsamı.",
  alternates: { canonical: "/kullanim-kosullari" },
};

const operatorRows: Array<{ label: string; value: string }> = [
  // Gerçek kişi işletmede unvan yerine ad-soyad yazılır; şirket kurulduğunda
  // aynı alan ticari unvanı taşır.
  { label: "Ticari unvan / Ad Soyad", value: OPERATOR_INFO.legalName },
  { label: "Adres", value: OPERATOR_INFO.address },
  { label: "Vergi dairesi", value: OPERATOR_INFO.taxOffice },
  { label: "Vergi kimlik numarası", value: OPERATOR_INFO.taxNumber },
  { label: "MERSİS numarası", value: OPERATOR_INFO.mersisNo },
  { label: "E-posta", value: OPERATOR_INFO.email },
  { label: "Mekan sahipleri", value: OPERATOR_INFO.ownerEmail },
].filter((row) => row.value.length > 0);

function sectionId(index: number) {
  return `madde-${index + 1}`;
}

function OperatorTable() {
  return (
    <dl className="mt-5 overflow-hidden rounded-[1.25rem] border border-hairline bg-parchment">
      {operatorRows.map((row, i) => (
        <div
          key={row.label}
          className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6 ${
            i > 0 ? "border-t border-hairline" : ""
          }`}
        >
          <dt className="shrink-0 text-[10px] font-medium uppercase tracking-[0.2em] text-mute sm:w-48 sm:pt-1">
            {row.label}
          </dt>
          <dd className="text-sm text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SectionBody({ section }: { section: LegalSection }) {
  return (
    <>
      {section.blocks.map((block, i) =>
        block.type === "p" ? (
          <p key={i} className="mt-3">
            {block.text}
          </p>
        ) : (
          <ul key={i} className="mt-4 space-y-2.5">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-[0.5rem] size-1.5 shrink-0 rounded-full bg-bordeaux/40"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )
      )}
      {section.extra === "operatorInfo" && operatorRows.length > 0 && (
        <OperatorTable />
      )}
    </>
  );
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:pt-40">
      <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
        Yürürlük tarihi: {TERMS_EFFECTIVE_DATE}
      </span>
      <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-ink">
        Kullanım Koşulları
      </h1>
      <p className="mt-4 leading-relaxed text-ink-soft">
        Bu metin, davetyerim.com platformunu kullanırken geçerli olan hak ve
        yükümlülükleri düzenler. Kişisel verilerin işlenmesine ilişkin esaslar
        için{" "}
        <Link
          href="/gizlilik"
          className="text-bordeaux underline decoration-bordeaux/30 underline-offset-4 transition-colors hover:decoration-bordeaux"
        >
          Gizlilik Politikası ve KVKK Aydınlatma Metni
        </Link>{" "}
        sayfasına bakabilirsiniz.
      </p>

      <nav
        aria-label="İçindekiler"
        className="mt-10 rounded-[1.5rem] border border-hairline bg-cream-deep/40 p-6"
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
          İçindekiler
        </p>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {TERMS_SECTIONS.map((section, i) => (
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
        {TERMS_SECTIONS.map((section, i) => (
          <section key={section.heading} id={sectionId(i)} className="scroll-mt-28">
            <h2 className="font-display text-xl font-semibold text-ink">
              {section.heading}
            </h2>
            <SectionBody section={section} />
          </section>
        ))}
      </div>
    </div>
  );
}
