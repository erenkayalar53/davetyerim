import { OPERATOR_INFO } from "@/lib/constants";
import type { LegalSection } from "@/lib/legal-types";

export const PRIVACY_EFFECTIVE_DATE = "17 Ekim 2026";

/**
 * KVKK Aydınlatma Metni.
 *
 * Dayanak: 6698 sayılı Kişisel Verilerin Korunması Kanunu (özellikle md. 4
 * genel ilkeler, md. 5 işleme şartları, md. 7 silme, md. 9 yurt dışına
 * aktarım — 7499 sayılı Kanun ile değişik hâli, md. 10 aydınlatma
 * yükümlülüğü, md. 11 ilgili kişinin hakları, md. 12 veri güvenliği),
 * Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar
 * Hakkında Tebliğ ve Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında
 * Tebliğ.
 *
 * Aydınlatma Tebliği her işleme amacının HANGİ hukuki sebebe dayandığının
 * ayrı ayrı gösterilmesini ister; genel bir "mevzuata uygun olarak işlenir"
 * ifadesi yükümlülüğü karşılamaz. Bu yüzden 4. bölümde amaç-hukuki sebep
 * eşleşmesi tablo hâlinde verildi.
 *
 * Yurt dışına aktarım bölümü, kullanılan altyapı sağlayıcıları değiştiğinde
 * GÜNCELLENMELİDİR. Resend (e-posta gönderimi) devreye alındığında listeye
 * eklenmesi gerekir.
 */
