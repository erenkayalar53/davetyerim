import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createOutreachAdminClient } from "@/lib/outreach/admin-client";
import { isOutreachConfigured, outreachConfig } from "@/lib/outreach/config";
import { suppress } from "@/lib/outreach/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resend webhook'u: teslim, açılma, bounce ve şikayet olaylarını işler.
 * Bounce ve şikayet gelen adresler kalıcı olarak kara listeye alınır —
 * gönderen itibarını koruyan en önemli mekanizma budur.
 *
 * Resend panelinde: Webhooks → Add Endpoint →
 *   https://davetyerim.com/api/outreach/webhook
 * Üretilen imza anahtarını RESEND_WEBHOOK_SECRET'a yazın.
 */
interface ResendEvent {
  type?: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
    subject?: string;
    bounce?: { type?: string };
  };
}

export async function POST(request: NextRequest) {
  const raw = await request.text();

  if (!verifySignature(request, raw)) {
    return NextResponse.json({ ok: false, error: "İmza doğrulanamadı" }, { status: 401 });
  }
  if (!isOutreachConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(raw) as ResendEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz gövde" }, { status: 400 });
  }

  const type = (event.type ?? "").replace(/^email\./, "");
  const providerId = event.data?.email_id ?? "";
  const to = Array.isArray(event.data?.to) ? event.data?.to[0] : event.data?.to;

  const supabase = createOutreachAdminClient();

  const { data: message } = providerId
    ? await supabase
        .from("outreach_messages")
        .select("id, prospect_id, to_email")
        .eq("provider_id", providerId)
        .maybeSingle()
    : { data: null };

  await supabase.from("outreach_events").insert({
    message_id: message?.id ?? null,
    prospect_id: message?.prospect_id ?? null,
    type,
    payload: event.data ?? {},
  });

  const email = message?.to_email ?? to ?? "";

  if (type === "bounced" && email) {
    await suppress(supabase, email, "bounced");
    if (message?.prospect_id) {
      await supabase
        .from("outreach_prospects")
        .update({ status: "bounced", last_error: event.data?.bounce?.type ?? "bounce" })
        .eq("id", message.prospect_id);
    }
  }

  if (type === "complained" && email) {
    await suppress(supabase, email, "complained");
    if (message?.prospect_id) {
      await supabase
        .from("outreach_prospects")
        .update({ status: "unsubscribed", last_error: "spam-sikayeti" })
        .eq("id", message.prospect_id);
    }
    // Bekleyen taslakları da iptal et
    if (message?.prospect_id) {
      await supabase
        .from("outreach_messages")
        .update({ status: "canceled", error: "spam-sikayeti" })
        .eq("prospect_id", message.prospect_id)
        .in("status", ["draft", "approved"]);
    }
  }

  return NextResponse.json({ ok: true });
}

/**
 * Svix imza doğrulaması (Resend bunu kullanır).
 * Anahtar tanımlı değilse webhook kapalıdır — imzasız gövde kabul edilmez.
 */
function verifySignature(request: NextRequest, body: string): boolean {
  const secret = outreachConfig.webhookSecret;
  if (!secret) return false;

  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signatureHeader = request.headers.get("svix-signature");
  if (!id || !timestamp || !signatureHeader) return false;

  // Tekrar saldırısına karşı 5 dakikalık pencere
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");

  return signatureHeader
    .split(" ")
    .filter((part) => part.startsWith("v1,"))
    .some((part) => {
      const provided = Buffer.from(part.slice(3));
      const target = Buffer.from(expected);
      return (
        provided.length === target.length && timingSafeEqual(provided, target)
      );
    });
}
