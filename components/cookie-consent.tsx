"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  CONSENT_OPEN_EVENT,
  getConsentSnapshot,
  getServerConsentSnapshot,
  parseConsent,
  readConsent,
  subscribeConsent,
  writeConsent,
} from "@/lib/consent";
import { GoogleAnalytics } from "@/components/google-analytics";

/**
 * Çerez onay bandı ve tercih paneli.
 *
 * Temel onay modu: analitik onayı verilmeden GoogleAnalytics hiç render
 * edilmez, dolayısıyla Google'a tek bir istek bile gitmez. Bu bileşen onayın
 * tek sahibidir — etiketin yüklenip yüklenmeyeceğine buradaki state karar verir.
 *
 * "Reddet" ve "Kabul et" aynı görsel ağırlıkta: KVKK ve GDPR reddetmenin
 * kabul etmek kadar kolay olmasını arar, kabulü öne çıkaran tasarımlar
 * geçersiz onay sayılır.
 */
export function CookieConsent({ gaId }: { gaId: string | null }) {
  const raw = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot
  );
  const stored = useMemo(() => parseConsent(raw ?? null), [raw]);

  // Kararını vermiş ziyaretçi bandı footer bağlantısıyla yeniden açabilir.
  const [reopened, setReopened] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const open = () => {
      setAnalyticsChecked(readConsent()?.analytics ?? false);
      setPanelOpen(true);
      setReopened(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  useEffect(() => {
    if (!panelOpen) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  const decide = useCallback((analytics: boolean) => {
    writeConsent(analytics);
    setPanelOpen(false);
    setReopened(false);
  }, []);

  const openPanel = useCallback(() => {
    setAnalyticsChecked(stored?.analytics ?? false);
    setPanelOpen(true);
  }, [stored]);

  // raw === undefined: tercih henüz okunmadı, hiçbir şey basma.
  const known = raw !== undefined;
  const showBanner = known && (stored === null || reopened);

  return (
    <>
      {gaId && stored?.analytics ? <GoogleAnalytics gaId={gaId} /> : null}

      {showBanner ? (
        <div
          role="dialog"
          aria-label="Çerez tercihleri"
          className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
        >
          <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-hairline bg-parchment/95 p-5 shadow-float backdrop-blur-xl sm:p-6">
            <p className="font-display text-lg font-semibold text-ink">
              Çerez tercihleriniz
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Sitenin çalışması için zorunlu çerezleri kullanıyoruz. Bunun
              dışında, siteyi nasıl kullandığınızı anlamak için isteğe bağlı
              analitik çerezler kullanmak istiyoruz. Seçiminizi istediğiniz
              zaman değiştirebilirsiniz. Ayrıntılar için{" "}
              <Link
                href="/gizlilik"
                className="underline decoration-hairline underline-offset-4 transition-colors hover:text-bordeaux"
              >
                Gizlilik Politikası
              </Link>
              .
            </p>

            {panelOpen ? (
              <div
                ref={panelRef}
                tabIndex={-1}
                className="mt-5 space-y-4 rounded-2xl border border-hairline bg-cream/60 p-4 outline-none"
              >
                <CategoryRow
                  title="Zorunlu çerezler"
                  description="Oturumun açık kalmasını ve güvenlik doğrulamalarını sağlar. Olmadan giriş yapılamaz, bu yüzden kapatılamaz."
                  checked
                  locked
                />
                <CategoryRow
                  title="Analitik çerezler"
                  description="Google Analytics. Hangi sayfaların ilgi gördüğünü ve ziyaretçilerin siteyi nasıl kullandığını ölçer."
                  checked={analyticsChecked}
                  onChange={setAnalyticsChecked}
                />
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              {panelOpen ? (
                <button
                  type="button"
                  onClick={() => decide(analyticsChecked)}
                  className="rounded-full bg-bordeaux px-6 py-3 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-bordeaux-deep sm:py-2.5"
                >
                  Seçimi kaydet
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openPanel}
                  className="rounded-full border border-hairline px-6 py-3 text-sm font-medium text-ink-soft transition-colors duration-500 ease-lux hover:text-bordeaux sm:py-2.5"
                >
                  Ayarlar
                </button>
              )}
              <button
                type="button"
                onClick={() => decide(false)}
                className="rounded-full border border-bordeaux/30 px-6 py-3 text-sm font-medium text-bordeaux transition-colors duration-500 ease-lux hover:bg-bordeaux/5 sm:py-2.5"
              >
                Reddet
              </button>
              <button
                type="button"
                onClick={() => decide(true)}
                className="rounded-full border border-bordeaux/30 px-6 py-3 text-sm font-medium text-bordeaux transition-colors duration-500 ease-lux hover:bg-bordeaux/5 sm:py-2.5"
              >
                Kabul et
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CategoryRow({
  title,
  description,
  checked,
  locked = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-mute">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={locked}
        onClick={() => onChange?.(!checked)}
        className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-500 ease-lux ${
          checked
            ? "border-bordeaux/40 bg-bordeaux"
            : "border-hairline bg-cream-deep"
        } ${locked ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-parchment shadow-sm transition-transform duration-500 ease-lux ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
