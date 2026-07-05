"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { becomeOwner } from "@/app/actions/favorites";

export function BecomeOwnerButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await becomeOwner();
      if (result.ok) {
        router.push("/panel/mekan-ekle");
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="group inline-flex items-center gap-2 rounded-full bg-bordeaux py-3.5 pl-7 pr-2.5 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Hesabınız hazırlanıyor…" : "Mekan Sahibi Hesabına Geç"}
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-lux group-hover:translate-x-0.5">
        ↗
      </span>
    </button>
  );
}
