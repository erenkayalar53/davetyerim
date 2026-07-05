"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface ReviewInput {
  venue_id: string;
  venue_slug: string;
  rating: number;
  rating_quality?: number;
  rating_staff?: number;
  rating_communication?: number;
  event_date?: string;
  comment: string;
}

export interface ReviewResult {
  ok: boolean;
  needsAuth?: boolean;
  message: string;
}

export async function submitReview(input: ReviewInput): Promise<ReviewResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Yorum için giriş yapmanız gerekir." };
  }
  if (!input.rating || input.rating < 1 || input.rating > 5) {
    return { ok: false, message: "Lütfen 1-5 arası puan verin." };
  }
  if (input.comment.trim().length < 10) {
    return { ok: false, message: "Yorumunuz en az 10 karakter olmalı." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, needsAuth: true, message: "" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const authorName =
    (profile?.full_name as string)?.trim() ||
    user.email?.split("@")[0] ||
    "Kullanıcı";

  const { error } = await supabase.from("reviews").insert({
    venue_id: input.venue_id,
    user_id: user.id,
    author_name: authorName,
    rating: input.rating,
    rating_quality: input.rating_quality ?? null,
    rating_staff: input.rating_staff ?? null,
    rating_communication: input.rating_communication ?? null,
    event_date: input.event_date || null,
    comment: input.comment.trim(),
  });

  if (error) {
    return { ok: false, message: "Yorum gönderilemedi, tekrar deneyin." };
  }

  revalidatePath(`/mekan/${input.venue_slug}`);
  return { ok: true, message: "Yorumunuz için teşekkürler!" };
}

export async function replyToReview(formData: FormData) {
  if (!isSupabaseConfigured()) return;
  const reviewId = String(formData.get("review_id"));
  const slug = String(formData.get("venue_slug"));
  const reply = String(formData.get("reply") ?? "").trim();
  const supabase = await createClient();
  await supabase
    .from("reviews")
    .update({ owner_reply: reply || null })
    .eq("id", reviewId);
  revalidatePath(`/mekan/${slug}`);
}

export async function hideReview(formData: FormData) {
  if (!isSupabaseConfigured()) return;
  const reviewId = String(formData.get("review_id"));
  const slug = String(formData.get("venue_slug"));
  const supabase = await createClient();
  await supabase.from("reviews").update({ status: "hidden" }).eq("id", reviewId);
  revalidatePath(`/mekan/${slug}`);
}
