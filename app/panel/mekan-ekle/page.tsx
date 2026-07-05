import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VenueWizard } from "@/components/venue-wizard";
import { getSessionProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mekan Ekle — Ücretsiz Kayıt",
  robots: { index: false },
};

export default async function AddVenuePage() {
  if (isSupabaseConfigured()) {
    const session = await getSessionProfile();
    if (!session) redirect("/kayit?tip=mekan");
    if (session.profile.role === "user") redirect("/mekan-sahibi-ol");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:pt-36">
      <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
        Ücretsiz Mekan Kaydı
      </span>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Mekanını Ekle
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
        Bilgileri doldurun, fotoğraflarınızı yükleyin. Ekibimiz onayladıktan
        sonra mekanınız yayına girer ve teklif istekleri panelinize düşer.
      </p>

      <div className="mt-10">
        <VenueWizard />
      </div>
    </div>
  );
}
