"use client";

import { useState } from "react";
import { respondToLead } from "@/app/actions/owner";
import type { Lead } from "@/lib/types";

/**
 * Mekan sahibinin teklif talebini yanıtladığı satır içi form.
 *
 * Fiyat isteğe bağlı: sahibi telefonla görüşmeyi tercih edebilir. Ama
 * "yanıtladım" işareti konmadan çiftin ekranında talep bekliyor görünür ve
 * mekanın yanıt süresi ölçülemez — bu yüzden buton tek başına da anlamlı.
 */
export function LeadRespondForm({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  const answered = Boolean(lead.responded_at);

  if (answered && !open) {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex w-max items-center gap-1 rounded-full bg-sage/15 px-2.5 py-0.5 text-[11px] font-medium text-sage">
          Yanıtlandı
        </span>
        {lead.quoted_price !== null && (
          <span className="text-xs text-ink-soft">
            {Number(lead.quoted_price).toLocaleString("tr-TR")} ₺ / kişi
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-max text-[11px] text-mute underline-offset-2 hover:text-bordeaux hover:underline"
        >
          Düzenle
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-sage px-4 py-1.5 text-xs font-medium text-cream transition-opacity hover:opacity-90"
      >
        Yanıtla
      </button>
    );
  }

  return (
    <form action={respondToLead} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={lead.id} />
      <input
        name="quoted_price"
        type="number"
        min={0}
        step="0.01"
        inputMode="decimal"
        defaultValue={lead.quoted_price ?? ""}
        placeholder="Kişi başı ₺"
        className="w-32 rounded-lg border border-hairline bg-cream px-3 py-1.5 text-xs text-ink placeholder:text-mute focus:border-bordeaux/40 focus:outline-none"
      />
      <textarea
        name="owner_note"
        rows={2}
        defaultValue={lead.owner_note}
        placeholder="Kısa not (isteğe bağlı)"
        className="w-48 rounded-lg border border-hairline bg-cream px-3 py-1.5 text-xs text-ink placeholder:text-mute focus:border-bordeaux/40 focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-full bg-sage px-4 py-1.5 text-xs font-medium text-cream transition-opacity hover:opacity-90"
        >
          Gönder
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[11px] text-mute hover:text-ink"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}
