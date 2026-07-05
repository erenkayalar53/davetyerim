export type VenueStatus = "pending" | "approved" | "rejected";
export type VenuePlan = "free" | "premium";
export type UserRole = "owner" | "admin";

export interface VenuePhoto {
  id: string;
  venue_id: string;
  url: string;
  sort_order: number;
  is_cover: boolean;
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
  categories: string[];
  features: string[];
  status: VenueStatus;
  plan: VenuePlan;
  featured: boolean;
  created_at: string;
  photos: VenuePhoto[];
}

export interface Lead {
  id: string;
  venue_id: string;
  name: string;
  phone: string;
  email: string;
  event_date: string | null;
  guest_count: number | null;
  category: string;
  message: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
}

export interface VenueFilters {
  city?: string;
  category?: string;
  venueType?: string;
  capacityMin?: number;
  capacityMax?: number;
  priceMin?: number;
  priceMax?: number;
  features?: string[];
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
  page?: number;
}
