import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { VenueCard } from "@/components/venue-card";
import { getSessionProfile } from "@/lib/auth";
import { getFavoriteVenues } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Favori Mekanlarım",
  robots: { index: false },
};

export default async function FavoritesPage() {
  if (!isSupabaseConfigured()) redirect("/mekanlar");

  const session = await getSessionProfile();
  if (!session) redirect("/giris");

  const venues = await getFavoriteVenues();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:pt-36">
      <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
        Favorilerim
      </span>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Beğendiğin mekanlar
      </h1>

      {venues.length === 0 ? (
        <div className="mt-10 rounded-[1.75rem] border border-dashed border-mute/40 bg-parchment/60 p-12 text-center">
          <p className="font-display text-xl font-semibold text-ink">
            Henüz favori mekanın yok
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Mekanları gezerken kalp ikonuna dokunarak buraya
            kaydedebilirsin.
          </p>
          <Link
            href="/mekanlar"
            className="mt-6 inline-flex rounded-full bg-bordeaux px-6 py-3 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-bordeaux-deep"
          >
            Mekanları Keşfet
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} favorited />
          ))}
        </div>
      )}
    </div>
  );
}