export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "1. Veri Sorumlusunun Kimliği",
    extra: "operatorInfo",
    blocks: [
      {
        type: "p",
        text: "6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla aşağıda bilgileri yer alan işletme tarafından, bu metinde açıklanan çerçevede işlenmektedir.",
      },
      {
        type: "p",
        text: "Bu metin, davetyerim.com platformunu kullanan herkes için geçerlidir. Platform hizmetleri ücretsiz sunulsa dahi kişisel veri işleme faaliyeti söz konusu olduğundan KVKK yükümlülükleri aynen uygulanır.",
      },
    ],
  },
  {
    heading: "2. İşlediğimiz Kişisel Veriler",
    blocks: [
      {
        type: "p",
        text: "Platformu nasıl kullandığınıza göre aşağıdaki veriler işlenir. Hepsi her kullanıcı için işlenmez; yalnızca ilgili işlemi gerçekleştirdiğinizde toplanır.",
      },
      {
        type: "table",
        rows: [
          {
            label: "Kimlik",
            value: "Ad, soyad. İşletme başvurularında yetkili kişinin adı ve soyadı.",
          },
          {
            label: "İletişim",
            value: "E-posta adresi, telefon numarası; işletmeler için işletme adresi.",
          },
          {
            label: "Müşteri İşlem",
            value:
              "Teklif isteklerinde etkinlik türü, etkinlik tarihi, tahmini davetli sayısı, bütçe aralığı, mesajınız; favorilerinize eklediğiniz mekanlar; gönderdiğiniz ve aldığınız teklifler.",
          },
          {
            label: "İşlem Güvenliği",
            value:
              "Hesap oturum bilgileri, giriş kayıtları, şifrenizin geri döndürülemez biçimde şifrelenmiş hâli. Şifreniz tarafımızca görülemez.",
          },
          {
            label: "İşletme ve Belge",
            value:
              "Yalnızca işletme başvurusunda: vergi levhası, işyeri ruhsatı ve benzeri doğrulama belgeleri, vergi numarası, işletme unvanı.",
          },
          {
            label: "Mekan İçeriği",
            value:
              "İşletmelerin yüklediği mekan açıklamaları, görseller, kapasite, fiyat ve menü bilgileri.",
          },
          {
            label: "Değerlendirme",
            value: "Yazdığınız yorum ve puanlar.",
          },
        ],
      },
      {
        type: "p",
        text: "KVKK’nın 6. maddesinde tanımlanan özel nitelikli kişisel veriler (sağlık, din, etnik köken, biyometrik veri vb.) Platform tarafından talep edilmez ve işlenmez. Bu tür verileri serbest metin alanlarına yazmamanızı rica ederiz.",
      },
    ],
  },
  {
    heading: "3. Kişisel Verileri Toplama Yöntemimiz",
    blocks: [
      {
        type: "p",
        text: "Kişisel verileriniz tamamen otomatik yollarla, elektronik ortamda toplanır: Platform üzerindeki üyelik ve teklif formları, işletme başvuru formu, mekan yönetim paneline girdiğiniz bilgiler, bize gönderdiğiniz e-postalar ve oturumunuzun sürdürülmesi için kullanılan zorunlu çerezler aracılığıyla.",
      },
      {
        type: "p",
        text: "Platform, kişisel verilerinizi üçüncü kişilerden satın almaz ve hazır veri listelerinden elde etmez.",
      },
    ],
  },
  {
    heading: "4. İşleme Amaçlarımız ve Hukuki Sebepleri",
    blocks: [
      {
        type: "p",
        text: "KVKK’nın 10. maddesi, her işleme amacının hangi hukuki sebebe dayandığının ayrı ayrı belirtilmesini gerektirir. Amaç-hukuki sebep eşleşmesi aşağıdadır.",
      },
      {
        type: "table",
        rows: [
          {
            label: "Üyelik oluşturulması ve hesabın yönetilmesi",
            value:
              "KVKK md. 5/2-c — bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması.",
          },
          {
            label: "Teklif isteğinizin ilgili mekan işletmesine iletilmesi",
            value:
              "KVKK md. 5/2-c — talebinizin yerine getirilebilmesi için zorunludur. Talebi siz başlatırsınız.",
          },
          {
            label: "İşletme başvurusunun değerlendirilmesi, belge doğrulaması",
            value:
              "KVKK md. 5/2-c ve md. 5/2-f — platformda yalnızca gerçek işletmelerin yer almasına ilişkin meşru menfaat.",
          },
          {
            label: "Dolandırıcılığın önlenmesi, platform güvenliği, kötüye kullanımın tespiti",
            value:
              "KVKK md. 5/2-f — veri sorumlusunun meşru menfaati. Temel hak ve özgürlüklerinize zarar vermeyecek ölçüde uygulanır.",
          },
          {
            label: "Hizmet kalitesinin ölçülmesi, görüntülenme ve yanıt süresi istatistikleri",
            value: "KVKK md. 5/2-f — meşru menfaat.",
          },
          {
            label: "Yasal yükümlülüklerin yerine getirilmesi, yetkili kurum taleplerinin cevaplanması",
            value:
              "KVKK md. 5/2-ç — veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi.",
          },
          {
            label: "Hukuki uyuşmazlıklarda savunma hakkının kullanılması",
            value: "KVKK md. 5/2-e — bir hakkın tesisi, kullanılması veya korunması.",
          },
          {
            label: "Tanıtım ve kampanya bildirimi gönderilmesi",
            value:
              "Açık rızanız (KVKK md. 5/1). Rıza vermemeniz hizmetten yararlanmanıza engel değildir ve rızanızı her zaman geri alabilirsiniz.",
          },
        ],
      },
    ],
  },
  {
    heading: "5. Kişisel Verilerin Aktarılması",
    blocks: [
      {
        type: "p",
        text: "Kişisel verileriniz hiçbir koşulda satılmaz, kiralanmaz veya pazarlama amacıyla üçüncü kişilere devredilmez. Aktarım yalnızca aşağıdaki hâllerde ve amaçla sınırlı olarak yapılır.",
      },
      {
        type: "list",
        items: [
          "Teklif istediğiniz mekan işletmesine: adınız, iletişim bilgileriniz ve talebinizin içeriği. Bu aktarım talebinizin gereğidir ve yalnızca seçtiğiniz işletmeyle sınırlıdır. İşletme, bu verileri yalnızca talebinizi yanıtlamak için kullanmakla yükümlüdür ve kendi işleme faaliyeti bakımından bizzat veri sorumlusudur.",
          "Altyapı hizmet sağlayıcılarımıza: barındırma, veritabanı, e-posta ve güvenlik hizmetleri kapsamında, yalnızca hizmetin gerektirdiği ölçüde. Bu sağlayıcılar verilerinizi kendi amaçları için kullanamaz.",
          "Yetkili kamu kurum ve kuruluşlarına: mevzuatın öngördüğü hâllerde ve usulüne uygun talep üzerine.",
          "Hukuki danışman ve denetçilere: bir uyuşmazlık veya yasal yükümlülük kapsamında gerekli olduğu ölçüde.",
        ],
      },
    ],
  },
  {
    heading: "6. Yurt Dışına Aktarım",
    blocks: [
      {
        type: "p",
        text: "Platform, hizmetlerini yürütmek için yurt dışında kurulu bulut altyapı sağlayıcıları kullanır. Bu nedenle kişisel verileriniz, KVKK’nın 9. maddesi kapsamında yurt dışına aktarılmaktadır. Kullanılan sağlayıcılar ve verilerin işlendiği bölgeler aşağıdadır.",
      },
      {
        type: "table",
        rows: [
          {
            label: "Supabase (veritabanı, kimlik doğrulama, dosya depolama)",
            value:
              "Veriler Almanya’da (Frankfurt, Avrupa Birliği) barındırılır. Üyelik, mekan, teklif ve belge verileri burada tutulur.",
          },
          {
            label: "Vercel (web sitesinin barındırılması)",
            value:
              "ABD merkezli sağlayıcı. Sayfa isteklerinin işlenmesi sırasında bağlantı verileri küresel sunucu ağında işlenebilir.",
          },
          {
            label: "Zoho (kurumsal e-posta)",
            value:
              "Avrupa Birliği veri merkezi. Bize gönderdiğiniz ve tarafımızdan gönderilen e-postalar burada işlenir.",
          },
          {
            label: "Cloudflare (alan adı yönetimi ve güvenlik)",
            value:
              "Küresel ağ. Siteye erişim sırasında bağlantı verileri güvenlik amacıyla işlenir.",
          },
        ],
      },
      {
        type: "p",
        text: "Aktarımlar, KVKK’nın 7499 sayılı Kanun ile değişik 9. maddesi çerçevesinde; Kurul tarafından ilan edilen yeterlilik kararı bulunan hâllerde bu karara, aksi hâlde standart sözleşme veya taahhütname gibi uygun güvencelere dayanılarak yapılır. Uygun güvencenin bulunmadığı istisnai hâllerde aktarım, yalnızca açık rızanıza dayanılarak gerçekleştirilir.",
      },
      {
        type: "p",
        text: "Bu sağlayıcı listesi, altyapımız değiştiğinde güncellenir ve sayfanın yürürlük tarihi yenilenir.",
      },
    ],
  },
  {
    heading: "7. Saklama Süreleri",
    blocks: [
      {
        type: "list",
        items: [
          "Üyelik verileri: üyeliğiniz devam ettiği sürece. Üyeliğinizi sona erdirmeniz hâlinde, aşağıdaki istisnalar saklı kalmak üzere silinir veya anonim hâle getirilir.",
          "Teklif ve talep kayıtları: oluşturulmalarından itibaren zamanaşımı süreleri boyunca, bir hakkın tesisi ve savunma amacıyla saklanır.",
          "İşletme doğrulama belgeleri: işletme hesabı aktif olduğu sürece ve mevzuatın öngördüğü süre boyunca.",
          "Oturum ve giriş kayıtları: güvenlik amacıyla, mevzuatın öngördüğü süreler çerçevesinde.",
          "Yorumlar: kaldırılmasını talep edene kadar; kaldırıldığında yorumla kişisel bağınız silinir.",
        ],
      },
      {
        type: "p",
        text: "Saklama süresi dolan veriler, KVKK’nın 7. maddesi uyarınca silinir, yok edilir veya anonim hâle getirilir.",
      },
    ],
  },
  {
    heading: "8. Veri Güvenliği",
    blocks: [
      {
        type: "p",
        text: "KVKK’nın 12. maddesi kapsamında, kişisel verilerin hukuka aykırı işlenmesini ve verilere hukuka aykırı erişilmesini önlemek için gerekli teknik ve idari tedbirler alınır. Uygulanan başlıca tedbirler:",
      },
      {
        type: "list",
        items: [
          "Site ve veri trafiğinin tamamı TLS sertifikasıyla şifrelenir.",
          "Şifreler geri döndürülemez biçimde özetlenerek saklanır; Platform yöneticileri dahil hiç kimse şifrenizi göremez.",
          "Veritabanında satır düzeyinde erişim kuralları uygulanır: her kullanıcı yalnızca kendi verisine erişebilir.",
          "İşletme doğrulama belgeleri herkese kapalı özel bir alanda tutulur, yalnızca yetkili yönetici tarafından ve süreli bağlantıyla görüntülenir.",
          "Yönetici yetkileri sınırlı tutulur ve erişimler kayıt altına alınır.",
        ],
      },
      {
        type: "p",
        text: "Alınan tüm tedbirlere rağmen bir veri ihlali gerçekleşirse, KVKK’nın 12. maddesi uyarınca durum en kısa sürede Kişisel Verileri Koruma Kurulu’na ve ilgili kişilere bildirilir.",
      },
    ],
  },
  {
    heading: "9. Çerezler",
    blocks: [
      {
        type: "p",
        text: "Platform hâlihazırda yalnızca zorunlu çerezler kullanır. Bu çerezler oturumunuzun açık kalmasını ve güvenlik doğrulamalarının yapılmasını sağlar; olmadıkları takdirde giriş yapmanız mümkün olmaz. Zorunlu çerezler için açık rıza aranmaz.",
      },
      {
        type: "p",
        text: "Platform şu an reklam veya izleme amaçlı çerez kullanmamaktadır. İleride ziyaretçi istatistiği veya reklam çerezleri kullanılması hâlinde, bu çerezler yalnızca açık rızanızla çalıştırılacak, siteye bir çerez bilgilendirme ve tercih yönetimi aracı eklenecek ve bu metin güncellenecektir.",
      },
      {
        type: "p",
        text: "Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz; zorunlu çerezleri engellemeniz hâlinde hesabınıza giriş yapamazsınız.",
      },
    ],
  },
  {
    heading: "10. KVKK Madde 11 Kapsamındaki Haklarınız",
    blocks: [
      {
        type: "p",
        text: "İlgili kişi olarak KVKK’nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:",
      },
      {
        type: "list",
        items: [
          "Kişisel verinizin işlenip işlenmediğini öğrenme.",
          "Kişisel veriniz işlenmişse buna ilişkin bilgi talep etme.",
          "Kişisel verinizin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme.",
          "Yurt içinde veya yurt dışında kişisel verinizin aktarıldığı üçüncü kişileri bilme.",
          "Kişisel verinizin eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme ve bu işlemin, verinin aktarıldığı üçüncü kişilere bildirilmesini isteme.",
          "KVKK’nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verinizin silinmesini veya yok edilmesini isteme ve bu işlemin, verinin aktarıldığı üçüncü kişilere bildirilmesini isteme.",
          "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme.",
          "Kişisel verinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.",
        ],
      },
    ],
  },
  {
    heading: "11. Başvuru Usulü",
    blocks: [
      {
        type: "p",
        text: `Yukarıdaki haklarınıza ilişkin taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ uyarınca ${OPERATOR_INFO.email} adresine e-posta göndererek iletebilirsiniz. Başvurunuzda adınızın, soyadınızın, Platform’da kayıtlı e-posta adresinizin ve talebinizin konusunun açıkça yer alması gerekir.`,
      },
      {
        type: "p",
        text: "Başvurunuz, talebin niteliğine göre en kısa sürede ve her hâlükârda en geç otuz gün içinde ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi hâlinde Kurul tarafından belirlenen tarifedeki ücret talep edilebilir.",
      },
      {
        type: "p",
        text: "Başvurunuzun reddedilmesi, verilen cevabı yetersiz bulmanız veya süresinde cevap verilmemesi hâlinde; cevabı öğrendiğiniz tarihten itibaren otuz ve her hâlde başvuru tarihinden itibaren altmış gün içinde Kişisel Verileri Koruma Kurulu’na şikâyette bulunma hakkınız saklıdır.",
      },
    ],
  },
  {
    heading: "12. Çocukların Verileri",
    blocks: [
      {
        type: "p",
        text: "Platform on sekiz yaşından küçük kişilere yönelik değildir ve bilerek on sekiz yaşından küçüklerden kişisel veri toplamaz. Böyle bir verinin işlendiğinin tespiti hâlinde ilgili veri gecikmeksizin silinir.",
      },
    ],
  },
  {
    heading: "13. Metindeki Değişiklikler",
    blocks: [
      {
        type: "p",
        text: "Bu aydınlatma metni, mevzuat değişiklikleri veya işleme faaliyetlerimizdeki değişiklikler sebebiyle güncellenebilir. Güncel sürüm her zaman bu sayfada yayımlanır ve sayfanın başındaki yürürlük tarihi yenilenir.",
      },
      {
        type: "p",
        text: "Haklarınızı esaslı biçimde etkileyen değişiklikler, kayıtlı kullanıcılara e-posta ile ayrıca bildirilir.",
      },
    ],
  },
];
