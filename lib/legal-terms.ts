import { OPERATOR_INFO } from "@/lib/constants";
import type { LegalSection } from "@/lib/legal-types";

export const TERMS_EFFECTIVE_DATE = "17 Ekim 2026";

/**
 * Kullanım Koşulları metni.
 *
 * Dayanak mevzuat: 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında
 * Kanun (aracı hizmet sağlayıcı sıfatı, tanıtıcı bilgiler, ticari elektronik
 * ileti), 5651 sayılı Kanun (yer sağlayıcı sorumluluğu ve uyar-kaldır usulü),
 * 6698 sayılı KVKK, 6098 sayılı TBK (genel işlem koşulları md. 20-25 ve
 * sorumsuzluk anlaşması md. 115), 6502 sayılı Tüketicinin Korunması Hakkında
 * Kanun, 5846 sayılı FSEK ve 6102 sayılı TTK.
 *
 * TBK md. 20-25 gereği tek yanlı ve aşırı dengesiz hükümler yazılmamış
 * sayılır. Bu yüzden metinde sorumluluğun tümden reddi, bildirimsiz tek
 * taraflı değişiklik ve tüketicinin kanuni haklarını bertaraf eden yetki
 * şartı gibi maddeler bilinçli olarak yer almaz — konulsa dahi geçersiz
 * olurdu ve metnin tamamının güvenilirliğini zayıflatırdı.
 */
