"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitReview } from "@/app/actions/reviews";

function StarInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            aria-label={`${i} yıldız`}
            className="transition-transform duration-200 hover:scale-110"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18.9 6.1 21.5l1.2-6.5L2.5 9.4l6.6-.9z"
                fill={(hover || value) >= i ? "#a9853f" : "none"}
                stroke="#a9853f"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </span>
    </div>
  );
}

export function ReviewForm({
  venueId,
  venueSlug,
}: {
  venueId: string;
  venueSlug: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [quality, setQuality] = useState(0);
  const [staff, setStaff] = useState(0);
  const [comm, setComm] = useState(0);
  const [eventDate, setEventDate] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="rounded-[1.5rem] border border-hairline bg-cream p-6 text-center">
        <p className="font-display text-lg font-semibold text-ink">
          Yorumunuz için teşekkürler
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Değerlendirmeniz yayınlandı.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors duration-500 ease-lux hover:bg-ink-soft"
      >
        Değerlendirme Yaz
      </button>
    );
  }

  function submit() {
    setError("");
    if (rating < 1) {
      setError("Lütfen genel puan verin.");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Yorumunuz en az 10 karakter olmalı.");
      return;
    }
    startTransition(async () => {
      const result = await submitReview({
        venue_id: venueId,
        venue_slug: venueSlug,
        rating,
        rating_quality: quality || undefined,
        rating_staff: staff || undefined,
        rating_communication: comm || undefined,
        event_date: eventDate || undefined,
        comment,
      });
      if (result.needsAuth) {
        router.push(`/giris?yorum=${venueSlug}`);
        return;
      }
      if (result.ok) {
        setDone(true);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="rounded-[1.5rem] border border-hairline bg-cream p-6">
      <p className="font-display text-lg font-semibold text-ink">
        Deneyimini paylaş
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <StarInput label="Genel puan *" value={rating} onChange={setRating} />
        <div className="border-t border-hairline pt-3">
          <StarInput label="Kalite" value={quality} onChange={setQuality} />
          <StarInput label="Personel" value={staff} onChange={setStaff} />
          <StarInput label="İletişim" value={comm} onChange={setComm} />
        </div>
        <label className="text-sm text-ink-soft">
          Etkinlik tarihi (isteğe bağlı)
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="field mt-1"
          />
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Mekan, hizmet ve deneyiminiz hakkında yazın…"
          className="field resize-none"
        />
        {error && (
          <p className="rounded-2xl bg-bordeaux/10 px-4 py-3 text-sm text-bordeaux">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="rounded-full bg-bordeaux px-6 py-3 text-sm font-medium text-cream transition-all duration-500 ease-lux hover:bg-bordeaux-deep active:scale-[0.98] disabled:opacity-60"
          >
            {pending ? "Gönderiliyor…" : "Yorumu Gönder"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-hairline px-6 py-3 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
}
