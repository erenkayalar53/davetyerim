import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { BecomeOwnerButton } from "@/components/become-owner-button";
import { getSessionProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mekan Sahibi Ol",
  robots: { index: false },
};

const BENEFITS = [
  {
    title: "Ücretsiz listelenin",
    text: "Mekanınızı dakikalar içinde ekleyin, binlerce çift tarafından keşfedilin. Komisyon yok.",
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
  if (isSupabaseConfigured()) {
    const session = await getSessionProfile();
    if (!session) redirect("/kayit?tip=mekan");
    if (session.profile.role === "owner" || session.profile.role === "admin") {
      redirect("/panel");
    }
  }

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
          Hesabını mekan sahibi hesabına yükselt, mekanını ekle ve teklif
          isteklerini almaya başla. Bu işlem ücretsizdir ve saniyeler sürer.
        </p>
      </Reveal>

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

      <Reveal className="mt-12">
        <BecomeOwnerButton />
      </Reveal>
    </div>
  );
}
