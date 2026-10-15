"use client";

import { useActionState } from "react";
import {
  createOwnerInquiry,
  type OwnerInquiryState,
} from "@/app/actions/owner-inquiry";
import { CITIES, VENUE_TYPES } from "@/lib/constants";
import { IconArrowUpRight, IconCheck } from "@/components/icons";

const initialState: OwnerInquiryState = { ok: null, message: "" };

export function OwnerInquiryForm() {
  const [state, formAction, pending] = useActionState(
    createOwnerInquiry,
    initialState
  );

  if (state.ok) {
    return (
      <div className="rounded-[1.75rem] border border-hairline bg-parchment p-10 text-center shadow-float">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-sage">
          <IconCheck size={22} strokeWidth={2.2} />
        </span>
        <p className="mt-4 font-display text-xl font-semibold text-ink">
          Başvurunuz alındı
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-[1.75rem] border border-hairline bg-parchment p-6 shadow-float sm:p-8"
    >
      <p className="font-display text-2xl font-semibold text-ink">
        Mekanınızı konuşalım
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Kısa bir form doldurun; sizi arayıp mekanınıza uygun çözümü birlikte
        belirleyelim. Başvuru ücretsiz, herhangi bir taahhüt yok.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <input
          name="venue_name"
          placeholder="Mekan adı *"
          required
          className="field sm:col-span-2"
        />
        <input
          name="contact_name"
          placeholder="Yetkili adı soyadı *"
          required
          className="field"
        />
        <input
          name="phone"
          type="tel"
          placeholder="Telefon *"
          required
          className="field"
        />
        <input
          name="email"
          type="email"
          placeholder="E-posta (isteğe bağlı)"
          className="field"
        />
        <select name="city" defaultValue="" className="field">
          <option value="">Şehir seçin</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <select name="venue_type" defaultValue="" className="field sm:col-span-2">
          <option value="">Mekan türü seçin</option>
          {VENUE_TYPES.map((type) => (
            <option key={type.slug} value={type.slug}>
              {type.label}
            </option>
          ))}
        </select>
        <textarea
          name="message"
          rows={3}
          placeholder="Eklemek istedikleriniz (kapasite, konum, beklentiniz…)"
          className="field sm:col-span-2"
        />
      </div>

      {state.ok === false && (
        <p className="mt-4 text-sm text-bordeaux">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-bordeaux py-4 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Bilgi Al"}
        {!pending && (
          <span className="transition-transform duration-500 ease-lux group-hover:translate-x-0.5 group-hover:-translate-y-px">
            <IconArrowUpRight size={15} strokeWidth={2.2} />
          </span>
        )}
      </button>

      <p className="mt-3 text-center text-xs text-mute">
        Bilgileriniz yalnızca davetyerim ekibiyle paylaşılır.
      </p>
    </form>
  );
}
