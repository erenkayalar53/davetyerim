import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/legal-document";
import { operatorRows } from "@/lib/operator-rows";
import { TERMS_EFFECTIVE_DATE, TERMS_SECTIONS } from "@/lib/legal-terms";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description:
    "davetyerim.com kullanım koşulları — platformun aracı hizmet sağlayıcı sıfatı, kullanıcı ve işletme yükümlülükleri, içerik kaldırma usulü ve sorumluluğun kapsamı.",
  alternates: { canonical: "/kullanim-kosullari" },
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Kullanım Koşulları"
      effectiveDate={TERMS_EFFECTIVE_DATE}
      sections={TERMS_SECTIONS}
      rows={operatorRows}
      intro={
        <>
          Bu metin, davetyerim.com platformunu kullanırken geçerli olan hak ve
          yükümlülükleri düzenler. Kişisel verilerin işlenmesine ilişkin
          esaslar için{" "}
          <Link
            href="/gizlilik"
            className="text-bordeaux underline decoration-bordeaux/30 underline-offset-4 transition-colors hover:decoration-bordeaux"
          >
            Gizlilik Politikası ve KVKK Aydınlatma Metni
          </Link>{" "}
          sayfasına bakabilirsiniz.
        </>
      }
    />
  );
}
