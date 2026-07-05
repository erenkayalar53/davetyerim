import seedData from "./seed-data.json";
import type { Venue, VenuePlan } from "./types";

interface SeedVenue {
  name: string;
  slug: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  whatsapp: string;
  description: string;
  capacity_min: number;
  capacity_max: number;
  price_min: number;
  price_max: number;
  venue_type: string;
  categories: string[];
  features: string[];
  plan: string;
  featured: boolean;
  photos: string[];
}

export const MOCK_VENUES: Venue[] = (seedData as SeedVenue[]).map(
  (v, i): Venue => ({
    id: `mock-${i + 1}`,
    owner_id: null,
    name: v.name,
    slug: v.slug,
    description: v.description,
    city: v.city,
    district: v.district,
    address: v.address,
    phone: v.phone,
    whatsapp: v.whatsapp,
    capacity_min: v.capacity_min,
    capacity_max: v.capacity_max,
    price_min: v.price_min,
    price_max: v.price_max,
    venue_type: v.venue_type,
    categories: v.categories,
    features: v.features,
    status: "approved",
    plan: v.plan as VenuePlan,
    featured: v.featured,
    created_at: new Date(Date.UTC(2026, 5, 1 + i)).toISOString(),
    photos: v.photos.map((url, j) => ({
      id: `mock-${i + 1}-photo-${j + 1}`,
      venue_id: `mock-${i + 1}`,
      url,
      sort_order: j,
      is_cover: j === 0,
    })),
  })
);
