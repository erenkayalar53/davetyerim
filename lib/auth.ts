import { createClient, isSupabaseConfigured } from "./supabase/server";
import type { Profile } from "./types";
import type { User } from "@supabase/supabase-js";

export async function getSessionProfile(): Promise<{
  user: User;
  profile: Profile;
} | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: (profile as Profile) ?? {
      id: user.id,
      full_name: "",
      phone: null,
      role: "user",
      owner_status: "none",
      business_name: null,
      business_phone: null,
      business_city: null,
      tax_id: null,
      application_note: null,
      verified: false,
      tax_document_path: null,
      license_document_path: null,
    },
  };
}
