"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveVenue, type VenueInput } from "@/app/actions/venues";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORIES,
  VENUE_TYPES,
  FEATURES,
  CITIES,
} from "@/lib/constants";
import type { Venue } from "@/lib/types";

const STEPS = ["Bilgiler", "Konum", "Kapasite & Fiyat", "Özellikler", "Fotoğraflar"];

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

interface WizardState {
  name: string;
  venue_type: string;
  description: string;
  categories: string[];
  city: string;
  district: string;
  address: string;
  phone: string;
  whatsapp: string;
  capacity_min: string;
  capacity_max: string;
  price_min: string;
  price_max: string;
  features: string[];
}

function fromVenue(venue?: Venue): WizardState {
  return {
    name: venue?.name ?? "",
    venue_type: venue?.venue_type ?? "",
    description: venue?.description ?? "",
    categories: venue?.categories ?? [],
    city: venue?.city ?? "",
    district: venue?.district ?? "",
    address: venue?.address ?? "",
    phone: venue?.phone ?? "",
    whatsapp: venue?.whatsapp ?? "",
    capacity_min: venue ? String(venue.capacity_min) : "",
    capacity_max: venue ? String(venue.capacity_max) : "",
    price_min: venue ? String(venue.price_min) : "",
    price_max: venue ? String(venue.price_max) : "",
    features: venue?.features ?? [],
  };
}

