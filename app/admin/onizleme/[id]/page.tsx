import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { getVenueByIdForPreview } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { setVenueStatus } from "@/app/actions/admin";
import {
  categoryLabel,
  featureLabel,
  venueTypeLabel,
  formatPrice,
} from "@/lib/constants";
import { IconCheck, IconChevronLeft } from "@/components/icons";

export const metadata: Metadata = {
  title: "Mekan Önizleme",
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VenuePreviewPage({ params }: PageProps) {
  if (!isSupabaseConfigured()) redirect("/admin");

  const session = await getSessionProfile();
  if (!session) redirect("/giris");
  if (session.profile.role !== "admin") redirect("/panel");

  const { id } = await params;
  const venue = await getVenueByIdForPreview(id);
  if (!venue) notFound();

  const venueTypes = venue.venue_types?.length
    ? venue.venue_types
    : [venue.venue_type];

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-32 sm:pt-36">
      {/* Admin denetim çubuğu */}
      <div className="sticky top-24 z-30 mb-8 flex flex-col gap-3 rounded-[1.5rem] border border-gold/30 bg-parchment/90 p-4 shadow-lift backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-bordeaux"
          >
            <IconChevronLeft size={14} />
            Admin
          </Link>
          <span className="text-sm text-mute">
            Önizleme —{" "}
            <span className="font-medium text-ink">
              {venue.status === "pending"
                ? "Onay Bekliyor"
                : venue.status === "approved"
                  ? "Yayında"
                  : "Reddedildi"}
            </span>
          </span>
        </div>
        <div className="flex gap-2">
          <form action={setVenueStatus}>
            <input type="hidden" name="id" value={venue.id} />
            <input type="hidden" name="status" value="approved" />
            <button
              type="submit"
              className="rounded-full bg-sage px-5 py-2.5 text-sm font-medium text-cream transition-opacity hover:opacity-90"
            >
              Onayla
            </button>
          </form>
          <form action={setVenueStatus}>
            <input type="hidden" name="id" value={venue.id} />
            <input type="hidden" name="status" value="rejected" />
            <button
              type="submit"
              className="rounded-full border border-bordeaux/30 px-5 py-2.5 text-sm font-medium text-bordeaux transition-colors hover:bg-bordeaux/5"
            >
              Reddet
            </button>
          </form>
        </div>
      </div>

      {/* Başlık */}
      <div className="flex flex-wrap items-center gap-2">
        {venueTypes.map((t) => (
          <span
            key={t}
            className="rounded-full bg-blush px-3 py-1 text-xs font-medium text-bordeaux"
          >
            {venueTypeLabel(t)}
          </span>
        ))}
      </div>
      <h1 className="mt-4 font-display text-fluid-title font-semibold text-ink">
        {venue.name}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        {venue.district ? `${venue.district}, ` : ""}
        {venue.city} · {venue.capacity_min}-{venue.capacity_max} kişi · Tel:{" "}
        {venue.phone}
        {venue.whatsapp ? ` · WhatsApp: ${venue.whatsapp}` : ""}
      </p>

      {/* Fotoğraflar */}
      {venue.photos.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {venue.photos.map((photo, i) => (
            <div
              key={photo.id}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-hairline bg-cream-deep"
            >
              <Image
                src={photo.url}
                alt={`${venue.name} ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Açıklama */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ink">Açıklama</h2>
        <p className="mt-3 leading-relaxed text-ink-soft">{venue.description}</p>
      </div>

      {/* Fiyat paketleri */}
      {venue.menu_packages.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold text-ink">
            Fiyat Paketleri
          </h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-hairline">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream-deep/60 text-[10px] uppercase tracking-[0.15em] text-mute">
                <tr>
                  <th className="px-5 py-3 font-medium">Paket</th>
                  <th className="px-4 py-3 text-center font-medium">Yemek</th>
                  <th className="px-4 py-3 text-center font-medium">Alkol</th>
                  <th className="px-5 py-3 text-right font-medium">Kişi Başı</th>
                </tr>
              </thead>
              <tbody className="bg-parchment">
                {venue.menu_packages.map((pkg, i) => (
                  <tr key={i} className="border-t border-hairline first:border-0">
                    <td className="px-5 py-3.5 font-medium text-ink">{pkg.name}</td>
                    <td className="px-4 py-3.5 text-center">
                      {pkg.includes_food ? (
                        <IconCheck size={15} className="mx-auto text-sage" strokeWidth={2.4} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {pkg.includes_alcohol ? (
                        <IconCheck size={15} className="mx-auto text-sage" strokeWidth={2.4} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-bordeaux">
                      {formatPrice(pkg.price)} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Etkinlikler & özellikler */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Uygun Etkinlikler
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {venue.categories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-hairline bg-parchment px-3 py-1.5 text-sm text-ink-soft"
              >
                {categoryLabel(cat)}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Özellikler
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {venue.features.map((f) => (
              <span
                key={f}
                className="rounded-full border border-hairline bg-parchment px-3 py-1.5 text-sm text-ink-soft"
              >
                {featureLabel(f)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {venue.address && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold text-ink">Adres</h2>
          <p className="mt-2 text-sm text-ink-soft">{venue.address}</p>
        </div>
      )}
    </div>
  );
}
