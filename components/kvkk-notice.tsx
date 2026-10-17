import Link from "next/link";

/**
 * Veri toplama anında gösterilen kısa aydınlatma atfı.
 *
 * 6698 sayılı KVKK'nın 10. maddesi, veri sorumlusunun aydınlatma
 * yükümlülüğünü verilerin elde edildiği sırada yerine getirmesini öngörür.
 * Aydınlatma metninin sitede bir yerde bulunması tek başına yeterli
 * değildir; formun yanında erişilebilir olması gerekir.
 */
export function KvkkNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-xs leading-relaxed text-mute ${className}`}>
      Formu göndererek bilgilerinizin{" "}
      <Link
        href="/gizlilik"
        className="underline decoration-hairline underline-offset-4 transition-colors hover:text-bordeaux"
      >
        KVKK Aydınlatma Metni
      </Link>{" "}
      kapsamında işlenmesini kabul etmiş olursunuz.
    </p>
  );
}
