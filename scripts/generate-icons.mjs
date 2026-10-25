import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuffer = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput) >>> 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

// Brand palette — ColorHunt E3F2FD / 90CAF9 / 2196F3 / 0D47A1
const brand = [13, 71, 161]; // #0D47A1 background
const brandDeep = [10, 54, 121]; // #0A3679 box inset
const sky = [144, 202, 249]; // #90CAF9 leaves
const accent = [33, 150, 243]; // #2196F3 leaf highlights
const white = [255, 255, 255];

/**
 * Draws on a 64x64 design grid. `draw` receives unit-aware helpers so the
 * same artwork scales cleanly to every icon size.
 */
function writePng(filePath, size, draw) {
  const pixels = new Uint8Array(size * size * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = brand[0];
    pixels[i + 1] = brand[1];
    pixels[i + 2] = brand[2];
    pixels[i + 3] = 255;
  }

  const scale = size / 64;

  const setPixel = (x, y, color) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const index = (y * size + x) * 4;
    pixels[index] = color[0];
    pixels[index + 1] = color[1];
    pixels[index + 2] = color[2];
    pixels[index + 3] = 255;
  };

  const fillRect = (x0, y0, w, h, color) => {
    const left = Math.round(x0 * scale);
    const top = Math.round(y0 * scale);
    const right = Math.round((x0 + w) * scale);
    const bottom = Math.round((y0 + h) * scale);
    for (let y = top; y < bottom; y += 1) {
      for (let x = left; x < right; x += 1) setPixel(x, y, color);
    }
  };

  const circle = (cx, cy, radius, color) => {
    const px = cx * scale;
    const py = cy * scale;
    const r = radius * scale;
    for (let y = Math.floor(py - r); y <= Math.ceil(py + r); y += 1) {
      for (let x = Math.floor(px - r); x <= Math.ceil(px + r); x += 1) {
        const dx = x + 0.5 - px;
        const dy = y + 0.5 - py;
        if (dx * dx + dy * dy <= r * r) setPixel(x, y, color);
      }
    }
  };

  draw({ fillRect, circle });

  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x += 1) {
      const source = (y * size + x) * 4;
      const offset = rowStart + 1 + x * 4;
      raw[offset] = pixels[source];
      raw[offset + 1] = pixels[source + 1];
      raw[offset + 2] = pixels[source + 2];
      raw[offset + 3] = pixels[source + 3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = zlib.deflateSync(raw, { level: 9 });
  const out = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  fs.writeFileSync(filePath, out);
}

/** Plant-in-a-box mark. `scale` shrinks artwork toward the centre (maskable). */
function drawMark({ fillRect, circle }, scale = 1) {
  const c = 32;
  const t = (v) => c + (v - c) * scale;
  const r = (v) => v * scale;

  // Soil line
  fillRect(t(4), t(30), 56 * scale, 6 * scale, white);
  // Leaves
  circle(t(32), t(18), r(10), sky);
  circle(t(21), t(10), r(6), sky);
  circle(t(43), t(10), r(6), sky);
  circle(t(32), t(14), r(4), accent);
  circle(t(27), t(6), r(3), accent);
  circle(t(37), t(6), r(3), accent);
  // Open box
  fillRect(t(18), t(36), 28 * scale, 20 * scale, white);
  fillRect(t(21), t(39), 22 * scale, 14 * scale, brandDeep);
}

writePng(path.join(outDir, "icon-192.png"), 192, (d) => drawMark(d, 1));
writePng(path.join(outDir, "icon-512.png"), 512, (d) => drawMark(d, 1));
writePng(path.join(outDir, "icon-maskable-512.png"), 512, (d) => drawMark(d, 0.7));
