import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { VenueWizard } from "@/components/venue-wizard";
import { getSessionProfile } from "@/lib/auth";
import { getVenueForOwner } from "@/lib/panel-data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mekanı Düzenle",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVenuePage({ params }: PageProps) {
  if (!isSupabaseConfigured()) redirect("/panel");

  const session = await getSessionProfile();
  if (!session) redirect("/giris");

  const { id } = await params;
  const venue = await getVenueForOwner(id);
  if (!venue) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:pt-36">
      <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
        Düzenleme
      </span>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        {venue.name}
      </h1>

      <div className="mt-10">
        <VenueWizard venue={venue} />
      </div>
    </div>
  );
}
