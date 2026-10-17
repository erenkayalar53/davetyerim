export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; rows: { label: string; value: string }[] };

export type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
  /** Bölümün sonuna işletme tanıtıcı bilgilerinin tablosunu basar. */
  extra?: "operatorInfo";
};
