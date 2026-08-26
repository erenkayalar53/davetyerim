import sharp from "sharp";
import fs from "node:fs";

const svg = fs.readFileSync("app/icon.svg");

// ICO icine gomulecek boyutlar
const sizes = [16, 32, 48];
const pngs = [];
for (const s of sizes) {
  pngs.push({ size: s, buf: await sharp(svg).resize(s, s).png().toBuffer() });
}

// ICO konteyneri: 6 byte baslik + her goruntu icin 16 byte dizin girisi + PNG verileri
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);            // reserved
header.writeUInt16LE(1, 2);            // type = ICO
header.writeUInt16LE(pngs.length, 4);  // goruntu sayisi

let offset = 6 + pngs.length * 16;
const entries = [];
for (const { size, buf } of pngs) {
  const e = Buffer.alloc(16);
  e.writeUInt8(size === 256 ? 0 : size, 0); // genislik
  e.writeUInt8(size === 256 ? 0 : size, 1); // yukseklik
  e.writeUInt8(0, 2);                       // palet rengi yok
  e.writeUInt8(0, 3);                       // reserved
  e.writeUInt16LE(1, 4);                    // renk duzlemi
  e.writeUInt16LE(32, 6);                   // bit derinligi
  e.writeUInt32LE(buf.length, 8);           // veri boyutu
  e.writeUInt32LE(offset, 12);              // veri konumu
  entries.push(e);
  offset += buf.length;
}

const ico = Buffer.concat([header, ...entries, ...pngs.map((p) => p.buf)]);
fs.writeFileSync("app/favicon.ico", ico);
console.log(`favicon.ico yazildi: ${ico.length} byte (${sizes.join("/")}px)`);

// Apple touch icon — iOS ana ekran kisayolu icin
await sharp(svg).resize(180, 180).png().toFile("app/apple-icon.png");
console.log("apple-icon.png yazildi: 180x180");
