"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { signIn, signUp, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = { ok: null, message: "" };

export function AuthForm({ mode }: { mode: "giris" | "kayit" }) {
  const searchParams = useSearchParams();
  const action = mode === "giris" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [accountType, setAccountType] = useState<"user" | "owner">(
    searchParams.get("tip") === "mekan" ? "owner" : "user"
  );

  return (
    <div className="rounded-[1.75rem] border border-hairline bg-parchment p-1.5 shadow-lift">
      <form
        action={formAction}
        className="flex flex-col gap-3 rounded-[calc(1.75rem-0.375rem)] bg-cream p-7"
      >
        <h1 className="font-display text-2xl font-semibold text-ink">
          {mode === "giris" ? "Giriş Yap" : "Hesap Oluştur"}
        </h1>
        <p className="-mt-1 text-sm text-mute">
          {mode === "giris"
            ? "Favorilerine ve teklif isteklerine eriş."
            : "Mekan keşfet, favorile ya da mekanını platforma ekle."}
        </p>

        {mode === "kayit" && (
          <>
            <input type="hidden" name="account_type" value={accountType} />
            <div className="mt-1 grid grid-cols-2 gap-2 rounded-2xl bg-cream-deep/60 p-1">
              <button
                type="button"
                onClick={() => setAccountType("user")}
                className={`rounded-xl py-2.5 text-sm font-medium transition-colors duration-300 ${
                  accountType === "user"
                    ? "bg-parchment text-bordeaux shadow-float"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Bireysel
              </button>
              <button
                type="button"
                onClick={() => setAccountType("owner")}
                className={`rounded-xl py-2.5 text-sm font-medium transition-colors duration-300 ${
                  accountType === "owner"
                    ? "bg-parchment text-bordeaux shadow-float"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Mekan Sahibi
              </button>
            </div>
            <p className="-mt-1 text-xs leading-relaxed text-mute">
              {accountType === "user"
                ? "Mekanları favorileyin, teklif isteklerinizi takip edin."
                : "Mekanınızı ekleyin, gelen teklif isteklerini ve istatistikleri görün."}
            </p>

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

        {mode === "kayit" && (
          <p className="mt-1 text-center text-xs leading-relaxed text-mute">
            Hesap oluşturarak{" "}
            <Link
              href="/kullanim-kosullari"
              className="text-ink-soft underline decoration-hairline underline-offset-4 hover:text-bordeaux"
            >
              Kullanım Koşulları
            </Link>
            {"'nı ve "}
            <Link
              href="/gizlilik"
              className="text-ink-soft underline decoration-hairline underline-offset-4 hover:text-bordeaux"
            >
              Gizlilik Politikası
            </Link>
            {"'nı kabul etmiş olursunuz."}
          </p>
        )}

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
