"use client";

import { useActionState } from "react";
import {
  applyForOwner,
  type OwnerApplicationState,
} from "@/app/actions/owner";
import { CITIES } from "@/lib/constants";

const initialState: OwnerApplicationState = { ok: null, message: "" };

export function OwnerApplicationForm({
  defaultName,
  defaultPhone,
}: {
  defaultName?: string;
  defaultPhone?: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    applyForOwner,
    initialState
  );

  if (state.ok) {
    return (
      <div className="rounded-[1.75rem] border border-hairline bg-parchment p-1.5 shadow-lift">
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-cream p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-xl">
            ⏳
          </span>
          <p className="mt-4 font-display text-xl font-semibold text-ink">
            Başvurunuz alındı
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-hairline bg-parchment p-1.5 shadow-lift">
      <form
        action={formAction}
        className="flex flex-col gap-3 rounded-[calc(1.75rem-0.375rem)] bg-cream p-7"
      >
        <p className="font-display text-xl font-semibold text-ink">
          İşletme Başvurusu
        </p>
        <p className="-mt-1 text-sm text-mute">
          Bilgilerinizi doğruladıktan sonra hesabınızı mekan sahibi olarak
          aktifleştiriyoruz. Bu, platformdaki mekan kalitesini korur.
        </p>

        <input
          name="business_name"
          placeholder="İşletme / Mekan adı *"
          defaultValue={defaultName ?? ""}
          required
          className="field"
        />
        <input
          name="business_phone"
          type="tel"
          placeholder="İşletme telefonu *"
          defaultValue={defaultPhone ?? ""}
          required
          className="field"
        />
        <select name="business_city" required defaultValue="" className="field">
          <option value="" disabled>
            Şehir seçin *
          </option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          name="tax_id"
          placeholder="Vergi / T.C. no (isteğe bağlı)"
          className="field"
        />
        <textarea
          name="note"
          rows={3}
          placeholder="Mekanınız hakkında kısa bilgi (isteğe bağlı)"
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
          className="mt-1 rounded-full bg-bordeaux py-3.5 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Gönderiliyor…" : "Başvuruyu Gönder"}
        </button>
      </form>
    </div>
  );
}
