// Sitemap'teki URL'leri IndexNow ile arama motorlarına bildirir.
// Çalıştırma: node scripts/indexnow.mjs
//
// IndexNow, Bing ve Yandex'in ortak protokolü: hesap veya doğrulama
// gerektirmez, yalnızca anahtarın site kökünden erişilebilir olmasını ister.
// Google IndexNow'ı kullanmaz; oraya Search Console üzerinden bildirilir.
//
// Anahtar dosyası public/<key>.txt içinde ve deploy edilmiş olmalıdır;
// aksi hâlde API 403 döner.

const KEY = "7e4dc53b697f3b4b2db219a5d5bb4b4f";
const HOST = "davetyerim.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";

const sitemapUrl = `https://${HOST}/sitemap.xml`;

const sitemap = await fetch(sitemapUrl);
if (!sitemap.ok) {
  console.error(`Sitemap okunamadı: HTTP ${sitemap.status}`);
  process.exit(1);
}

const xml = await sitemap.text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (urlList.length === 0) {
  console.error("Sitemap'te URL bulunamadı.");
  process.exit(1);
}

const keyCheck = await fetch(`https://${HOST}/${KEY}.txt`);
if (!keyCheck.ok) {
  console.error(
    `Anahtar dosyası yayında değil (HTTP ${keyCheck.status}). Önce deploy edin.`
  );
  process.exit(1);
}

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  }),
});

console.log(`${urlList.length} URL bildirildi — HTTP ${res.status}`);
console.log(res.status === 200 || res.status === 202 ? "Kabul edildi." : await res.text());
