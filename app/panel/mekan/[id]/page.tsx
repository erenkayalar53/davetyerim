import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { VenueWizard } from "@/components/venue-wizard";
import { IconCalendar } from "@/components/icons";
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
          Takvim kendi sayfasında yönetiliyor: tarihe tıkladığınız anda
          kaydedilir, bu formu doldurmanız gerekmez.
          {unavailableDates.length > 0
            ? ` Şu an ${unavailableDates.length} tarih dolu işaretli.`
            : " Şu an dolu işaretli tarih yok."}
        </p>
        <Link
          href={`/panel/mekan/${id}/musaitlik`}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-ink-soft"
        >
          <IconCalendar size={15} strokeWidth={1.8} />
          Takvimi Yönet
        </Link>
      </div>
    </div>
  );
}
