import { ImageResponse } from "next/og";
import { getVenueBySlug } from "@/lib/data";
import { venueTypeLabel, formatPrice } from "@/lib/constants";
import { OG, OG_SIZE, OG_CONTENT_TYPE, ogFonts, ogCharset } from "@/lib/og";

export const alt = "Mekan detayı";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);

  // Mekan bulunamazsa sade marka kartına düş — boş önizleme çıkmasın.
  if (!venue) {
    const fonts = await ogFonts(ogCharset("davetyerim"));
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: OG.cream,
            fontSize: 84,
            fontFamily: "Fraunces",
            color: OG.ink,
          }}
        >
          davet<span style={{ color: OG.bordeaux }}>yerim</span>
        </div>
      ),
      { ...size, fonts }
    );
  }

  // Satori AVIF/HEIC çözemez. Eski yüklemelerde bu formatlar var; onlarda
  // fotoğrafı hiç denemeyip bilinçli bir bordo zemine düşüyoruz — böylece
  // kart "bozuk" değil, sade görünür. Yeni yüklemeler JPEG olarak saklanıyor.
  const usable = venue.photos.filter((p) => !/\.(avif|heic|heif)(\?|$)/i.test(p.url));
  const cover = usable.find((p) => p.is_cover) ?? usable[0];
  const location = [venue.district, venue.city].filter(Boolean).join(", ");
  const capacity = `${venue.capacity_min}–${venue.capacity_max} kişi`;
  const price = `${formatPrice(venue.price_min)}–${formatPrice(venue.price_max)} ₺ / kişi`;
  const type = venueTypeLabel(
    venue.venue_types?.length ? venue.venue_types[0] : venue.venue_type
  );

  const fonts = await ogFonts(
    ogCharset(venue.name, location, capacity, price, type, "Doğrulanmış İşletme davetyerim.com")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: cover
            ? OG.ink
            : `linear-gradient(135deg, ${OG.bordeaux} 0%, #4a1622 55%, ${OG.ink} 100%)`,
        }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt=""
            width={OG_SIZE.width}
            height={OG_SIZE.height}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}

        {/* Metnin okunması için alttan koyulaşan perde */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(34,27,20,0.94) 8%, rgba(34,27,20,0.62) 42%, rgba(34,27,20,0.18) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                background: "rgba(250,246,239,0.16)",
                border: "1px solid rgba(250,246,239,0.3)",
                borderRadius: 999,
                padding: "8px 20px",
                fontSize: 20,
                color: OG.cream,
                fontFamily: "Jakarta",
              }}
            >
              {type}
            </div>
            {venue.verified && (
              <div
                style={{
                  background: "rgba(119,128,107,0.9)",
                  borderRadius: 999,
                  padding: "8px 20px",
                  fontSize: 20,
                  color: OG.cream,
                  fontFamily: "Jakarta",
                }}
              >
                Doğrulanmış İşletme
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: venue.name.length > 26 ? 62 : 78,
                lineHeight: 1.06,
                color: OG.cream,
                fontFamily: "Fraunces",
                letterSpacing: -1.5,
                maxWidth: 1000,
              }}
            >
              {venue.name}
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 28,
                color: "rgba(250,246,239,0.82)",
                fontFamily: "Jakarta",
              }}
            >
              {location}
            </div>

            <div
              style={{
                marginTop: 34,
                display: "flex",
                alignItems: "center",
                gap: 26,
                borderTop: "1px solid rgba(250,246,239,0.22)",
                paddingTop: 26,
              }}
            >
              <div style={{ fontSize: 25, color: OG.cream, fontFamily: "Jakarta" }}>
                {capacity}
              </div>
              <div style={{ fontSize: 25, color: "rgba(250,246,239,0.45)" }}>·</div>
              <div style={{ fontSize: 25, color: OG.cream, fontFamily: "Jakarta" }}>
                {price}
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: 21,
                  letterSpacing: 4,
                  color: "rgba(250,246,239,0.7)",
                  fontFamily: "Jakarta",
                }}
              >
                DAVETYERIM.COM
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
