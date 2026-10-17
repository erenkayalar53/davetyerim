import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/legal-document";
import { operatorRows } from "@/lib/operator-rows";
import {
  PRIVACY_EFFECTIVE_DATE,
  PRIVACY_SECTIONS,
} from "@/lib/legal-privacy";

export const metadata: Metadata = {
  title: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
  description:
    "davetyerim.com KVKK aydınlatma metni — işlenen kişisel veriler, işleme amaçları ve hukuki sebepleri, yurt dışına aktarım, saklama süreleri ve KVKK madde 11 haklarınız.",
  alternates: { canonical: "/gizlilik" },
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Gizlilik Politikası ve KVKK Aydınlatma Metni"
      effectiveDate={PRIVACY_EFFECTIVE_DATE}
      sections={PRIVACY_SECTIONS}
      rows={operatorRows}
      intro={
        <>
          Bu metin, davetyerim.com platformunu kullandığınızda kişisel
          verilerinizin nasıl işlendiğini 6698 sayılı Kişisel Verilerin
          Korunması Kanunu kapsamında açıklar. Platformun kullanım kuralları
          için{" "}
          <Link
            href="/kullanim-kosullari"
            className="text-bordeaux underline decoration-bordeaux/30 underline-offset-4 transition-colors hover:decoration-bordeaux"
          >
            Kullanım Koşulları
          </Link>{" "}
          sayfasına bakabilirsiniz.
        </>
      }
    />
  );
}