export function VenueWizard({ venue }: { venue?: Venue }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardState>(() => fromVenue(venue));
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function set<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleInList(key: "categories" | "features", value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  }

  function validateStep(): string {
    switch (step) {
      case 0:
        if (form.name.trim().length < 3) return "Mekan adı en az 3 karakter olmalı.";
        if (!form.venue_type) return "Mekan tipi seçin.";
        if (form.categories.length === 0) return "En az bir etkinlik türü seçin.";
        if (form.description.trim().length < 30)
          return "Açıklama en az 30 karakter olmalı — mekanınızı tanıtın.";
        return "";
      case 1:
        if (!form.city) return "Şehir seçin.";
        if (!form.district.trim()) return "İlçe girin.";
        return "";
      case 2: {
        const capMin = Number(form.capacity_min);
        const capMax = Number(form.capacity_max);
        const priceMin = Number(form.price_min);
        const priceMax = Number(form.price_max);
        if (!capMin || !capMax || capMax < capMin)
          return "Geçerli bir kapasite aralığı girin.";
        if (!priceMin || !priceMax || priceMax < priceMin)
          return "Geçerli bir kişi başı fiyat aralığı girin.";
        if (form.phone.replace(/\D/g, "").length < 10)
          return "Geçerli bir telefon numarası girin.";
        return "";
      }
      default:
        return "";
    }
  }

  function next() {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function uploadPhotos(): Promise<string[]> {
    if (files.length === 0 || !isSupabaseConfigured) return [];
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum bulunamadı");

    const urls: string[] = [];
    for (const [i, file] of files.entries()) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}-${i}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("venue-photos")
        .upload(path, file, { cacheControl: "31536000" });
      if (uploadError) throw new Error(uploadError.message);
      const { data } = supabase.storage.from("venue-photos").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  function submit() {
    setError("");
    startTransition(async () => {
      try {
        const photoUrls = await uploadPhotos();
        const input: VenueInput = {
          id: venue?.id,
          name: form.name,
          description: form.description,
          city: form.city,
          district: form.district,
          address: form.address,
          phone: form.phone,
          whatsapp: form.whatsapp,
          capacity_min: Number(form.capacity_min),
          capacity_max: Number(form.capacity_max),
          price_min: Number(form.price_min),
          price_max: Number(form.price_max),
          venue_type: form.venue_type,
          categories: form.categories,
          features: form.features,
          photo_urls: photoUrls,
        };
        const result = await saveVenue(input);
        if (result.ok) {
          router.push(`/panel?mesaj=${encodeURIComponent(result.message)}`);
        } else {
          setError(result.message);
        }
      } catch {
        setError("Fotoğraf yüklenirken bir hata oluştu, tekrar deneyin.");
      }
    });
  }

  const chip = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm transition-colors duration-300 ease-lux ${
      active
        ? "bg-bordeaux text-cream"
        : "border border-hairline bg-parchment text-ink-soft hover:border-bordeaux/40 hover:text-bordeaux"
    }`;

  return (
    <div className="rounded-[1.75rem] border border-hairline bg-parchment p-1.5 shadow-lift">
      <div className="rounded-[calc(1.75rem-0.375rem)] bg-cream p-6 sm:p-8">
        {/* Adım göstergesi */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => i < step && setStep(i)}
              className="group flex-1"
              aria-label={`Adım ${i + 1}: ${label}`}
            >
              <span
                className={`block h-1 rounded-full transition-colors duration-500 ${
                  i <= step ? "bg-bordeaux" : "bg-cream-deep"
                }`}
              />
              <span
                className={`mt-2 hidden text-[10px] uppercase tracking-wider sm:block ${
                  i === step ? "text-bordeaux" : "text-mute"
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 min-h-72">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-ink">Mekan Adı *</label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Örn: Vadi Kır Bahçesi"
                  className="field mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Mekan Tipi *</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {VENUE_TYPES.map((t) => (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => set("venue_type", t.slug)}
                      className={chip(form.venue_type === t.slug)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-ink">
                  Hangi etkinliklere uygun? *
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => toggleInList("categories", c.slug)}
                      className={chip(form.categories.includes(c.slug))}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Açıklama *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={4}
                  placeholder="Mekanınızı tanıtın: atmosferi, manzarası, sunduğunuz hizmetler…"
                  className="field mt-1.5 resize-none"
                />
                <p className="mt-1 text-xs text-mute">
                  {form.description.trim().length}/30 karakter (min)
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-ink">Şehir *</label>
                <select
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="field mt-1.5"
                >
                  <option value="">Şehir seçin</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-ink">İlçe *</label>
                <input
                  value={form.district}
                  onChange={(e) => set("district", e.target.value)}
                  placeholder="Örn: Beykoz"
                  className="field mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Açık Adres</label>
                <textarea
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  rows={2}
                  placeholder="Mahalle, cadde, numara…"
                  className="field mt-1.5 resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-medium text-ink">
                  Davetli Kapasitesi *
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={1}
                    value={form.capacity_min}
                    onChange={(e) => set("capacity_min", e.target.value)}
                    placeholder="En az (kişi)"
                    className="field"
                  />
                  <input
                    type="number"
                    min={1}
                    value={form.capacity_max}
                    onChange={(e) => set("capacity_max", e.target.value)}
                    placeholder="En fazla (kişi)"
                    className="field"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-ink">
                  Kişi Başı Fiyat (₺) *
                </label>
                <p className="text-xs text-mute">
                  Menü ve sezona göre değişen aralığınızı girin — çiftler
                  filtrelemede bunu kullanır.
                </p>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={1}
                    value={form.price_min}
                    onChange={(e) => set("price_min", e.target.value)}
                    placeholder="En düşük ₺"
                    className="field"
                  />
                  <input
                    type="number"
                    min={1}
                    value={form.price_max}
                    onChange={(e) => set("price_max", e.target.value)}
                    placeholder="En yüksek ₺"
                    className="field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-ink">Telefon *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="0xxx xxx xx xx"
                    className="field mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">WhatsApp</label>
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    placeholder="0xxx xxx xx xx"
                    className="field mt-1.5"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="text-sm font-medium text-ink">
                Mekanınızda hangi özellikler var?
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {FEATURES.map((f) => (
                  <button
                    key={f.slug}
                    type="button"
                    onClick={() => toggleInList("features", f.slug)}
                    className={chip(form.features.includes(f.slug))}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4">
              {venue && venue.photos.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-ink">Mevcut fotoğraflar</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {venue.photos.map((p) => (
                      <div
                        key={p.id}
                        className="relative h-20 w-28 overflow-hidden rounded-xl"
                      >
                        <Image src={p.url} alt="" fill sizes="112px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-ink">
                  {venue ? "Yeni fotoğraf ekle" : "Mekan fotoğrafları"}
                </label>
                <p className="text-xs text-mute">
                  Yatay, yüksek çözünürlüklü fotoğraflar en iyi sonucu verir.
                  İlk fotoğraf kapak olur.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  className="field mt-2 cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-blush file:px-4 file:py-1.5 file:text-sm file:text-bordeaux"
                />
                {files.length > 0 && (
                  <p className="mt-2 text-xs text-sage">
                    {files.length} fotoğraf seçildi
                  </p>
                )}
              </div>
              {!isSupabaseConfigured && (
                <p className="rounded-2xl bg-gold/10 px-4 py-3 text-xs leading-relaxed text-ink-soft">
                  Demo modu: Supabase bağlantısı olmadan kayıt tamamlanamaz.
                  Kurulum için README&apos;deki adımları izleyin.
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-2xl bg-bordeaux/10 px-4 py-3 text-sm text-bordeaux">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-full border border-hairline px-6 py-3 text-sm text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
          >
            Geri
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="rounded-full bg-ink px-8 py-3 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-ink-soft active:scale-[0.98]"
            >
              Devam Et
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="rounded-full bg-bordeaux px-8 py-3 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.98] disabled:opacity-60"
            >
              {pending
                ? "Kaydediliyor…"
                : venue
                  ? "Değişiklikleri Kaydet"
                  : "Mekanı Gönder"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
