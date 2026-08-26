"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { IconArrowUpRight } from "@/components/icons";
import type { UserRole, OwnerStatus } from "@/lib/types";

const NAV_LINKS = [
  { href: "/mekanlar", label: "Mekanlar" },
  { href: "/fiyatlandirma", label: "Mekan Sahipleri" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

interface HeaderProps {
  isLoggedIn: boolean;
  role: UserRole | null;
  ownerStatus: OwnerStatus | null;
}

export function Header({ isLoggedIn, role, ownerStatus }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isOwner = role === "owner" || role === "admin";
  const isPending = ownerStatus === "pending";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-6 pointer-events-none">
        <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-hairline bg-parchment/80 py-2 pl-6 pr-2 shadow-float backdrop-blur-xl">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-ink"
          >
            davet<span className="text-bordeaux">yerim</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm transition-colors duration-500 ease-lux ${
                  pathname === link.href
                    ? "bg-blush text-bordeaux"
                    : "text-ink-soft hover:bg-cream-deep hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!isLoggedIn && (
              <>
                <Link
                  href="/giris"
                  className="hidden rounded-full px-4 py-2 text-sm text-ink-soft transition-colors duration-500 ease-lux hover:text-ink sm:block"
                >
                  Giriş
                </Link>
                <Link
                  href="/kayit?tip=mekan"
                  className="group hidden items-center gap-2 rounded-full bg-bordeaux py-2 pl-5 pr-2 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.98] sm:flex"
                >
                  Mekanını Ekle
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-lux group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                    <IconArrowUpRight size={14} strokeWidth={2.2} />
                  </span>
                </Link>
              </>
            )}

            {isLoggedIn && (
              <>
                <Link
                  href="/favorilerim"
                  className="hidden rounded-full px-4 py-2 text-sm text-ink-soft transition-colors duration-500 ease-lux hover:text-ink sm:block"
                >
                  Favorilerim
                </Link>
                {isOwner ? (
                  <Link
                    href="/panel"
                    className="hidden rounded-full bg-ink py-2 px-5 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-ink-soft active:scale-[0.98] sm:block"
                  >
                    Panelim
                  </Link>
                ) : isPending ? (
                  <Link
                    href="/mekan-sahibi-ol"
                    className="hidden rounded-full border border-gold/40 bg-gold/10 py-2 px-5 text-sm font-medium text-gold transition-colors duration-500 ease-lux sm:block"
                  >
                    Başvuru İnceleniyor
                  </Link>
                ) : (
                  <Link
                    href="/mekan-sahibi-ol"
                    className="hidden rounded-full bg-bordeaux py-2 px-5 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.98] sm:block"
                  >
                    Mekan Sahibi Ol
                  </Link>
                )}
              </>
            )}

            <button
              type="button"
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-cream-deep md:hidden"
            >
              <span
                className={`absolute h-px w-5 bg-ink transition-transform duration-500 ease-lux ${
                  open ? "rotate-45" : "-translate-y-1"
                }`}
              />
              <span
                className={`absolute h-px w-5 bg-ink transition-transform duration-500 ease-lux ${
                  open ? "-rotate-45" : "translate-y-1"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobil tam ekran menü */}
      <div
        className={`fixed inset-0 z-40 flex flex-col justify-center bg-cream/90 px-8 backdrop-blur-2xl transition-opacity duration-700 ease-lux md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-2">
          {[
            { href: "/", label: "Ana Sayfa" },
            ...NAV_LINKS,
            ...(isLoggedIn ? [{ href: "/favorilerim", label: "Favorilerim" }] : []),
          ].map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-display text-4xl font-medium text-ink transition-all duration-700 ease-lux ${
                open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${100 + i * 60}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div
          className={`mt-10 flex flex-col gap-3 transition-all duration-700 ease-lux ${
            open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
          style={{ transitionDelay: open ? "460ms" : "0ms" }}
        >
          {!isLoggedIn && (
            <>
              <Link
                href="/kayit?tip=mekan"
                className="rounded-full bg-bordeaux px-6 py-4 text-center font-medium text-cream"
              >
                Mekanını Ücretsiz Ekle
              </Link>
              <Link
                href="/giris"
                className="rounded-full border border-hairline bg-parchment px-6 py-4 text-center text-ink"
              >
                Giriş Yap
              </Link>
            </>
          )}
          {isLoggedIn && isOwner && (
            <Link
              href="/panel"
              className="rounded-full bg-ink px-6 py-4 text-center font-medium text-cream"
            >
              Panelim
            </Link>
          )}
          {isLoggedIn && !isOwner && (
            <Link
              href="/mekan-sahibi-ol"
              className={`rounded-full px-6 py-4 text-center font-medium ${
                isPending
                  ? "border border-gold/40 bg-gold/10 text-gold"
                  : "bg-bordeaux text-cream"
              }`}
            >
              {isPending ? "Başvuru İnceleniyor" : "Mekan Sahibi Ol"}
            </Link>
          )}
          {isLoggedIn && (
            <form action={signOut}>
              <button
                type="submit"
                className="w-full rounded-full border border-hairline bg-parchment px-6 py-4 text-center text-ink"
              >
                Çıkış Yap
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
