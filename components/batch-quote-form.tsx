"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createBatchLeads, type LeadFormState } from "@/app/actions/leads";
import { CATEGORIES, formatPrice } from "@/lib/constants";
import { IconCheck } from "@/components/icons";
import { KvkkNotice } from "@/components/kvkk-notice";
import type { Venue } from "@/lib/types";

const initialState: LeadFormState = { ok: null, message: "" };
const MAX_SELECTION = 15;

/**
 * Favorilerden tek formla birden çok mekana teklif isteme.
 *
 * Çift, beğendiği her mekan için aynı bilgileri baştan yazmak zorunda
 * kalmasın diye var; platformun asıl işini yaptığı yer burası.
 */
export function BatchQuoteForm({ venues }: { venues: Venue[] }) {
  const [state, formAction, pending] = useActionState(
    createBatchLeads,
    initialState
  );
  const [selected, setSelected] = useState<string[]>(() =>
    venues.slice(0, MAX_SELECTION).map((v) => v.id)
  );

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((v) => v !== id)
        : [...current, id]
    );
  };

  const today = new Date().toISOString().slice(0, 10);
  const tooMany = selected.length > MAX_SELECTION;

  // Ortak kategoriler: yalnızca seçili mekanların hepsinde bulunan etkinlik
  // türleri sunulur, yoksa hiçbirinde geçmeyen bir tür seçilebilir.
  const selectedVenues = venues.filter((v) => selected.includes(v.id));
  const categories = CATEGORIES.filter((c) =>
    selectedVenues.some((v) => v.categories.includes(c.slug))
  );

  if (state.ok) {
    return (
      <div className="rounded-[1.75rem] border border-sage/30 bg-sage/10 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage/20 text-sage">
          <IconCheck size={22} strokeWidth={2.2} />
        </span>
        <p className="mt-4 font-display text-xl font-semibold text-ink">
          Talepleriniz iletildi
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {state.message}
        </p>
        <Link
          href="/tekliflerim"
          className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-ink-soft"
        >
          Tekliflerimi görüntüle
        </Link>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-[1.75rem] border border-gold/30 bg-parchment p-6 shadow-float sm:p-7"
    >
      <h2 className="font-display text-2xl font-semibold text-ink">
        Hepsinden tek seferde teklif al
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Bilgilerinizi bir kez yazın, seçtiğiniz mekanların hepsine gitsin.
        Gelen yanıtları Tekliflerim sayfasında yan yana karşılaştırırsınız.
      </p>

      {/* Mekan seçimi */}
      <fieldset className="mt-6">
        <legend className="text-[10px] font-medium uppercase tracking-[0.15em] text-mute">
          Mekanlar ({selected.length} seçili)
        </legend>
        <div className="mt-3 flex flex-col gap-1.5">
          {venues.map((venue) => {
            const checked = selected.includes(venue.id);
            return (
              <label
                key={venue.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors duration-300 ${
                  checked
                    ? "border-bordeaux/30 bg-cream"
                    : "border-hairline bg-transparent"
                }`}
              >
                <input
                  type="checkbox"
                  name="venue_ids"
                  value={venue.id}
                  checked={checked}
                  onChange={() => toggle(venue.id)}
                  className="h-4 w-4 shrink-0 accent-[#7e2a3a]"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {venue.name}
                </span>
                <span className="shrink-0 text-xs text-mute">
                  {venue.city} · {formatPrice(venue.price_min)}–
                  {formatPrice(venue.price_max)} ₺
                </span>
              </label>
            );
          })}
        </div>
        {tooMany && (
          <p className="mt-3 text-sm text-bordeaux">
            En fazla {MAX_SELECTION} mekan seçebilirsiniz. Şu an{" "}
            {selected.length} seçili.
          </p>
        )}
      </fieldset>

      {/* İletişim ve etkinlik bilgileri */}
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <Field label="Adınız" required>
          <input
            name="name"
            required
            minLength={2}
            autoComplete="name"
            className={inputClass}
          />
        </Field>
        <Field label="Telefon" required>
          <input
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            className={inputClass}
          />
        </Field>
        <Field label="E-posta">
          <input
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
          />
        </Field>
        <Field label="Etkinlik tarihi">
          <input
            name="event_date"
            type="date"
            min={today}
            className={inputClass}
          />
        </Field>
        <Field label="Etkinlik türü">
          <select name="category" className={inputClass} defaultValue="">
            <option value="">Seçiniz</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Davetli sayısı">
          <input
            name="guest_count"
            type="number"
            min={1}
            inputMode="numeric"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Eklemek istedikleriniz">
          <textarea name="message" rows={3} className={inputClass} />
        </Field>
      </div>

      {state.ok === false && (
        <p className="mt-4 text-sm text-bordeaux">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending || selected.length === 0 || tooMany}
        className="mt-6 w-full rounded-full bg-bordeaux px-6 py-3.5 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-bordeaux-deep disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Gönderiliyor…"
          : selected.length === 0
            ? "En az bir mekan seçin"
            : `${selected.length} mekana teklif isteği gönder`}
      </button>

      <p className="mt-3 text-center text-xs text-mute">
        Seçtiğiniz tarihte dolu olan mekanlar otomatik atlanır.
      </p>

      <KvkkNotice className="mt-2" />
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-hairline bg-cream px-4 py-2.5 text-sm text-ink placeholder:text-mute focus:border-bordeaux/40 focus:outline-none";

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-mute">
        {label}
        {required && <span className="text-bordeaux"> *</span>}
      </span>
      {children}
    </label>
  );
}
