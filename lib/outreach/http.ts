import { outreachConfig } from "./config";

/**
 * Dış siteleri çekerken kullanılan güvenli fetch:
 * zaman aşımlı, boyut sınırlı, kendini tanıtan ve asla exception atmayan.
 */
export interface FetchResult {
  ok: boolean;
  status: number;
  url: string;
  html: string;
  error?: string;
}

const MAX_BYTES = 1_500_000; // 1.5 MB — devasa sayfalarda takılıp kalmayalım

export async function fetchPage(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), outreachConfig.fetchTimeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": outreachConfig.userAgent,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "tr,en;q=0.8",
      },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("xml")) {
      return { ok: false, status: res.status, url, html: "", error: "html-degil" };
    }

    const length = Number(res.headers.get("content-length") ?? 0);
    if (length > MAX_BYTES) {
      return { ok: false, status: res.status, url, html: "", error: "cok-buyuk" };
    }

    const html = (await res.text()).slice(0, MAX_BYTES);
    return { ok: res.ok, status: res.status, url: res.url || url, html };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      status: 0,
      url,
      html: "",
      error: message.includes("abort") ? "zaman-asimi" : message,
    };
  } finally {
    clearTimeout(timer);
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Verilen süre bütçesi dolduğunda true döner — cron'un zamanında bitmesi için. */
export function budget(totalMs: number) {
  const started = Date.now();
  return {
    exhausted: () => Date.now() - started > totalMs,
    elapsed: () => Date.now() - started,
  };
}
