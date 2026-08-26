import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { VenueWizard } from "@/components/venue-wizard";
import { AvailabilityManager } from "@/components/availability-manager";
import { getSessionProfile } from "@/lib/auth";
import { getVenueForOwner } from "@/lib/panel-data";
import { getVenueUnavailableDates } from "@/lib/data";
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

  const unavailableDates = await getVenueUnavailableDates(id);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:pt-36">
      <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
        Düzenleme
      </span>
      <h1 className="mt-4 font-display text-fluid-title font-semibold text-ink">
        {venue.name}
      </h1>

      <div className="mt-10">
        <VenueWizard venue={venue} />
      </div>

      <div className="mt-12 rounded-[1.75rem] border border-hairline bg-parchment p-6 shadow-float sm:p-8">
        <h2 className="font-display text-xl font-semibold text-ink">
          Müsaitlik Takvimi
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Dolu olan tarihleri işaretleyin; ziyaretçiler bu takvimi mekan
          sayfanızda görür.
        </p>
        <div className="mt-5">
          <AvailabilityManager
            venueId={id}
            initialUnavailableDates={unavailableDates}
          />
        </div>
      </div>
    </div>
  );
}
