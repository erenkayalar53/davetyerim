import { outreachConfig } from "./config";

/**
 * Resend REST API'sine doğrudan fetch ile gider — ek npm bağımlılığı yok.
 * https://resend.com/docs/api-reference/emails/send-email
 */
export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
  unsubscribeUrl: string;
}

export interface SendEmailResult {
  ok: boolean;
  id: string;
  error: string;
  /** true ise adres kalıcı olarak geçersiz — kara listeye alınmalı. */
  permanentFailure: boolean;
}

export function isResendConfigured(): boolean {
  return Boolean(outreachConfig.resendKey && outreachConfig.fromEmail);
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!isResendConfigured()) {
    return {
      ok: false,
      id: "",
      error: "RESEND_API_KEY veya OUTREACH_FROM_EMAIL eksik",
      permanentFailure: false,
    };
  }

  const from = outreachConfig.fromName
    ? `${outreachConfig.fromName} <${outreachConfig.fromEmail}>`
    : outreachConfig.fromEmail;

  const payload: Record<string, unknown> = {
    from,
    to: [input.to],
    subject: input.subject,
    text: input.text,
    html: input.html,
    // Tek tıkla listeden çıkma — Gmail/Outlook toplu gönderimde bunu şart koşuyor.
    headers: {
      "List-Unsubscribe": `<${input.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
  if (outreachConfig.replyTo) payload.reply_to = outreachConfig.replyTo;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${outreachConfig.resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      name?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        id: "",
        error: data.message ?? `Resend ${res.status}`,
        permanentFailure: res.status === 422 || data.name === "validation_error",
      };
    }

    return { ok: true, id: data.id ?? "", error: "", permanentFailure: false };
  } catch (err) {
    return {
      ok: false,
      id: "",
      error: err instanceof Error ? err.message : String(err),
      permanentFailure: false,
    };
  }
}
