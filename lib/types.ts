export type VenueStatus = "pending" | "approved" | "rejected";
export type VenuePlan = "free" | "premium";
export type UserRole = "user" | "owner" | "admin";

export interface VenuePhoto {
  id: string;
  venue_id: string;
  url: string;
  sort_order: number;
  is_cover: boolean;
}

export interface MenuPackage {
  name: string;
  price: number; // geriye dönük uyumluluk (hafta içi baz)
  price_weekday?: number;
  price_weekend?: number;
  includes_food: boolean;
  includes_alcohol: boolean;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface CapacityArea {
  name: string;
  min: number;
  max: number;
}

export interface Campaign {
  title: string;
  text: string;
  discount_pct?: number;
  valid_until?: string;
  min_guests?: number;
}

export interface Review {
  id: string;
  venue_id: string;
  user_id: string | null;
  author_name: string;
  event_date: string | null;
  rating: number;
  rating_quality: number | null;
  rating_staff: number | null;
  rating_communication: number | null;
  comment: string;
  owner_reply: string | null;
  status: "pending" | "approved" | "hidden";
  created_at: string;
}

export interface Venue {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  description: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  whatsapp: string;
  capacity_min: number;
  capacity_max: number;
  price_min: number;
  price_max: number;
  venue_type: string;
  venue_types: string[];
  categories: string[];
  features: string[];
  menu_packages: MenuPackage[];
  faqs: FaqItem[];
  capacity_areas: CapacityArea[];
  campaign: Campaign | null;
  rating_avg: number;
  rating_count: number;
  view_count: number;
  /** Teklif taleplerine ortalama yanıt süresi (dakika). Ölçüm yoksa null. */
  avg_response_minutes: number | null;
  /** Ortalamanın kaç yanıta dayandığı — az örnekte rozet gösterilmez. */
  response_sample_count: number;
  status: VenueStatus;
  plan: VenuePlan;
  featured: boolean;
  verified: boolean;
  created_at: string;
  photos: VenuePhoto[];
}

export type LeadKind = "quote" | "callback";
export type LeadStatus = "new" | "responded" | "closed";

export interface Lead {
  id: string;
  venue_id: string;
  user_id: string | null;
  batch_id: string | null;
  kind: LeadKind;
  name: string;
  phone: string;
  email: string;
  event_date: string | null;
  guest_count: number | null;
  category: string;
  message: string;
  status: LeadStatus;
  responded_at: string | null;
  quoted_price: number | null;
  owner_note: string;
  created_at: string;
}

export type OwnerStatus = "none" | "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  owner_status: OwnerStatus;
  business_name: string | null;
  business_phone: string | null;
  business_city: string | null;
  tax_id: string | null;
  application_note: string | null;
  verified: boolean;
  tax_document_path: string | null;
  license_document_path: string | null;
  trade_registry_document_path: string | null;
  alcohol_license_document_path: string | null;
}

export interface VenueFilters {
  city?: string;
  /**
   * Etkinlik tarihi (YYYY-MM-DD). Mekan sahibinin dolu işaretlediği tarihler
   * üzerinden filtreler — o tarihi kapatmış mekanlar listeden çıkar.
   */
  date?: string;
  categories?: string[];
  venueTypes?: string[];
  capacityMin?: number;
  capacityMax?: number;
  capacityRanges?: string[];
  priceRanges?: string[];
  features?: string[];
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
  page?: number;
}
