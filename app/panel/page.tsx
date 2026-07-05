import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  getMyVenues,
  getMyLeads,
  getVenueFavoriteCounts,
} from "@/lib/panel-data";
import { signOut } from "@/app/actions/auth";
import {
  categoryLabel,
  venueTypeLabel,
  formatPrice,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mekan Paneli",
  robots: { index: false },
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Onay Bekliyor", className: "bg-gold/15 text-gold" },
  approved: { label: "Yayında", className: "bg-sage/15 text-sage" },
  rejected: { label: "Reddedildi", className: "bg-bordeaux/10 text-bordeaux" },
};

interface PageProps {
  searchParams: Promise<{ mesaj?: string }>;
}

export default async function PanelPage({ searchParams }: PageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-36">
        <div className="rounded-[1.75rem] border border-hairline bg-parchment p-10 text-center shadow-float">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Demo Modu
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Mekan sahibi paneli için Supabase bağlantısı gerekiyor. Ücretsiz
            bir Supabase projesi oluşturun, <code>supabase/migration.sql</code>{" "}
            dosyasını SQL Editor&apos;de çalıştırın ve proje anahtarlarınızı{" "}
            <code>.env.local</code> dosyasına ekleyin. Detaylar README&apos;de.
          </p>
        </div>
      </div>
    );
  }

  const session = await getSessionProfile();
  if (!session) redirect("/giris");
  if (session.profile.role === "user") redirect("/mekan-sahibi-ol");

  const [venues, leads, sp] = await Promise.all([
    getMyVenues(),
    getMyLeads(),
    searchParams,
  ]);
  const favoriteCounts = await getVenueFavoriteCounts(venues.map((v) => v.id));
  const totalViews = venues.reduce((sum, v) => sum + v.view_count, 0);
  const totalFavorites = Object.values(favoriteCounts).reduce(
    (sum, c) => sum + c,
    0
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:pt-36">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
            Mekan Sahibi Paneli
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Hoş geldiniz{session.profile.full_name ? `, ${session.profile.full_name}` : ""}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {session.profile.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-full border border-hairline bg-parchment px-5 py-2.5 text-sm text-ink-soft transition-colors hover:text-bordeaux"
            >
              Admin Paneli
            </Link>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-hairline bg-parchment px-5 py-2.5 text-sm text-ink-soft transition-colors hover:text-bordeaux"
            >
              Çıkış Yap
            </button>
          </form>
        </div>
      </div>

      {sp.mesaj && (
        <p className="mt-6 rounded-2xl bg-sage/10 px-5 py-4 text-sm text-sage">
          {sp.mesaj}
        </p>
      )}

      {/* Özet istatistikler */}
      {venues.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Mekan", value: venues.length },
            { label: "Toplam Görüntülenme", value: totalViews },
            { label: "Toplam Favori", value: totalFavorites },
            { label: "Teklif İsteği", value: leads.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-hairline bg-parchment px-5 py-4"
            >
              <p className="font-display text-3xl font-semibold text-bordeaux">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-mute">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Mekanlarım */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Mekanlarım ({venues.length})
          </h2>
          <Link
            href="/panel/mekan-ekle"
            className="group flex items-center gap-2 rounded-full bg-bordeaux py-2.5 pl-5 pr-2 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep"
          >
            Yeni Mekan Ekle
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
              +
            </span>
          </Link>
        </div>

        {venues.length === 0 ? (
          <div className="mt-6 rounded-[1.75rem] border border-dashed border-mute/40 bg-parchment/60 p-12 text-center">
            <p className="font-display text-xl font-semibold text-ink">
              Henüz mekan eklemediniz
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              İlk mekanınızı ekleyin — onaylandığında binlerce çift tarafından
              görülecek.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            {venues.map((venue) => {
              const status = STATUS_LABELS[venue.status];
              const cover = venue.photos[0];
              return (
                <div
                  key={venue.id}
                  className="flex flex-col gap-4 rounded-[1.75rem] border border-hairline bg-parchment p-4 shadow-float sm:flex-row sm:items-center"
                >
                  <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-2xl bg-cream-deep sm:w-36">
                    {cover && (
                      <Image
                        src={cover.url}
                        alt={venue.name}
                        fill
                        sizes="144px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold text-ink">
                        {venue.name}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                      {venue.plan === "premium" && (
                        <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cream">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-mute">
                      {venueTypeLabel(venue.venue_type)} · {venue.district},{" "}
                      {venue.city} · {venue.capacity_min}-{venue.capacity_max}{" "}
                      kişi · {formatPrice(venue.price_min)}-
                      {formatPrice(venue.price_max)} ₺/kişi
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-cream-deep/70 px-3 py-1 text-xs text-ink-soft">
                        👁 {venue.view_count} görüntülenme
                      </span>
                      <span className="rounded-full bg-cream-deep/70 px-3 py-1 text-xs text-ink-soft">
                        ♥ {favoriteCounts[venue.id] ?? 0} favori
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {venue.status === "approved" && (
                      <Link
                        href={`/mekan/${venue.slug}`}
                        className="rounded-full border border-hairline px-4 py-2 text-sm text-ink-soft transition-colors hover:text-bordeaux"
                      >
                        Görüntüle
                      </Link>
                    )}
                    <Link
                      href={`/panel/mekan/${venue.id}`}
                      className="rounded-full bg-ink px-4 py-2 text-sm text-cream transition-colors hover:bg-ink-soft"
                    >
                      Düzenle
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Teklif İstekleri */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Teklif İstekleri ({leads.length})
        </h2>
        {leads.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            Henüz teklif isteği yok. Mekanınız yayına girdiğinde istekler
            burada görünecek.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-[1.75rem] border border-hairline bg-parchment shadow-float">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-[10px] uppercase tracking-[0.15em] text-mute">
                  <th className="px-5 py-4 font-medium">Tarih</th>
                  <th className="px-5 py-4 font-medium">Mekan</th>
                  <th className="px-5 py-4 font-medium">İsim</th>
                  <th className="px-5 py-4 font-medium">Telefon</th>
                  <th className="px-5 py-4 font-medium">Etkinlik</th>
                  <th className="px-5 py-4 font-medium">Davetli</th>
                  <th className="px-5 py-4 font-medium">Mesaj</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-hairline last:border-0">
                    <td className="px-5 py-4 text-mute">
                      {new Date(lead.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-5 py-4">{lead.venue?.name ?? "—"}</td>
                    <td className="px-5 py-4 font-medium text-ink">{lead.name}</td>
                    <td className="px-5 py-4">
                      <a href={`tel:${lead.phone}`} className="text-bordeaux hover:underline">
                        {lead.phone}
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      {lead.category ? categoryLabel(lead.category) : "—"}
                      {lead.event_date
                        ? ` · ${new Date(lead.event_date).toLocaleDateString("tr-TR")}`
                        : ""}
                    </td>
                    <td className="px-5 py-4">{lead.guest_count ?? "—"}</td>
                    <td className="max-w-48 truncate px-5 py-4 text-ink-soft">
                      {lead.message || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
