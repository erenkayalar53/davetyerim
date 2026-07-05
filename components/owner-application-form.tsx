"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { applyForOwner } from "@/app/actions/owner";
import { createClient } from "@/lib/supabase/client";
import { CITIES } from "@/lib/constants";

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function OwnerApplicationForm({
  defaultName,
  defaultPhone,
}: {
  defaultName?: string;
  defaultPhone?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    business_name: defaultName ?? "",
    business_phone: defaultPhone ?? "",
    business_city: "",
    tax_id: "",
    note: "",
  });
  const [taxDoc, setTaxDoc] = useState<File | null>(null);
  const [licenseDoc, setLicenseDoc] = useState<File | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadDoc(file: File, kind: string): Promise<string> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Oturum bulunamadı");
    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("owner-documents")
      .upload(path, file, { upsert: true });
    if (upErr) throw new Error(upErr.message);
    return path;
  }

  function submit() {
    setError("");
    if (form.business_name.trim().length < 2) {
      setError("İşletme adını girin.");
      return;
    }
    if (form.business_phone.replace(/\D/g, "").length < 10) {
      setError("Geçerli bir işletme telefonu girin.");
      return;
    }
    if (!form.business_city) {
      setError("Şehir seçin.");
      return;
    }

    startTransition(async () => {
      try {
        let taxPath = "";
        let licensePath = "";
        if (isSupabaseConfigured) {
          if (taxDoc) taxPath = await uploadDoc(taxDoc, "vergi-levhasi");
          if (licenseDoc) licensePath = await uploadDoc(licenseDoc, "ruhsat");
        }
        const result = await applyForOwner({
          business_name: form.business_name,
          business_phone: form.business_phone,
          business_city: form.business_city,
          tax_id: form.tax_id,
          note: form.note,
          tax_document_path: taxPath,
          license_document_path: licensePath,
        });
        if (result.ok) {
          router.refresh();
        } else {
          setError(result.message);
        }
      } catch {
        setError("Belge yüklenirken bir hata oluştu, tekrar deneyin.");
      }
    });
  }

  return (
    <div className="rounded-[1.75rem] border border-hairline bg-parchment p-1.5 shadow-lift">
      <div className="flex flex-col gap-3 rounded-[calc(1.75rem-0.375rem)] bg-cream p-7">
        <p className="font-display text-xl font-semibold text-ink">
          İşletme Başvurusu
        </p>
        <p className="-mt-1 text-sm text-mute">
          Bilgilerinizi ve belgelerinizi doğruladıktan sonra hesabınızı mekan
          sahibi olarak aktifleştiriyoruz. Bu, platformdaki mekan kalitesini ve
          ziyaretçi güvenini korur.
        </p>

        <input
          value={form.business_name}
          onChange={(e) => set("business_name", e.target.value)}
          placeholder="İşletme / Mekan adı *"
          className="field"
        />
        <input
          value={form.business_phone}
          onChange={(e) => set("business_phone", e.target.value)}
          type="tel"
          placeholder="İşletme telefonu *"
          className="field"
        />
        <select
          value={form.business_city}
          onChange={(e) => set("business_city", e.target.value)}
          className="field"
        >
          <option value="">Şehir seçin *</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={form.tax_id}
          onChange={(e) => set("tax_id", e.target.value)}
          placeholder="Vergi / T.C. no (isteğe bağlı)"
          className="field"
        />

        {/* Belgeler */}
        <div className="rounded-2xl border border-hairline bg-parchment p-4">
          <p className="text-sm font-medium text-ink">
            İşletme Belgeleri
            <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-[10px] font-medium text-bordeaux">
              Doğrulanmış rozeti için
            </span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-mute">
            Belgeleriniz gizli tutulur, yalnızca doğrulama ekibimiz görür.
            PDF veya fotoğraf yükleyebilirsiniz.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-ink-soft">
                Vergi Levhası
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setTaxDoc(e.target.files?.[0] ?? null)}
                className="field mt-1 cursor-pointer text-sm file:mr-3 file:rounded-full file:border-0 file:bg-blush file:px-3 file:py-1 file:text-xs file:text-bordeaux"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft">
                İşyeri Açma ve Çalışma Ruhsatı
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setLicenseDoc(e.target.files?.[0] ?? null)}
                className="field mt-1 cursor-pointer text-sm file:mr-3 file:rounded-full file:border-0 file:bg-blush file:px-3 file:py-1 file:text-xs file:text-bordeaux"
              />
            </div>
          </div>
        </div>

        <textarea
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          rows={3}
          placeholder="Mekanınız hakkında kısa bilgi (isteğe bağlı)"
          className="field resize-none"
        />

        {error && (
          <p className="rounded-2xl bg-bordeaux/10 px-4 py-3 text-sm text-bordeaux">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="mt-1 rounded-full bg-bordeaux py-3.5 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Gönderiliyor…" : "Başvuruyu Gönder"}
        </button>
      </div>
    </div>
  );
}
