import { Stars } from "@/components/stars";
import { ReviewForm } from "@/components/review-form";
import { replyToReview, hideReview } from "@/app/actions/reviews";
import type { Review, Venue } from "@/lib/types";

function subAverage(reviews: Review[], key: keyof Review): number {
  const vals = reviews
    .map((r) => r[key] as number | null)
    .filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function ReviewsSection({
  venue,
  reviews,
  canManage,
}: {
  venue: Venue;
  reviews: Review[];
  canManage: boolean;
}) {
  const hasReviews = reviews.length > 0;
  const subs = [
    { label: "Kalite", value: subAverage(reviews, "rating_quality") },
    { label: "Personel", value: subAverage(reviews, "rating_staff") },
    {
      label: "İletişim",
      value: subAverage(reviews, "rating_communication"),
    },
  ].filter((s) => s.value > 0);

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="text-center">
            <p className="font-display text-5xl font-semibold text-ink">
              {hasReviews ? venue.rating_avg.toFixed(1) : "—"}
            </p>
            <Stars value={venue.rating_avg} size={16} />
            <p className="mt-1 text-xs text-mute">
              {venue.rating_count} değerlendirme
            </p>
          </div>
          {subs.length > 0 && (
            <div className="flex flex-col gap-1.5 border-l border-hairline pl-5">
              {subs.map((s) => (
                <div key={s.label} className="flex items-center gap-3 text-sm">
                  <span className="w-16 text-ink-soft">{s.label}</span>
                  <Stars value={s.value} size={12} />
                </div>
              ))}
            </div>
          )}
        </div>
        <ReviewForm venueId={venue.id} venueSlug={venue.slug} />
      </div>

      {hasReviews && (
        <div className="mt-8 flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-[1.5rem] border border-hairline bg-parchment p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">{review.author_name}</p>
                  <p className="text-xs text-mute">
                    {review.event_date
                      ? `${new Date(review.event_date).toLocaleDateString("tr-TR")} tarihli etkinlik`
                      : new Date(review.created_at).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <Stars value={review.rating} size={14} />
              </div>
              <p className="mt-3 leading-relaxed text-ink-soft">
                {review.comment}
              </p>

              {review.owner_reply && (
                <div className="mt-4 rounded-2xl bg-cream px-4 py-3">
                  <p className="text-xs font-medium text-bordeaux">
                    Mekan yanıtı
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {review.owner_reply}
                  </p>
                </div>
              )}

              {canManage && (
                <div className="mt-4 flex flex-col gap-2 border-t border-hairline pt-4">
                  <form action={replyToReview} className="flex gap-2">
                    <input type="hidden" name="review_id" value={review.id} />
                    <input type="hidden" name="venue_slug" value={venue.slug} />
                    <input
                      name="reply"
                      defaultValue={review.owner_reply ?? ""}
                      placeholder="Bu yoruma yanıt yazın…"
                      className="field flex-1"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-ink px-4 py-2 text-sm text-cream transition-colors hover:bg-ink-soft"
                    >
                      Yanıtla
                    </button>
                  </form>
                  <form action={hideReview}>
                    <input type="hidden" name="review_id" value={review.id} />
                    <input type="hidden" name="venue_slug" value={venue.slug} />
                    <button
                      type="submit"
                      className="text-xs text-mute underline-offset-2 hover:text-bordeaux hover:underline"
                    >
                      Yorumu gizle
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
