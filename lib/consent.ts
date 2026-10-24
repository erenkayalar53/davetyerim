/**
 * Çerez onayının okunup yazıldığı tek yer.
 *
 * Onay tarayıcıda saklanır, sunucuya gönderilmez: tercihi tutmak için
 * kullanıcıyı tanımlamaya gerek yok. Saklama anahtarı sürüm taşır; çerez
 * politikası esaslı biçimde değişirse sürüm artırılarak herkesten yeniden
 * onay istenebilir.
 */
export const CONSENT_STORAGE_KEY = "dy-consent-v1";

/** Footer'daki "Çerez Ayarları" bağlantısının tetiklediği olay. */
export const CONSENT_OPEN_EVENT = "dy:consent-open";

/** Tercih değiştiğinde useSyncExternalStore'u uyandıran olay. */
export const CONSENT_CHANGED_EVENT = "dy:consent-changed";

export type ConsentState = {
  /** Zorunlu çerezler her zaman açıktır, tercihe bağlı değildir. */
  analytics: boolean;
  /** Onayın alındığı an — ispat yükümlülüğü için. */
  decidedAt: string;
};

export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  // Başka sekmede verilen karar bu sekmeye de yansısın.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Ham string döner, nesne değil: useSyncExternalStore anlık görüntünün
 * referansının sabit kalmasını ister, her çağrıda yeni nesne üretmek
 * sonsuz render döngüsüne yol açar.
 */
export function getConsentSnapshot(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    // Gizli sekme veya site verisi engelliyse okuma hata verebilir.
    // Onay alınmamış sayılır: banner gösterilir, hiçbir izleme çalışmaz.
    return null;
  }
}

/**
 * Sunucu render'ında ve hidrasyon turunda tercih "henüz bilinmiyor"dur.
 *
 * null dönseydi sunucu HTML'i bandı basar, kararını çoktan vermiş
 * ziyaretçi her sayfa açılışında bandın bir anlığına görünüp kaybolmasıyla
 * karşılaşırdı.
 */
export function getServerConsentSnapshot(): undefined {
  return undefined;
}

export function parseConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (typeof parsed.analytics !== "boolean") return null;
    return {
      analytics: parsed.analytics,
      decidedAt: parsed.decidedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function readConsent(): ConsentState | null {
  return parseConsent(getConsentSnapshot());
}

export function writeConsent(analytics: boolean): ConsentState {
  const state: ConsentState = {
    analytics,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Yazılamazsa tercih yalnızca bu sekme için geçerli olur.
  }
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
  return state;
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
