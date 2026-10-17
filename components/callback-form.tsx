"use client";

import { useActionState } from "react";
import {
  createCallbackRequest,
  type LeadFormState,
} from "@/app/actions/leads";
import { IconCheck } from "@/components/icons";
import { KvkkNotice } from "@/components/kvkk-notice";

const initialState: LeadFormState = { ok: null, message: "" };

/**
 * Düşük sürtünmeli giriş: yalnızca ad ve telefon.
 *
 * Uzun teklif formunu doldurmaya niyeti olmayan ziyaretçi, bu iki alanı
 * doldurup çıkabilsin diye var. Tarih, kategori, davetli sayısı istenmez —
 * her ek alan bu noktada dönüşümü düşürür.
 */
export function CallbackForm({ venueId }: { venueId: string }) {
  const [state, formAction, pending] = useActionState(
    createCallbackRequest,
    initialState
  );

  if (state.ok) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-sage/30 bg-sage/10 px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/20 text-sage">
          <IconCheck size={16} strokeWidth={2.4} />
        </span>
        <p className="text-sm text-ink-soft">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-hairline bg-cream px-5 py-5"
    >
      <input type="hidden" name="venue_id" value={venueId} />

      <p className="text-sm font-medium text-ink">
        Form doldurmak istemiyor musunuz?
      </p>
      <p className="mt-1 text-xs leading-relaxed text-mute">
        Numaranızı bırakın, mekan sizi arasın.
      </p>

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <input
          name="name"
          required
          minLength={2}
          placeholder="Adınız"
          autoComplete="name"
          className="min-w-0 flex-1 rounded-xl border border-hairline bg-parchment px-4 py-2.5 text-sm text-ink placeholder:text-mute focus:border-bordeaux/40 focus:outline-none"
        />
        <input
          name="phone"
          type="tel"
          required
          placeholder="Telefon"
          autoComplete="tel"
          inputMode="tel"
          className="min-w-0 flex-1 rounded-xl border border-hairline bg-parchment px-4 py-2.5 text-sm text-ink placeholder:text-mute focus:border-bordeaux/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-ink-soft disabled:opacity-60"
        >
          {pending ? "Gönderiliyor…" : "Beni ara"}
        </button>
      </div>

      {state.ok === false && (
        <p className="mt-3 text-sm text-bordeaux">{state.message}</p>
      )}

      <KvkkNotice className="mt-3" />
    </form>
  );
}
