import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
  description:
    "davetyerim.com gizlilik politikası ve 6698 sayılı KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
  alternates: { canonical: "/gizlilik" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:pt-40">
      <h1 className="font-display text-4xl font-semibold leading-tight text-ink">
        Gizlilik Politikası ve KVKK Aydınlatma Metni
      </h1>
      <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            1. Veri Sorumlusu
          </h2>
          <p className="mt-3">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;)
            kapsamında kişisel verileriniz, veri sorumlusu sıfatıyla
            davetyerim.com tarafından aşağıda açıklanan çerçevede işlenmektedir.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            2. İşlenen Kişisel Veriler
          </h2>
          <p className="mt-3">
            Teklif isteği formları aracılığıyla ad-soyad, telefon numarası,
            e-posta adresi, etkinlik tarihi ve davetli sayısı; mekan sahibi
            kayıtlarında ad-soyad, telefon, e-posta ve işletme bilgileri
            işlenir.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            3. İşleme Amaçları
          </h2>
          <p className="mt-3">
            Kişisel verileriniz; teklif isteklerinizin ilgili mekan işletmesine
            iletilmesi, mekan sahibi hesaplarının yönetilmesi, platform
            hizmetlerinin sunulması ve yasal yükümlülüklerin yerine getirilmesi
            amaçlarıyla işlenir.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            4. Verilerin Aktarılması
          </h2>
          <p className="mt-3">
            Teklif isteği formunda paylaştığınız bilgiler, yalnızca teklif
            istediğiniz mekanın işletmecisiyle paylaşılır. Verileriniz bunun
            dışında üçüncü kişilere satılmaz veya pazarlama amacıyla
            aktarılmaz.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            5. Haklarınız
          </h2>
          <p className="mt-3">
            KVKK&apos;nın 11. maddesi kapsamında; verilerinize erişme,
            düzeltilmesini veya silinmesini talep etme haklarına sahipsiniz.
            Talepleriniz için info@davetyerim.com adresine yazabilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
}
