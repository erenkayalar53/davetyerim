/**
 * next/image için blur placeholder.
 *
 * Fotoğraflar krem zemine sert biner; araya paletin içinden gelen yumuşak bir
 * geçiş koyunca yükleme "pat" diye değil, açılarak oluyor.
 *
 * Gerçek görselden türetilmiş bir blur hash yerine paletten sabit bir degrade
 * kullanıyoruz: her fotoğraf için ayrıca işlem gerektirmiyor ve marka
 * tonunun dışına çıkmıyor.
 */

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** Mekan fotoğrafları — sıcak krem/kum tonları. */
export const VENUE_BLUR = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6">
     <defs>
       <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0%" stop-color="#f2eadd"/>
         <stop offset="55%" stop-color="#e6dac9"/>
         <stop offset="100%" stop-color="#d8c9b5"/>
       </linearGradient>
     </defs>
     <rect width="8" height="6" fill="url(#g)"/>
   </svg>`
);

/** Koyu perde altına giren geniş görseller (hero, kategori kartları). */
export const DARK_BLUR = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6">
     <defs>
       <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%" stop-color="#5c4f43"/>
         <stop offset="100%" stop-color="#2b231b"/>
       </linearGradient>
     </defs>
     <rect width="8" height="6" fill="url(#g)"/>
   </svg>`
);
