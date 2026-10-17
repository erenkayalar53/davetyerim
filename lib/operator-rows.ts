import { OPERATOR_INFO } from "@/lib/constants";

/**
 * Tanıtıcı bilgi tablosunun satırları.
 *
 * Boş bırakılan alanlar listeye hiç girmez: eksik bilgiyi "—" ile göstermek
 * yerine satırı tamamen gizlemeyi tercih ediyoruz. Şirket kurulduğunda
 * vergi ve MERSİS alanları doldurulunca satırlar kendiliğinden görünür.
 */
export const operatorRows: { label: string; value: string }[] = [
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
