import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service role istemcisi — RLS'i baypas eder.
 * SADECE cron ve sunucu tarafı outreach işleri için. Asla client'a sızmamalı;
 * "server-only" importu bunu derleme zamanında garanti eder.
 */
let cached: SupabaseClient | null = null;

export function createOutreachAdminClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Outreach için NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli"
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
