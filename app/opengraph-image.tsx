import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION } from "@/lib/constants";
import { OG, OG_SIZE, OG_CONTENT_TYPE, ogFonts, ogCharset } from "@/lib/og";

export const alt = "Davet Yerim — Düğün, Nişan ve Davet Mekanları";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const TAGLINE = "Düğün, nişan, kına ve kurumsal davet mekanları";

export default async function Image() {
  const fonts = await ogFonts(ogCharset(TAGLINE, SITE_DESCRIPTION, "davetyerim.com"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: OG.cream,
          padding: 72,
          position: "relative",
        }}
      >
        {/* Bordo köşe aksanı */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: OG.blush,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: OG.bordeaux,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: OG.cream,
              fontSize: 36,
              fontFamily: "Fraunces",
            }}
          >
            d
          </div>
          <div style={{ fontSize: 15, letterSpacing: 6, color: OG.mute, fontFamily: "Jakarta" }}>
            DAVETYERIM.COM
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              lineHeight: 1.04,
              color: OG.ink,
              fontFamily: "Fraunces",
              letterSpacing: -2,
              display: "flex",
            }}
          >
            davet<span style={{ color: OG.bordeaux }}>yerim</span>
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 31,
              lineHeight: 1.35,
              color: OG.inkSoft,
              fontFamily: "Jakarta",
              maxWidth: 820,
            }}
          >
            {TAGLINE}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            borderTop: `1px solid ${OG.creamDeep}`,
            paddingTop: 28,
          }}
        >
          {["Komisyon yok", "Doğrulanmış işletmeler", "Ücretsiz teklif"].map((t) => (
            <div
              key={t}
              style={{
                background: OG.parchment,
                border: `1px solid ${OG.creamDeep}`,
                borderRadius: 999,
                padding: "10px 22px",
                fontSize: 21,
                color: OG.inkSoft,
                fontFamily: "Jakarta",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
