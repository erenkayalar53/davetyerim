import { NextResponse, type NextRequest } from "next/server";
import { createOutreachAdminClient } from "@/lib/outreach/admin-client";
import { isOutreachConfigured } from "@/lib/outreach/config";
import { suppress } from "@/lib/outreach/pipeline";
import { verifyUnsubscribeToken } from "@/lib/outreach/unsubscribe";
import { SITE_NAME } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Listeden çıkma. GET tarayıcıdan tıklanınca, POST ise Gmail/Outlook'un
 * tek tıkla çıkarma (List-Unsubscribe-Post) akışında çağrılır.
 */
async function unsubscribe(token: string): Promise<{ ok: boolean; message: string }> {
  if (!token) return { ok: false, message: "Bağlantı geçersiz." };
  if (!isOutreachConfigured()) {
    return { ok: false, message: "Sistem şu anda yanıt veremiyor." };
  }

  let prospectId: string | null;
  try {
    prospectId = verifyUnsubscribeToken(token);
  } catch {
    return { ok: false, message: "Bağlantı doğrulanamadı." };
  }
  if (!prospectId) return { ok: false, message: "Bağlantı geçersiz veya süresi dolmuş." };

  const supabase = createOutreachAdminClient();

  const { data: prospect } = await supabase
    .from("outreach_prospects")
    .select("id, email")
    .eq("id", prospectId)
    .maybeSingle();

  if (!prospect) return { ok: false, message: "Kayıt bulunamadı." };

  if (prospect.email) await suppress(supabase, prospect.email, "unsubscribed");

  await supabase
    .from("outreach_prospects")
    .update({ status: "unsubscribed" })
    .eq("id", prospectId);

  // Onay bekleyen taslakları da iptal et
  await supabase
    .from("outreach_messages")
    .update({ status: "canceled", error: "abonelik-iptal" })
    .eq("prospect_id", prospectId)
    .in("status", ["draft", "approved"]);

  await supabase.from("outreach_events").insert({
    prospect_id: prospectId,
    type: "unsubscribed",
    payload: {},
  });

  return {
    ok: true,
    message: "Kaydınız silindi. Bu adrese bir daha ileti göndermeyeceğiz.",
  };
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t") ?? "";
  const result = await unsubscribe(token);

  return new NextResponse(page(result.ok, result.message), {
    status: result.ok ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t") ?? "";
  const result = await unsubscribe(token);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

function page(ok: boolean, message: string): string {
  const escaped = message.replace(/</g, "&lt;");
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>İleti Tercihi — ${SITE_NAME}</title>
  <style>
    body { margin:0; min-height:100vh; display:grid; place-items:center;
           background:#faf6f0; color:#2b2622; font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif; }
    .card { max-width:440px; padding:40px; text-align:center; }
    h1 { font-size:22px; margin:0 0 12px; }
    p { margin:0; line-height:1.6; color:#6b6259; }
    .mark { font-size:34px; margin-bottom:16px; color:${ok ? "#6b7f5e" : "#7b2d3b"}; }
  </style>
</head>
<body>
  <div class="card">
    <div class="mark">${ok ? "✓" : "!"}</div>
    <h1>${ok ? "İleti aboneliğiniz durduruldu" : "İşlem tamamlanamadı"}</h1>
    <p>${escaped}</p>
  </div>
</body>
</html>`;
}
