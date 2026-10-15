import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AvailabilityManager } from "@/components/availability-manager";
import { IconChevronLeft } from "@/components/icons";
import { getSessionProfile } from "@/lib/auth";
import { getVenueForOwner } from "@/lib/panel-data";
import { getVenueUnavailableDates } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Müsaitlik Takvimi",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AvailabilityPage({ params }: PageProps) {
  if (!isSupabaseConfigured()) redirect("/panel");

  const session = await getSessionProfile();
  if (!session) redirect("/giris");

  const { id } = await params;
  const venue = await getVenueForOwner(id);
  if (!venue) notFound();

  const unavailableDates = await getVenueUnavailableDates(id);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:pt-36">
      <Link
        href="/panel"
        className="inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-bordeaux"
      >
        <IconChevronLeft size={14} />
        Panelim
      </Link>

      <span className="mt-6 inline-block rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
        Müsaitlik
      </span>
      <h1 className="mt-4 font-display text-fluid-title font-semibold text-ink">
        {venue.name}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Dolu olan tarihleri işaretleyin. Ziyaretçiler bu takvimi mekan
        sayfanızda görür ve dolu tarihlere teklif isteği gönderemez.
      </p>

      <div className="mt-8 rounded-[1.75rem] border border-hairline bg-parchment p-6 shadow-float sm:p-8">
        <AvailabilityManager
          venueId={id}
          initialUnavailableDates={unavailableDates}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/panel/mekan/${id}`}
          className="rounded-full border border-hairline bg-parchment px-5 py-2.5 text-sm text-ink-soft transition-colors hover:text-bordeaux"
        >
          Mekan Bilgilerini Düzenle
        </Link>
        {venue.status === "approved" && (
          <Link
            href={`/mekan/${venue.slug}`}
            className="rounded-full border border-hairline bg-parchment px-5 py-2.5 text-sm text-ink-soft transition-colors hover:text-bordeaux"
          >
            Mekan Sayfasını Gör
          </Link>
        )}
      </div>
    </div>
  );
}
