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

function writePng(filePath, size, draw) {
  const pixels = new Uint8Array(size * size * 4);
  const setPixel = (x, y, color) => {
    const index = (y * size + x) * 4;
    pixels[index] = color[0];
    pixels[index + 1] = color[1];
    pixels[index + 2] = color[2];
    pixels[index + 3] = 255;
  };
  const at = (x, y) => Math.floor(((y + 0.5) / size) * 64);
  const atR = (x, y, radius) => {
    const cx = at(x);
    const cy = at(y);
    const r = radius * size;
    const rr = Math.ceil(r);
    for (let py = -rr; py <= rr; py += 1) {
      for (let px = -rr; px <= rr; px += 1) {
        if (px * px + py * py <= r * r) {
          const pxAbs = Math.round(cx) + px;
          const pyAbs = Math.round(cy) + py;
          if (pxAbs >= 0 && pxAbs < size && pyAbs >= 0 && pyAbs < size) {
            setPixel(pxAbs, pyAbs, draw);
          }
        }
      }
    }
  };
  const fillRect = (x0, y0, w, h, color) => {
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) setPixel(Math.floor(x0 * size) + x, Math.floor(y0 * size) + y, color);
    }
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4;
      pixels[index] = 11;
      pixels[index + 1] = 93;
      pixels[index + 2] = 59;
      pixels[index + 3] = 255;
    }
  }
  draw(size, setPixel, at, atR, fillRect);

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
  const ihdrChunk = chunk("IHDR", ihdr);
  const idatChunk = chunk("IDAT", idat);
  const iendChunk = chunk("IEND", Buffer.alloc(0));
  const out = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ihdrChunk,
    idatChunk,
    iendChunk,
  ]);
  fs.writeFileSync(filePath, out);
}

const greenDark = [7, 59, 40];
const lime = [182, 217, 76];
const leaf = [20, 128, 92];
const cream = [251, 248, 240];

for (const size of [192, 512]) {
  writePng(path.join(outDir, `icon-${size}.png`), size, (sz, setPixel, at, atR, fillRect) => {
    fillRect(4, 30, 56, 6, cream);
    atR(32, 18, 10, lime);
    atR(21, 10, 6, leaf);
    atR(43, 10, 6, leaf);
    atR(32, 14, 4, leaf);
    atR(27, 6, 3, leaf);
    atR(37, 6, 3, leaf);
    fillRect(18, 36, 28, 20, greenDark);
  });
}
