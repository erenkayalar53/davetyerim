import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  // content/ altındaki rehber yazıları fs ile okunuyor; deploy paketine dahil et.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  async redirects() {
    return [
      // Fiyat sayfası kaldırıldı; mekan sahipleri artık form üzerinden ulaşıyor.
      { source: "/fiyatlandirma", destination: "/firmalar-icin", permanent: true },
    ];
  },
};

export default nextConfig;
