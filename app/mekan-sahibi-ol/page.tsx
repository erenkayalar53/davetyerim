import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { OwnerApplicationForm } from "@/components/owner-application-form";
import { getSessionProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mekan Sahibi Ol",
  robots: { index: false },
};

const BENEFITS = [
  {
    title: "Ücretsiz listelenin",
    text: "Onaydan sonra mekanınızı dakikalar içinde ekleyin, binlerce çift tarafından keşfedilin. Komisyon yok.",
  },
  {
    title: "Teklif isteklerini toplayın",
    text: "İlgilenen çiftler doğrudan panelinize düşer; tarih ve davetli sayısıyla birlikte.",
  },
  {
    title: "Performansınızı görün",
    text: "Mekanınızın kaç kez görüntülendiğini ve kaç kişi tarafından favorilendiğini takip edin.",
  },
];

export default async function BecomeOwnerPage() {
  if (!isSupabaseConfigured()) {
    redirect("/kayit?tip=mekan");
  }

  const session = await getSessionProfile();
  if (!session) redirect("/kayit?tip=mekan");
  if (session.profile.role === "owner" || session.profile.role === "admin") {
    redirect("/panel");
  }

  const status = session.profile.owner_status;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:pt-40">
      <Reveal>
        <span className="rounded-full border border-hairline bg-parchment px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-mute">
          Mekan Sahibi Ol
        </span>
        <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Mekanını platforma taşı
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">
          İşletme bilgilerinizle başvurun; ekibimiz doğruladıktan sonra
          hesabınız mekan sahibi olarak aktifleşir ve mekanınızı
          ekleyebilirsiniz.
        </p>
      </Reveal>

      {status === "pending" ? (
        <Reveal className="mt-12">
          <div className="rounded-[1.75rem] border border-gold/30 bg-parchment p-8 text-center shadow-float">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-xl">
              ⏳
            </span>
            <p className="mt-4 font-display text-xl font-semibold text-ink">
              Başvurunuz inceleniyor
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
              <strong>{session.profile.business_name}</strong> için
              başvurunuz alındı. Ekibimiz en kısa sürede değerlendirip
              hesabınızı aktifleştirecek. Onaylandığında panelinizden
              mekanınızı ekleyebilirsiniz.
            </p>
          </div>
        </Reveal>
      ) : (
        <>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {BENEFITS.map((benefit, i) => (
              <Reveal key={benefit.title} delay={i * 100}>
                <div className="h-full rounded-[1.5rem] border border-hairline bg-parchment p-6">
                  <p className="font-display text-lg font-semibold text-ink">
                    {benefit.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {benefit.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {status === "rejected" && (
            <Reveal className="mt-8">
              <p className="rounded-2xl bg-bordeaux/10 px-5 py-4 text-sm text-bordeaux">
                Önceki başvurunuz onaylanmadı. Bilgilerinizi güncelleyip
                tekrar başvurabilirsiniz.
              </p>
            </Reveal>
          )}

          <Reveal className="mt-8">
            <OwnerApplicationForm
              defaultName={session.profile.business_name ?? ""}
              defaultPhone={
                session.profile.business_phone ?? session.profile.phone
              }
            />
          </Reveal>
        </>
      )}
    </div>
  );
}
