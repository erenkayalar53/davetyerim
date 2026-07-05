"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favorites";

interface FavoriteButtonProps {
  venueId: string;
  initialFavorited: boolean;
  variant?: "card" | "detail";
}

export function FavoriteButton({
  venueId,
  initialFavorited,
  variant = "card",
}: FavoriteButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    const optimistic = !favorited;
    setFavorited(optimistic);

    startTransition(async () => {
      const result = await toggleFavorite(venueId);
      if (result.needsAuth) {
        setFavorited(false);
        router.push(`/giris?favori=${venueId}`);
        return;
      }
      if (!result.ok) {
        setFavorited(!optimistic);
        return;
      }
      setFavorited(result.favorited);
    });
  }

  if (variant === "detail") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={favorited}
        aria-label={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
        className={`flex items-center justify-center gap-2 rounded-full border py-3 text-sm font-medium transition-all duration-500 ease-lux active:scale-[0.97] ${
          favorited
            ? "border-bordeaux bg-blush text-bordeaux"
            : "border-hairline bg-parchment text-ink-soft hover:border-bordeaux/40 hover:text-bordeaux"
        }`}
      >
        <HeartIcon filled={favorited} />
        {favorited ? "Favorilerimde" : "Favorilere Ekle"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={favorited}
      aria-label={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
      className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-parchment/85 text-ink shadow-float backdrop-blur-sm transition-transform duration-500 ease-lux hover:scale-110 active:scale-95"
    >
      <HeartIcon filled={favorited} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "#7e2a3a" : "none"}
      stroke={filled ? "#7e2a3a" : "currentColor"}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors duration-300"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}
