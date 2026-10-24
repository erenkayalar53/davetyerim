"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sayfa geçişlerini GA4'e bildirir.
 *
 * App Router'da gezinme tam sayfa yüklemesi değil, bu yüzden gtag'in kendi
 * otomatik page_view'ı yalnızca ilk açılışta çalışırdı. Otomatik olan
 * kapatıldı (send_page_view:false) ve olaylar buradan gönderiliyor.
 *
 * `ready` beklenir: bootstrap çalışmadan gönderilen bir page_view,
 * config'den önce kuyruğa girer ve GA tarafından yok sayılır.
 */
function PageViewTracker({ ready }: { ready: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!ready) return;
    const query = searchParams.toString();

    window.gtag?.("event", "page_view", {
      page_path: query ? `${pathname}?${query}` : pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [ready, pathname, searchParams]);

  return null;
}

/**
 * GA4 (gtag.js) — yalnızca analitik onayı verildiğinde render edilir.
 *
 * Temel (basic) onay modu: onay yoksa bu bileşen hiç basılmaz, dolayısıyla
 * Google'a tek bir istek bile gitmez. Gelişmiş mod yerine bu seçildi; çünkü
 * gelişmiş modun tek kazancı olan davranış modellemesi günde 1.000 reddedilmiş
 * olay eşiği istiyor ve o hacme ulaşana dek rapora hiçbir katkısı olmuyor.
 *
 * Consent Mode v2 komutları yine de gönderiliyor: reklam depolama izinleri
 * açıkça reddedilmiş durumda, ileride reklam pikseli eklenirse sinyal zaten
 * doğru kurulmuş olur.
 */
export function GoogleAnalytics({ gaId }: { gaId: string }) {
  const [ready, setReady] = useState(false);
  const id = JSON.stringify(gaId);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
        strategy="afterInteractive"
      />
      <Script id="ga-bootstrap" strategy="afterInteractive" onReady={() => setReady(true)}>
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});gtag('consent','update',{analytics_storage:'granted'});gtag('js',new Date());gtag('config',${id},{send_page_view:false});`}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker ready={ready} />
      </Suspense>
    </>
  );
}
