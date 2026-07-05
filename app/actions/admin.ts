"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import type { VenuePlan, VenueStatus } from "@/lib/types";

async function requireAdmin() {
  if (!isSupabaseConfigured()) throw new Error("Supabase yapılandırılmadı");
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "admin") {
    throw new Error("Bu işlem için admin yetkisi gerekli");
  }
}

function revalidateVenuePages() {
  revalidatePath("/admin");
  revalidatePath("/mekanlar");
  revalidatePath("/");
}

export async function setVenueStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as VenueStatus;
  if (!["pending", "approved", "rejected"].includes(status)) return;

  const supabase = await createClient();
  await supabase.from("venues").update({ status }).eq("id", id);
  revalidateVenuePages();
}

export async function setVenuePlan(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const plan = String(formData.get("plan")) as VenuePlan;
  if (!["free", "premium"].includes(plan)) return;

  const supabase = await createClient();
  await supabase.from("venues").update({ plan }).eq("id", id);
  revalidateVenuePages();
}

export async function toggleVenueFeatured(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const featured = String(formData.get("featured")) === "true";

  const supabase = await createClient();
  await supabase.from("venues").update({ featured }).eq("id", id);
  revalidateVenuePages();
}
