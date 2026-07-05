"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = { ok: null, message: "" };

export function AuthForm({ mode }: { mode: "giris" | "kayit" }) {
  const action = mode === "giris" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="rounded-[1.75rem] border border-hairline bg-parchment p-1.5 shadow-lift">
      <form
        action={formAction}
        className="flex flex-col gap-3 rounded-[calc(1.75rem-0.375rem)] bg-cream p-7"
      >
        <h1 className="font-display text-2xl font-semibold text-ink">
          {mode === "giris" ? "Mekan Sahibi Girişi" : "Mekan Sahibi Kaydı"}
        </h1>
        <p className="-mt-1 text-sm text-mute">
          {mode === "giris"
            ? "Panelinize erişin, teklif isteklerinizi görün."
            : "Ücretsiz hesap oluşturun, mekanınızı dakikalar içinde ekleyin."}
        </p>

        {mode === "kayit" && (
          <>
            <input
              name="full_name"
              placeholder="Adınız Soyadınız *"
              required
              className="field"
            />
            <input
              name="phone"
              type="tel"
              placeholder="Telefon numaranız"
              className="field"
            />
          </>
        )}

        <input
          name="email"
          type="email"
          placeholder="E-posta adresiniz *"
          required
          className="field"
        />
        <input
          name="password"
          type="password"
          placeholder={mode === "kayit" ? "Şifre (en az 8 karakter) *" : "Şifreniz *"}
          required
          minLength={mode === "kayit" ? 8 : undefined}
          className="field"
        />

        {state.message && (
          <p
            className={`rounded-2xl px-4 py-3 text-sm ${
              state.ok
                ? "bg-sage/10 text-sage"
                : "bg-bordeaux/10 text-bordeaux"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 rounded-full bg-bordeaux py-3.5 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.98] disabled:opacity-60"
        >
          {pending
            ? "İşleniyor…"
            : mode === "giris"
              ? "Giriş Yap"
              : "Hesap Oluştur"}
        </button>

        <p className="mt-2 text-center text-sm text-ink-soft">
          {mode === "giris" ? (
            <>
              Hesabınız yok mu?{" "}
              <Link href="/kayit" className="font-medium text-bordeaux hover:underline">
                Ücretsiz kayıt olun
              </Link>
            </>
          ) : (
            <>
              Zaten hesabınız var mı?{" "}
              <Link href="/giris" className="font-medium text-bordeaux hover:underline">
                Giriş yapın
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
