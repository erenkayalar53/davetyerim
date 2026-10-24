import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  setVenueStatus,
  setVenuePlan,
  toggleVenueFeatured,
} from "@/app/actions/admin";
import { approveOwner, rejectOwner } from "@/app/actions/owner";
import { venueTypeLabel, formatPrice } from "@/lib/constants";
import { OWNER_DOC_KINDS } from "@/lib/owner-docs";
import type { Venue, VenuePhoto, Profile } from "@/lib/types";
import {
  IconArrowUpRight,
  IconCheck,
  IconDocument,
  IconStarFilled,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Admin Paneli",
  robots: { index: false },
};

type VenueRow = Omit<Venue, "photos"> & { photos: VenuePhoto[] | null };

interface OwnerInquiry {
  id: string;
  venue_name: string;
  contact_name: string;
  phone: string;
  email: string;
  city: string;
  venue_type: string;
  message: string;
  created_at: string;
}

export default async function AdminPage() {
  if (!isSupabaseConfigured()) redirect("/panel");

  const session = await getSessionProfile();
  if (!session) redirect("/giris");
  if (session.profile.role !== "admin") redirect("/panel");

  const supabase = await createClient();
  const [
    { data: venueData },
    { count: leadCount },
    { data: applicationData },
    { data: inquiryData },
  ] = await Promise.all([
    supabase
      .from("venues")
      .select("*, photos:venue_photos(*)")
      .order("created_at", { ascending: false }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*")
      .eq("owner_status", "pending")
      .order("id", { ascending: true }),
    supabase
      .from("owner_inquiries")
      .select("*")
      .eq("status", "new")
      .order("created_at", { ascending: false }),
  ]);

  const applications = (applicationData as Profile[]) ?? [];
  const inquiries = (inquiryData as OwnerInquiry[]) ?? [];

  // Belgeler için kısa ömürlü imzalı bağlantılar üret (özel bucket).
  // Belge türleri tek listeden besleniyor: yeni bir belge eklendiğinde
  // hem bağlantı üretimi hem ekrandaki rozetler kendiliğinden güncellenir.
  const docLinks: Record<string, Record<string, string>> = {};
  for (const app of applications) {
    const links: Record<string, string> = {};
    for (const kind of OWNER_DOC_KINDS) {
      const path = app[kind.column];
      if (!path) continue;
      const { data } = await supabase.storage
        .from("owner-documents")
        .createSignedUrl(path, 3600);
      if (data?.signedUrl) links[kind.column] = data.signedUrl;
    }
    docLinks[app.id] = links;
  }

  const venues = ((venueData as VenueRow[]) ?? []).map((v) => ({
    ...v,
    photos: v.photos ?? [],
  }));
  const pending = venues.filter((v) => v.status === "pending");
  const approved = venues.filter((v) => v.status === "approved");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:pt-36">
      <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
        Yönetim
      </span>
      <h1 className="mt-4 font-display text-fluid-title font-semibold text-ink">
        Admin Paneli
      </h1>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/admin/outreach"
          className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-parchment px-4 py-2 text-sm text-ink-soft transition-colors duration-500 ease-lux hover:border-bordeaux/40 hover:text-bordeaux"
        >
          Mekan Erişim Otomasyonu
          <IconArrowUpRight size={12} />
        </Link>
      </div>

      {/* Özet */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Toplam Mekan", value: venues.length },
          { label: "Bekleyen Mekan", value: pending.length },
          { label: "Bekleyen Başvuru", value: applications.length },
          { label: "Teklif İsteği", value: leadCount ?? 0 },
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

      {/* Firmalar İçin formundan gelen başvurular */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Firma Başvuruları ({inquiries.length})
        </h2>
        {inquiries.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            Yeni firma başvurusu yok.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="rounded-[1.5rem] border border-hairline bg-parchment p-5 shadow-float"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-lg font-semibold text-ink">
                    {inquiry.venue_name}
                    {inquiry.venue_type && (
                      <span className="ml-2 text-sm font-normal text-mute">
                        {venueTypeLabel(inquiry.venue_type)}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-mute">
                    {new Date(inquiry.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  {inquiry.contact_name}
                  {inquiry.city && ` · ${inquiry.city}`}
                </p>
                {inquiry.message && (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                    {inquiry.message}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`tel:${inquiry.phone.replace(/\s/g, "")}`}
                    className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-ink-soft"
                  >
                    {inquiry.phone}
                  </a>
                  {inquiry.email && (
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="rounded-full border border-hairline px-4 py-2 text-sm text-ink-soft transition-colors duration-500 ease-lux hover:text-bordeaux"
                    >
                      {inquiry.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mekan sahibi başvuruları */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Mekan Sahibi Başvuruları ({applications.length})
        </h2>
        {applications.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            Bekleyen işletme başvurusu yok.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex flex-col gap-4 rounded-[1.75rem] border border-gold/30 bg-parchment p-5 shadow-float lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {app.business_name ?? "İsimsiz işletme"}
                  </h3>
                  <p className="mt-1 text-sm text-mute">
                    Yetkili: {app.full_name || "—"} · Tel:{" "}
                    {app.business_phone ?? app.phone ?? "—"} ·{" "}
                    {app.business_city ?? "—"}
                    {app.tax_id ? ` · Vergi/TC: ${app.tax_id}` : ""}
                  </p>
                  {app.application_note && (
                    <p className="mt-2 text-sm text-ink-soft">
                      “{app.application_note}”
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {OWNER_DOC_KINDS.map((kind) => {
                      const url = docLinks[app.id]?.[kind.column];
                      if (url) {
                        return (
                          <a
                            key={kind.column}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-sage/40 bg-sage/10 px-3 py-1 text-xs font-medium text-sage"
                          >
                            <IconDocument size={13} />
                            {kind.label}
                          </a>
                        );
                      }
                      // İsteğe bağlı belgenin yokluğu eksiklik değil: yalnızca
                      // zorunlu belgeler için "yok" uyarısı gösteriliyor.
                      if (!kind.required) return null;
                      return (
                        <span
                          key={kind.column}
                          className="rounded-full border border-hairline px-3 py-1 text-xs text-mute"
                        >
                          {kind.label} yok
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={approveOwner}>
                    <input type="hidden" name="user_id" value={app.id} />
                    <button
                      type="submit"
                      className="rounded-full bg-sage px-5 py-2.5 text-sm font-medium text-cream transition-opacity hover:opacity-90"
                    >
                      Onayla
                    </button>
                  </form>
                  <form action={rejectOwner}>
                    <input type="hidden" name="user_id" value={app.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-bordeaux/30 px-5 py-2.5 text-sm font-medium text-bordeaux transition-colors hover:bg-bordeaux/5"
                    >
                      Reddet
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Onay kuyruğu */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Mekan Onay Kuyruğu ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            Bekleyen mekan yok — kuyruk temiz.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            {pending.map((venue) => (
              <div
                key={venue.id}
                className="flex flex-col gap-4 rounded-[1.75rem] border border-gold/30 bg-parchment p-4 shadow-float lg:flex-row lg:items-center"
              >
                <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-2xl bg-cream-deep lg:w-36">
                  {venue.photos[0] && (
                    <Image
                      src={venue.photos[0].url}
                      alt={venue.name}
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {venue.name}
                  </h3>
                  <p className="mt-1 text-sm text-mute">
                    {venueTypeLabel(venue.venue_type)} · {venue.district},{" "}
                    {venue.city} · {venue.capacity_min}-{venue.capacity_max}{" "}
                    kişi · {formatPrice(venue.price_min)}-
                    {formatPrice(venue.price_max)} ₺/kişi · Tel: {venue.phone}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
                    {venue.description}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/admin/onizleme/${venue.id}`}
                    className="rounded-full border border-hairline px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-bordeaux/40 hover:text-bordeaux"
                  >
                    İncele
                  </Link>
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
            ))}
          </div>
        )}
      </section>

      {/* Tüm mekanlar */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Tüm Mekanlar
        </h2>
        <div className="mt-6 overflow-x-auto rounded-[1.75rem] border border-hairline bg-parchment shadow-float">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-[10px] uppercase tracking-[0.15em] text-mute">
                <th className="px-5 py-4 font-medium">Mekan</th>
                <th className="px-5 py-4 font-medium">Şehir</th>
                <th className="px-5 py-4 font-medium">Durum</th>
                <th className="px-5 py-4 font-medium">Plan</th>
                <th className="px-5 py-4 font-medium">Vitrin</th>
                <th className="px-5 py-4 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((venue) => (
                <tr key={venue.id} className="border-b border-hairline last:border-0">
                  <td className="px-5 py-4">
                    <span className="font-medium text-ink">{venue.name}</span>
                    {venue.status === "approved" && (
                      <Link
                        href={`/mekan/${venue.slug}`}
                        className="ml-2 inline-flex items-center gap-1 text-xs text-bordeaux hover:underline"
                      >
                        gör
                        <IconArrowUpRight size={11} />
                      </Link>
                    )}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{venue.city}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        venue.status === "approved"
                          ? "bg-sage/15 text-sage"
                          : venue.status === "pending"
                            ? "bg-gold/15 text-gold"
                            : "bg-bordeaux/10 text-bordeaux"
                      }`}
                    >
                      {venue.status === "approved"
                        ? "Yayında"
                        : venue.status === "pending"
                          ? "Bekliyor"
                          : "Reddedildi"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <form action={setVenuePlan} className="inline">
                      <input type="hidden" name="id" value={venue.id} />
                      <input
                        type="hidden"
                        name="plan"
                        value={venue.plan === "premium" ? "free" : "premium"}
                      />
                      <button
                        type="submit"
                        title="Planı değiştir"
                        className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                          venue.plan === "premium"
                            ? "bg-ink text-cream"
                            : "border border-hairline text-mute hover:text-ink"
                        }`}
                      >
                        {venue.plan === "premium" ? (
                          <span className="inline-flex items-center gap-1">
                            Premium
                            <IconCheck size={11} strokeWidth={3} />
                          </span>
                        ) : (
                          "Free"
                        )}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-4">
                    <form action={toggleVenueFeatured} className="inline">
                      <input type="hidden" name="id" value={venue.id} />
                      <input
                        type="hidden"
                        name="featured"
                        value={venue.featured ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        title="Vitrini değiştir"
                        className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                          venue.featured
                            ? "bg-gold/20 text-gold"
                            : "border border-hairline text-mute hover:text-ink"
                        }`}
                      >
                        {venue.featured ? (
                          <span className="inline-flex items-center gap-1">
                            Vitrinde
                            <IconStarFilled size={11} />
                          </span>
                        ) : (
                          "Vitrine Al"
                        )}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-4">
                    {venue.status !== "pending" && (
                      <form action={setVenueStatus} className="inline">
                        <input type="hidden" name="id" value={venue.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={
                            venue.status === "approved" ? "rejected" : "approved"
                          }
                        />
                        <button
                          type="submit"
                          className="text-xs text-mute underline-offset-2 hover:text-bordeaux hover:underline"
                        >
                          {venue.status === "approved"
                            ? "Yayından kaldır"
                            : "Yayına al"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
