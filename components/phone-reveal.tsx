"use client";

import { useState } from "react";

export function PhoneReveal({
  phone,
  whatsapp,
}: {
  phone: string;
  whatsapp: string;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!phone && !whatsapp) return null;

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => setRevealed(true)}
        className="w-full rounded-full border border-bordeaux/30 py-3 text-sm font-medium text-bordeaux transition-colors duration-500 ease-lux hover:bg-blush"
      >
        Telefonu Göster
      </button>
    );
  }

  const waNumber = whatsapp.replace(/\D/g, "").replace(/^0/, "90");

  return (
    <div className="flex flex-col gap-2">
      {phone && (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="flex items-center justify-center rounded-full bg-ink py-3 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-ink-soft"
        >
          {phone}
        </a>
      )}
      {whatsapp && (
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-full border border-sage/40 py-3 text-sm font-medium text-sage transition-colors duration-500 ease-lux hover:bg-sage/10"
        >
          WhatsApp ile Yaz
        </a>
      )}
    </div>
  );
}
