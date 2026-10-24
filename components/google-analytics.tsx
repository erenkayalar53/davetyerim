import Script from "next/script";
import { GaPageView } from "@/components/ga-page-view";

/**
 * GA4 (gtag.js) kurulumu.
 *
 * Bootstrap satırı hidrasyondan önce çalışan düz bir <script>: dataLayer
 * kuyruğunu açar, böylece gtag.js henüz inmemişken gönderilen ilk page_view
 * kaybolmaz.
 *
 * send_page_view kapalı. App Router'da sayfa geçişleri tam sayfa yüklemesi
 * değil, bu yüzden page_view olaylarını GaPageView gönderir; açık bırakılsa
 * ilk görüntüleme iki kez sayılırdı.
 */
export function GoogleAnalytics({ gaId }: { gaId: string }) {
  const id = JSON.stringify(gaId);

  return (
    <>
      <script
        id="ga-bootstrap"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};gtag('js',new Date());gtag('config',${id},{send_page_view:false});`,
        }}
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
        strategy="afterInteractive"
      />
      <GaPageView />
    </>
  );
}
