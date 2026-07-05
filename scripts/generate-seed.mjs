// lib/seed-data.json içeriğinden supabase/seed.sql üretir.
// Çalıştırma: node scripts/generate-seed.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const venues = JSON.parse(
  readFileSync(join(root, "lib", "seed-data.json"), "utf8")
);

const esc = (s) => String(s).replace(/'/g, "''");
const arr = (a) => `array[${a.map((v) => `'${esc(v)}'`).join(", ")}]::text[]`;

let sql = `-- davetyerim.com örnek mekan verisi (otomatik üretildi)
-- migration.sql'den SONRA Supabase SQL Editor'de çalıştırın.
-- Not: owner_id null bırakılır; bu mekanlar platform tarafından eklenmiş sayılır.

`;

for (const v of venues) {
  sql += `with venue as (
  insert into public.venues
    (name, slug, description, city, district, address, phone, whatsapp,
     capacity_min, capacity_max, price_min, price_max, venue_type,
     categories, features, status, plan, featured)
  values
    ('${esc(v.name)}', '${esc(v.slug)}', '${esc(v.description)}', '${esc(v.city)}',
     '${esc(v.district)}', '${esc(v.address)}', '${esc(v.phone)}', '${esc(v.whatsapp)}',
     ${v.capacity_min}, ${v.capacity_max}, ${v.price_min}, ${v.price_max},
     '${esc(v.venue_type)}', ${arr(v.categories)}, ${arr(v.features)},
     'approved', '${esc(v.plan)}', ${v.featured})
  on conflict (slug) do nothing
  returning id
)
insert into public.venue_photos (venue_id, url, sort_order, is_cover)
select venue.id, photo.url, photo.ord, photo.ord = 0
from venue, (values
${v.photos.map((url, i) => `  ('${esc(url)}', ${i})`).join(",\n")}
) as photo(url, ord);

`;
}

writeFileSync(join(root, "supabase", "seed.sql"), sql, "utf8");
console.log(`supabase/seed.sql üretildi (${venues.length} mekan).`);
