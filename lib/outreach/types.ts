export type ProspectStatus =
  | "new"
  | "ready"
  | "no_email"
  | "drafted"
  | "contacted"
  | "replied"
  | "converted"
  | "bounced"
  | "unsubscribed"
  | "skipped";

export type MessageStatus =
  | "draft"
  | "approved"
  | "sending"
  | "sent"
  | "failed"
  | "canceled";

export type ProspectSource = "google_places" | "csv" | "directory" | "manual";

export type EmailSource = "mailto" | "page_text" | "source" | "manual" | "";

export interface Prospect {
  id: string;
  source: ProspectSource;
  source_ref: string;
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  email_source: EmailSource;
  email_confidence: number;
  rating: number | null;
  rating_count: number | null;
  dedupe_key: string;
  status: ProspectStatus;
  last_error: string;
  notes: string;
  contact_count: number;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutreachMessage {
  id: string;
  prospect_id: string;
  template_key: string;
  step: number;
  to_email: string;
  subject: string;
  body_text: string;
  body_html: string;
  status: MessageStatus;
  approved_by: string | null;
  approved_at: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  provider_id: string;
  error: string;
  created_at: string;
}

/** Bir kaynağın döndürdüğü ham aday — henüz normalize edilmemiş. */
export interface RawProspect {
  source: ProspectSource;
  source_ref?: string;
  name: string;
  city?: string;
  district?: string;
  address?: string;
  phone?: string;
  website?: string;
  /** Kaynak e-postayı zaten veriyorsa (CSV gibi) doğrudan buraya. */
  email?: string;
  rating?: number | null;
  rating_count?: number | null;
}

export interface RunStats {
  discovered: number;
  enriched: number;
  emailsFound: number;
  drafted: number;
  sent: number;
  failed: number;
  skipped: number;
  notes: string[];
}
