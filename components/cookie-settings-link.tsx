"use client";

import { openConsentSettings } from "@/lib/consent";

/**
 * Verilen çerez onayını geri almanın yolu.
 *
 * Onayın alınması kadar geri alınması da kolay olmalı; kalıcı bir erişim
 * noktası olmadan verilen rıza serbest iradeyle verilmiş sayılmaz.
 */
export function CookieSettingsLink() {
  return (
    <button
      type="button"
      onClick={openConsentSettings}
      className="text-sm text-ink-soft transition-colors duration-300 hover:text-bordeaux"
    >
      Çerez Ayarları
    </button>
  );
}