export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "1. Taraflar, Konu ve Kapsam",
    blocks: [
      {
        type: "p",
        text: "Bu Kullanım Koşulları, davetyerim.com internet sitesi ve bağlı hizmetleri (kısaca “Platform”) ile Platform’u kullanan gerçek ve tüzel kişiler arasındaki ilişkiyi düzenler.",
      },
      {
        type: "p",
        text: "Platform’u kullanmanız, bu koşulları okuduğunuz ve kabul ettiğiniz anlamına gelir. Koşulları kabul etmiyorsanız Platform’u kullanmamanız gerekir.",
      },
      {
        type: "p",
        text: "Platform iki tür kullanıcıya hizmet verir: etkinliği için mekan arayan ve teklif isteyen kişiler (“Kullanıcı”) ile mekanını Platform’da listeleyen işletmeler (“İşletme”). Bazı yükümlülükler yalnızca bir tarafa aittir ve ilgili bölümde ayrıca belirtilmiştir.",
      },
      {
        type: "p",
        text: "Kişisel verilerin işlenmesine ilişkin esaslar Gizlilik Politikası ve KVKK Aydınlatma Metni’nde düzenlenir. Söz konusu metin bu Kullanım Koşulları’nın ayrılmaz parçasıdır.",
      },
    ],
  },
  {
    heading: "2. Tanıtıcı Bilgiler",
    extra: "operatorInfo",
    blocks: [
      {
        type: "p",
        text: "6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun’un 3. maddesi uyarınca hizmet sağlayıcıya ilişkin tanıtıcı bilgiler aşağıda yer alır.",
      },
    ],
  },
  {
    heading: "3. Platformun Hukuki Niteliği ve Sınırları",
    blocks: [
      {
        type: "p",
        text: "Platform, 6563 sayılı Kanun anlamında aracı hizmet sağlayıcı ve 5651 sayılı Kanun anlamında yer sağlayıcı konumundadır. Mekanlara ilişkin bilgiler, görseller ve fiyatlar Platform tarafından üretilmez; ilgili İşletme tarafından oluşturulur ve yayınlanır.",
      },
      {
        type: "p",
        text: "Platform, Kullanıcı ile İşletme arasında kurulan hiçbir sözleşmenin tarafı değildir. Mekanın tahsisi, ikram ve organizasyon hizmetlerinin içeriği, fiyatın kesinleşmesi, ödeme, kapora, iptal ve iade koşulları doğrudan Kullanıcı ile İşletme arasındaki ilişkiye tabidir.",
      },
      {
        type: "p",
        text: "Platform üzerinden ödeme alınmaz; Platform kapora, depozito veya hizmet bedeli tahsil etmez ve bir rezervasyonun gerçekleşeceğine dair garanti vermez. Platform’un işlevi, Kullanıcı’nın talebini ilgili İşletme’ye iletmek ve tarafların iletişime geçmesini sağlamaktır.",
      },
      {
        type: "p",
        text: "6563 sayılı Kanun’un 9. maddesi ve 5651 sayılı Kanun’un 5. maddesi uyarınca Platform, barındırdığı içeriği önceden kontrol etmek ve hukuka aykırı olup olmadığını araştırmak yükümlülüğü altında değildir. Buna karşılık bir içeriğin hukuka aykırılığından haberdar edildiğinde 10. bölümdeki usul çerçevesinde içeriği yayından kaldırır.",
      },
      {
        type: "p",
        text: "“Doğrulanmış İşletme” rozeti, İşletme’nin Platform’a sunduğu vergi levhası ve işyeri ruhsatı gibi belgelerin Platform tarafından incelendiğini gösterir. Bu rozet, İşletme’nin sunduğu hizmetin kalitesine, mekanın durumuna veya taahhütlerine ilişkin bir garanti değildir.",
      },
    ],
  },
  {
    heading: "4. Hizmetin Ücretsiz Olması ve İleride Ücretli Hizmet Sunulması",
    blocks: [
      {
        type: "p",
        text: "Kullanıcılar için Platform’un kullanımı, mekan araması yapılması ve teklif istenmesi ücretsizdir.",
      },
      {
        type: "p",
        text: "İşletmeler için üyelik, mekan listeleme ve teklif alma hâlihazırda ücretsizdir.",
      },
      {
        type: "p",
        text: "Platform ileride ücretli hizmetler sunabilir. Böyle bir durumda hizmetin kapsamı, bedeli, ödeme koşulları ve yürürlük tarihi önceden duyurulur. Hâlihazırda ücretsiz olarak yararlandığınız hizmetler için geçmişe etkili biçimde bedel talep edilmez ve ücretli bir hizmete geçiş yalnızca açık onayınızla gerçekleşir. Onay vermediğiniz sürece ücretsiz kullanım koşulları sizin için geçerli olmaya devam eder.",
      },
    ],
  },
  {
    heading: "5. Üyelik ve Hesap Güvenliği",
    blocks: [
      {
        type: "list",
        items: [
          "Üyelik oluşturabilmek için fiil ehliyetine sahip olmanız ve 18 yaşını doldurmuş olmanız gerekir.",
          "Üyelik sırasında verdiğiniz bilgilerin doğru, eksiksiz ve güncel olması gerekir. Bilgilerinizdeki değişiklikleri hesabınızdan güncelleyebilirsiniz.",
          "Hesabınıza ait giriş bilgilerinin gizliliğini korumak sizin sorumluluğunuzdadır. Hesabınızın yetkisiz kullanıldığını düşünüyorsanız gecikmeksizin bize bildirmeniz gerekir.",
          "İşletme hesabı açmak, başvuru yapılması ve sunulan belgelerin doğrulanmasına bağlıdır. Başvurunun kabulü Platform’un değerlendirmesine tabidir; reddedilen başvurunun gerekçesi talep üzerine bildirilir.",
          "Üyeliğinizi dilediğiniz zaman sona erdirebilirsiniz. Buna ilişkin esaslar 14. bölümde yer alır.",
        ],
      },
    ],
  },
  {
    heading: "6. Kullanıcıların Yükümlülükleri",
    blocks: [
      {
        type: "list",
        items: [
          "Teklif isteklerinde gerçek ve doğru bilgi vermek; etkinlik tarihi, davetli sayısı ve iletişim bilgilerini doğru bildirmek.",
          "Başka bir kişinin kişisel verilerini, o kişinin bilgisi ve izni olmaksızın Platform’a girmemek.",
          "İşletmelerin Platform üzerinden eriştiğiniz iletişim bilgilerini, kendi etkinliğinize ilişkin görüşme dışında herhangi bir tanıtım, pazarlama veya toplu ileti amacıyla kullanmamak.",
          "Platform içeriğini otomatik yazılımlarla sistematik olarak toplamamak, kopyalamamak veya başka bir mecrada derlenmiş veri olarak yayınlamamak.",
          "Yorum ve değerlendirmelerde gerçek deneyime dayanmak; hakaret, iftira ve kişisel veri açığa çıkaran ifadelerden kaçınmak.",
        ],
      },
    ],
  },
  {
    heading: "7. İşletmelerin Yükümlülükleri",
    blocks: [
      {
        type: "list",
        items: [
          "Platform’da listelediği mekan bakımından işletme yetkisine veya mekan sahibinin yazılı iznine sahip olmak.",
          "Mekanın kapasitesi, konumu, olanakları, menü içeriği ve fiyatlarına ilişkin bilgileri doğru ve güncel tutmak. Yanıltıcı veya gerçeğe aykırı bilgi yayınlanması, 6102 sayılı Türk Ticaret Kanunu’nun haksız rekabete ilişkin hükümleri ve tüketici mevzuatı bakımından İşletme’nin sorumluluğunu doğurur.",
          "Yayınlanan fiyatın hangi hizmetleri kapsadığını, vergilerin dahil olup olmadığını ve varsa asgari kişi sayısı gibi koşulları açıkça belirtmek.",
          "Platform üzerinden ulaşan teklif isteklerini makul bir süre içinde yanıtlamak.",
          "Kullanıcı’nın teklif isteğiyle paylaştığı kişisel verileri yalnızca o talebin değerlendirilmesi ve yanıtlanması amacıyla kullanmak; bu verileri başka amaçlarla işlememek, üçüncü kişilere aktarmamak ve pazarlama listelerine eklememek. İşletme, kendi veri işleme faaliyeti bakımından 6698 sayılı KVKK uyarınca bizzat veri sorumlusudur.",
          "Doğrulama kapsamında sunduğu belgelerin gerçek, kendisine ait ve güncel olmasını sağlamak.",
          "Yorum ve puanları etkilemek amacıyla ödeme teklif etmemek, Kullanıcılara karşılık vaadinde bulunmamak ve gerçek deneyime dayanmayan yorum oluşturmamak.",
        ],
      },
    ],
  },
  {
    heading: "8. İçerik, Telif Hakları ve Kullanım İzni",
    blocks: [
      {
        type: "p",
        text: "Platform’a yüklediğiniz fotoğraf, görsel, metin, menü ve belgeler bakımından; bunların hak sahibi olduğunuzu veya bu içerikleri Platform’da yayınlamaya yetkili olduğunuzu beyan edersiniz. 5846 sayılı Fikir ve Sanat Eserleri Kanunu kapsamında üçüncü kişilerin haklarını ihlal eden içerikten doğan hukuki ve cezai sorumluluk, içeriği yükleyen kişiye aittir.",
      },
      {
        type: "p",
        text: "Yüklediğiniz içeriğin hakları sizde kalır. Platform’a yalnızca hizmetlerin sunulması, mekanın Platform içinde ve arama motorlarında görünür kılınması ve Platform’un tanıtımı amacıyla bu içeriği kullanma, çoğaltma, yayma, işleme ve temsil etme yönünde bedelsiz bir kullanım izni vermiş olursunuz. Bu izin münhasır değildir.",
      },
      {
        type: "p",
        text: "İçeriğinizi Platform’dan kaldırdığınızda veya üyeliğiniz sona erdiğinde bu kullanım izni de sona erer. Teknik önbellek kayıtlarının ve yedeklerin makul süre içinde silinmesi ile arama motorlarının kendi dizinlerinde tuttuğu kopyalar bu hükmün dışındadır; bunlar Platform’un tasarrufunda değildir.",
      },
    ],
  },
  {
    heading: "9. Değerlendirme ve Yorumlar",
    blocks: [
      {
        type: "list",
        items: [
          "Yorumlar, ilgili mekanla gerçek bir deneyimi olan Kullanıcılar tarafından yapılabilir.",
          "Platform; hukuka aykırı, hakaret veya iftira içeren, üçüncü kişilerin kişisel verilerini açığa çıkaran, mekanla ilgisiz ya da ticari tanıtım amacı taşıyan yorumları kaldırabilir.",
          "Platform, bir yorumu yalnızca olumsuz olduğu için kaldırmaz, gizlemez veya geri plana itmez. Yorumların sıralaması bedel karşılığında değiştirilmez ve İşletmeler yorumların kaldırılması için ödeme yapamaz.",
          "İşletme, kendisi hakkında yapılan yoruma yanıt verme hakkına sahiptir.",
          "Yorumunu yazan Kullanıcı, yorumunu daha sonra düzeltebilir veya kaldırılmasını talep edebilir.",
        ],
      },
    ],
  },
  {
    heading: "10. Hukuka Aykırı İçeriğin Bildirimi ve Kaldırılması",
    blocks: [
      {
        type: "p",
        text: "Platform, yer sağlayıcı olarak barındırdığı içeriği denetlemekle yükümlü olmamakla birlikte, hukuka aykırılığından haberdar edildiği içeriği yayından kaldırır.",
      },
      {
        type: "p",
        text: "Kişilik haklarınızın ihlal edildiğini düşünüyorsanız, 5651 sayılı Kanun’un 9. maddesi kapsamında aşağıdaki iletişim adresi üzerinden başvurabilirsiniz. Başvurunuz en geç yirmi dört saat içinde değerlendirilir ve sonucu tarafınıza bildirilir.",
      },
      {
        type: "p",
        text: "Eser veya bağlantılı hak sahibi olarak telif hakkı ihlali iddianız varsa, 5846 sayılı Kanun’un Ek 4. maddesi kapsamında başvuruda bulunabilirsiniz. Başvurunuzda hak sahipliğinizi gösteren bilgiler, ihlal edildiğini düşündüğünüz içeriğin Platform üzerindeki adresi ve iletişim bilgilerinizin yer alması gerekir.",
      },
      {
        type: "p",
        text: "İçeriği kaldırılan taraf, kaldırma işlemine karşı aynı iletişim adresi üzerinden itiraz edebilir ve hak sahipliğini ortaya koyan bilgileri sunabilir. Platform, itirazı değerlendirip içeriği yeniden yayınlayabilir.",
      },
    ],
  },
  {
    heading: "11. Yasaklı Kullanımlar",
    blocks: [
      {
        type: "p",
        text: "Platform’un kullanımı sırasında aşağıdaki fiiller yasaktır:",
      },
      {
        type: "list",
        items: [
          "Platform’un işleyişini bozacak, aşırı yük bindirecek veya güvenlik önlemlerini aşmaya yönelik girişimlerde bulunmak.",
          "Başka bir kişi veya işletme adına, yetkisi olmaksızın hesap açmak ya da işlem yapmak.",
          "Gerçeğe aykırı mekan kaydı oluşturmak, var olmayan bir mekanı listelemek.",
          "Platform’daki verileri otomatik araçlarla sistematik biçimde çekmek veya derlenmiş veritabanını kopyalamak.",
          "Platform üzerinden elde edilen iletişim bilgilerini izinsiz ticari ileti gönderimi için kullanmak.",
          "Zararlı yazılım yaymak veya başkalarının hesap bilgilerini ele geçirmeye çalışmak.",
        ],
      },
    ],
  },
  {
    heading: "12. Sorumluluğun Kapsamı",
    blocks: [
      {
        type: "p",
        text: "Platform, hizmetlerini makul özen çerçevesinde ve mevcut hâliyle sunar. Teknik bakım, altyapı kaynaklı aksaklık veya mücbir sebep hâllerinde hizmette geçici kesinti yaşanabilir; Platform bu durumları mümkün olan en kısa sürede gidermek için gerekli özeni gösterir.",
      },
      {
        type: "p",
        text: "Platform, İşletmelerin sunduğu hizmetin icrasından, kalitesinden, iptalinden veya hiç yerine getirilmemesinden sorumlu değildir. Platform bu hizmet ilişkisinin tarafı olmadığından, mekana ilişkin taahhütlerin yerine getirilmesi İşletme’nin sorumluluğundadır.",
      },
      {
        type: "p",
        text: "İşletmeler tarafından yayınlanan kapasite, fiyat ve olanak bilgilerinin doğruluğu ilgili İşletme’ye aittir. Bir mekanla sözleşme kurmadan önce bu bilgileri İşletme ile doğrudan teyit etmeniz önerilir.",
      },
      {
        type: "p",
        text: "Platform’un kendi hizmetini sunarken gösterdiği özen yükümlülüğüne aykırı davranışından doğan sorumluluğu saklıdır. 6098 sayılı Türk Borçlar Kanunu’nun 115. maddesi uyarınca Platform’un kastından veya ağır kusurundan doğan sorumluluğu hiçbir şekilde sınırlandırılmamış ve ortadan kaldırılmamıştır.",
      },
    ],
  },
  {
    heading: "13. Kişisel Verilerin Korunması ve Ticari Elektronik İletiler",
    blocks: [
      {
        type: "p",
        text: "Kişisel verilerinizin hangi amaçlarla işlendiği, kimlere aktarıldığı ve 6698 sayılı KVKK’nın 11. maddesinden doğan haklarınız Gizlilik Politikası ve KVKK Aydınlatma Metni’nde ayrıntılı olarak açıklanmıştır.",
      },
      {
        type: "p",
        text: "6563 sayılı Kanun’un 8. maddesi uyarınca tarafınıza gönderilen ticari elektronik iletileri reddetme hakkınız bulunur. Bu hakkı, iletilerin içinde yer alan abonelikten çıkma bağlantısı aracılığıyla veya aşağıdaki iletişim adresine yazarak kullanabilirsiniz. Ret bildiriminiz gecikmeksizin ve en geç üç iş günü içinde yerine getirilir.",
      },
      {
        type: "p",
        text: "Hesabınızın güvenliği, aldığınız veya gönderdiğiniz teklifler ve bu Kullanım Koşulları’ndaki değişiklikler gibi hizmetin işleyişine ilişkin zorunlu bildirimler ticari elektronik ileti niteliğinde değildir. Üyeliğiniz sürdüğü sürece bu bildirimler gönderilmeye devam eder.",
      },
    ],
  },
  {
    heading: "14. Sözleşmenin Süresi ve Sona Ermesi",
    blocks: [
      {
        type: "list",
        items: [
          "Bu Kullanım Koşulları, Platform’u kullanmaya başladığınız anda yürürlüğe girer ve belirsiz sürelidir.",
          "Üyeliğinizi dilediğiniz zaman, gerekçe göstermeksizin sona erdirebilirsiniz. Bu yönde talebinizi aşağıdaki iletişim adresine iletmeniz yeterlidir.",
          "Platform, bu koşulların ihlali hâlinde hesabı askıya alabilir veya sona erdirebilir. İhlalin niteliği elverdiği ölçüde önce uyarı yapılır ve aykırılığın giderilmesi için makul bir süre tanınır.",
          "Açıkça hukuka aykırı içerik yayınlanması, üçüncü kişilere zarar verilmesi veya Platform’un güvenliğinin tehdit edilmesi hâllerinde hesap uyarı yapılmaksızın askıya alınabilir. Bu durumda askıya almanın gerekçesi tarafınıza bildirilir.",
          "Üyeliğin sona ermesi hâlinde, mevzuatın öngördüğü saklama süreleri saklı kalmak üzere kişisel verileriniz Gizlilik Politikası’nda açıklanan esaslara göre silinir veya anonim hâle getirilir.",
        ],
      },
    ],
  },
  {
    heading: "15. Koşullardaki Değişiklikler",
    blocks: [
      {
        type: "p",
        text: "Platform, hizmetlerin gelişimi veya mevzuat değişiklikleri sebebiyle bu Kullanım Koşulları’nda değişiklik yapabilir.",
      },
      {
        type: "p",
        text: "Hak ve yükümlülüklerinizi esaslı biçimde etkileyen değişiklikler, yürürlüğe girmesinden en az on beş gün önce Platform’da duyurulur ve kayıtlı kullanıcılara e-posta ile bildirilir. Yürürlük tarihi her zaman bu sayfanın başında gösterilir.",
      },
      {
        type: "p",
        text: "Değişiklikleri kabul etmiyorsanız, yürürlük tarihinden önce üyeliğinizi sona erdirebilirsiniz. Yürürlük tarihinden sonra Platform’u kullanmaya devam etmeniz, değişiklikleri kabul ettiğiniz anlamına gelir. Metnin önceki sürümleri talep üzerine tarafınızla paylaşılır.",
      },
    ],
  },
  {
    heading: "16. Fikri Mülkiyet Hakları",
    blocks: [
      {
        type: "p",
        text: "“davetyerim” adı ve logosu, Platform’un arayüz tasarımı, yazılımı, metinleri ve mekan kayıtlarından oluşan derlenmiş veritabanı üzerindeki haklar Platform’a aittir. İşletmelerin kendi yükledikleri içerikler bu hükmün dışındadır ve 8. bölüme tabidir.",
      },
      {
        type: "p",
        text: "Platform’a ait bu unsurlar, yazılı izin alınmaksızın kopyalanamaz, çoğaltılamaz, başka bir mecrada yayınlanamaz veya ticari amaçla kullanılamaz.",
      },
    ],
  },
  {
    heading: "17. Uygulanacak Hukuk ve Uyuşmazlıkların Çözümü",
    blocks: [
      {
        type: "p",
        text: "Bu Kullanım Koşulları’na Türk hukuku uygulanır.",
      },
      {
        type: "p",
        text: "Tüketici sıfatını taşıyan Kullanıcılar bakımından 6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca tüketici hakem heyetlerine ve tüketici mahkemelerine başvurma hakkı saklıdır. Bu metindeki hiçbir hüküm, tüketicinin kanundan doğan haklarını ortadan kaldıracak veya sınırlandıracak şekilde yorumlanamaz.",
      },
      {
        type: "p",
        text: "Diğer hâllerde, uyuşmazlıkların çözümünde 6100 sayılı Hukuk Muhakemeleri Kanunu’nun yetkiye ilişkin genel hükümleri uygulanır.",
      },
    ],
  },
  {
    heading: "18. Yürürlük ve İletişim",
    blocks: [
      {
        type: "p",
        text: `Bu Kullanım Koşulları ${TERMS_EFFECTIVE_DATE} tarihinde yürürlüğe girmiştir.`,
      },
      {
        type: "p",
        text: `Bu metne, içeriğin kaldırılmasına, ticari iletilerin reddine ve üyeliğin sona erdirilmesine ilişkin tüm bildirimlerinizi ${OPERATOR_INFO.email} adresine iletebilirsiniz.`,
      },
    ],
  },
];
