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
  price: number;
  includes_food: boolean;
  includes_alcohol: boolean;
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
  view_count: number;
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
