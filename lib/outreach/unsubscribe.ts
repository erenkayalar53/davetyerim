import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/constants";
import { outreachConfig } from "./config";

/**
 * Abonelikten çıkma bağlantısı, prospect id'sinin HMAC ile imzalanmış hâlidir.
 * Böylece kimse başkasının adresini listeden düşüremez ve DB'de ayrı bir
 * token tablosu tutmak gerekmez.
 */
function secret(): string {
  const value = outreachConfig.unsubscribeSecret || outreachConfig.cronSecret;
  if (!value) {
    throw new Error(
      "OUTREACH_UNSUBSCRIBE_SECRET (veya CRON_SECRET) tanımlı olmalı"
    );
  }
  return value;
}

function sign(prospectId: string): string {
  return createHmac("sha256", secret())
    .update(prospectId)
    .digest("base64url")
    .slice(0, 32);
}

export function unsubscribeToken(prospectId: string): string {
  return `${prospectId}.${sign(prospectId)}`;
}

export function unsubscribeUrl(prospectId: string): string {
  return `${SITE_URL}/api/outreach/abonelik-iptal?t=${encodeURIComponent(
    unsubscribeToken(prospectId)
  )}`;
}

/** Geçerliyse prospect id'sini, değilse null döner. */
export function verifyUnsubscribeToken(token: string): string | null {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const prospectId = token.slice(0, separator);
  const provided = token.slice(separator + 1);
  const expected = sign(prospectId);

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;

  return timingSafeEqual(a, b) ? prospectId : null;
}
