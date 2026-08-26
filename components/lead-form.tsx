"use client";

import { useActionState } from "react";
import { createLead, type LeadFormState } from "@/app/actions/leads";
import { CATEGORIES } from "@/lib/constants";
import { IconArrowUpRight, IconCheck } from "@/components/icons";

const initialState: LeadFormState = { ok: null, message: "" };

export function LeadForm({
  venueId,
  venueCategories,
}: {
  venueId: string;
  venueCategories: string[];
}) {
  const [state, formAction, pending] = useActionState(createLead, initialState);

  const categories = CATEGORIES.filter((c) =>
    venueCategories.includes(c.slug)
  );

  if (state.ok) {
    return (
      <div className="rounded-[calc(1.75rem-0.375rem)] bg-cream p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-sage">
          <IconCheck size={22} strokeWidth={2.2} />
        </span>
        <p className="mt-4 font-display text-xl font-semibold text-ink">
          İsteğiniz gönderildi
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-[calc(1.75rem-0.375rem)] bg-cream p-6"
    >
      <input type="hidden" name="venue_id" value={venueId} />

      <p className="font-display text-xl font-semibold text-ink">
        Ücretsiz Teklif Al
      </p>
      <p className="-mt-1 text-xs text-mute">
        Bilgileriniz yalnızca bu mekanla paylaşılır.
      </p>

      <input name="name" placeholder="Adınız Soyadınız *" required className="field" />
      <input
        name="phone"
        type="tel"
        placeholder="Telefon numaranız *"
        required
        className="field"
      />
      <input name="email" type="email" placeholder="E-posta (isteğe bağlı)" className="field" />

      <div className="grid grid-cols-2 gap-3">
        <input
          name="event_date"
          type="date"
          aria-label="Etkinlik tarihi"
          className="field"
        />
        <input
          name="guest_count"
          type="number"
          min={1}
          placeholder="Davetli sayısı"
          className="field"
        />
      </div>

      <select name="category" className="field" aria-label="Etkinlik türü">
        <option value="">Etkinlik türü seçin</option>
        {(categories.length ? categories : CATEGORIES).map((cat) => (
          <option key={cat.slug} value={cat.slug}>
            {cat.label}
          </option>
        ))}
      </select>

      <textarea
        name="message"
        rows={3}
        placeholder="Eklemek istedikleriniz…"
        className="field resize-none"
      />

      {state.ok === false && (
        <p className="rounded-2xl bg-bordeaux/10 px-4 py-3 text-sm text-bordeaux">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group mt-1 flex items-center justify-center gap-2 rounded-full bg-bordeaux py-3.5 pl-6 pr-2 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Teklif İste"}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-lux group-hover:translate-x-0.5">
          <IconArrowUpRight size={15} strokeWidth={2.2} />
        </span>
      </button>
    </form>
  );
}
