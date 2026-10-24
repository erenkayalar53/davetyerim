import type { Profile } from "@/lib/types";

/**
 * İşletme başvurusunda istenen belgeler.
 *
 * Tek kaynak: başvuru formundaki yükleme alanları, /mekan-sahibi-ol
 * sayfasındaki tanıtım listesi ve admin panelindeki belge rozetleri
 * buradan beslenir. Daha önce bu üç yer birbirinden bağımsızdı ve sayfa
 * dört belge vaat ederken form yalnızca ikisini kabul ediyordu.
 */
export type OwnerDocKind = {
  /** profiles tablosundaki kolon adı. */
  column: Extract<
    keyof Profile,
    | "tax_document_path"
    | "license_document_path"
    | "trade_registry_document_path"
    | "alcohol_license_document_path"
  >;
  /** Depolama yolundaki ön ek. */
  slug: string;
  label: string;
  /** Başvuru sayfasındaki zorunluluk etiketi. */
  requirement: string;
  description: string;
  required: boolean;
};

export const OWNER_DOC_KINDS: OwnerDocKind[] = [
  {
    column: "tax_document_path",
    slug: "vergi-levhasi",
    label: "Vergi Levhası",
    requirement: "Zorunlu",
    description:
      "İşletmenizin kayıtlı ve vergi mükellefi olduğunu gösterir.",
    required: true,
  },
  {
    column: "license_document_path",
    slug: "ruhsat",
    label: "İşyeri Açma ve Çalışma Ruhsatı",
    requirement: "Zorunlu",
    description:
      "Mekanın etkinlik için yasal olarak işletilebildiğini kanıtlar (belediyeden).",
    required: true,
  },
  {
    column: "trade_registry_document_path",
    slug: "faaliyet-belgesi",
    label: "Faaliyet Belgesi / Ticaret Sicil",
    requirement: "Önerilir",
    description: "İşletmenizin aktif ve tescilli olduğunu teyit eder.",
    required: false,
  },
  {
    column: "alcohol_license_document_path",
    slug: "alkol-belgesi",
    label: "Alkollü İçecek Belgesi",
    requirement: "Alkol sunuyorsanız",
    description: "Alkollü paket sunan mekanlar için gereklidir.",
    required: false,
  },
];
