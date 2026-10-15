import { NextResponse, type NextRequest } from "next/server";
import { outreachConfig, isOutreachConfigured } from "@/lib/outreach/config";
import { runOutreachCycle } from "@/lib/outreach/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Zamanlanmış outreach turu.
 *
 * Yetki: Vercel Cron `Authorization: Bearer $CRON_SECRET` gönderir.
 * Dış bir zamanlayıcı (cron-job.org vb.) kullanıyorsanız aynı başlığı
 * veya `?key=` parametresini geçirin.
 *
 * CRON_SECRET tanımlı değilse endpoint hiçbir şey yapmaz — açıkta
 * çalışan bir mail gönderme uç noktası bırakmamak için.
 */
export async function GET(request: NextRequest) {
  if (!outreachConfig.cronSecret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET tanımlı değil" },
      { status: 503 }
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const key = request.nextUrl.searchParams.get("key") ?? "";
  const authorized =
    header === `Bearer ${outreachConfig.cronSecret}` ||
    key === outreachConfig.cronSecret;

  if (!authorized) {
    return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
  }

  if (!isOutreachConfigured()) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY eksik" },
      { status: 503 }
    );
  }

  // ?steps=discover,enrich ile tek bir adımı elle çalıştırmak mümkün
  const stepsParam = request.nextUrl.searchParams.get("steps");
  const steps = stepsParam
    ? (stepsParam.split(",").filter((s) =>
        ["discover", "enrich", "draft", "send"].includes(s)
      ) as Array<"discover" | "enrich" | "draft" | "send">)
    : undefined;

  const stats = await runOutreachCycle(steps?.length ? { steps } : undefined);

  return NextResponse.json({ ok: true, stats });
}
