'use strict';

// Minimal Version 4-L (33x33) Byte-mode QR code generator for URLs up to 78 bytes,
// stepping up to Version 6-L (41x41) up to 134 bytes so map/site URLs stay scannable.
const VERSIONS = [
  { version: 4, size: 33, dataCodewords: 80, ecCodewords: 20, align: [6, 26] },
  { version: 6, size: 41, dataCodewords: 136, ecCodewords: 18, blocks: 2, align: [6, 34] }
];

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(deg) {
  let poly = [1];
  for (let i = 0; i < deg; i++) {
    const next = new Array(poly.length + 1).fill(0);
    const root = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], root);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data, ecLen) {
  const gen = rsGeneratorPoly(ecLen);
  const res = new Uint8Array(data.length + ecLen);
  res.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return Array.from(res.slice(data.length));
}

function buildCodewords(bytes, cfg) {
  const bits = [];
  const pushBits = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const b of bytes) pushBits(b, 8);
  const maxBits = cfg.dataCodewords * 8;
  pushBits(0, Math.min(4, maxBits - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }
  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    data.push(byte);
  }

  if (!cfg.blocks) {
    return data.concat(rsEncode(data, cfg.ecCodewords));
  }
  const half = cfg.dataCodewords / 2;
  const b1 = data.slice(0, half);
  const b2 = data.slice(half);
  const e1 = rsEncode(b1, cfg.ecCodewords);
  const e2 = rsEncode(b2, cfg.ecCodewords);
  const out = [];
  for (let i = 0; i < half; i++) out.push(b1[i], b2[i]);
  for (let i = 0; i < cfg.ecCodewords; i++) out.push(e1[i], e2[i]);
  return out;
}

function generateQrSvg(text) {
  const bytes = Array.from(Buffer.from(String(text || '/'), 'utf8')).slice(0, 132);
  const cfg = bytes.length <= 78 ? VERSIONS[0] : VERSIONS[1];
  const size = cfg.size;
  const grid = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
  const reserved = Array.from({ length: size }, () => new Uint8Array(size));

  const setFinder = (r0, c0) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        const on = r >= 0 && r <= 6 && c >= 0 && c <= 6 &&
          (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
        grid[rr][cc] = on ? 1 : 0;
        reserved[rr][cc] = 1;
      }
    }
  };

  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0 ? 1 : 0;
    reserved[6][i] = 1;
    grid[i][6] = i % 2 === 0 ? 1 : 0;
    reserved[i][6] = 1;
  }

  for (const ar of cfg.align) {
    for (const ac of cfg.align) {
      if (reserved[ar][ac]) continue;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const on = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
          grid[ar + r][ac + c] = on ? 1 : 0;
          reserved[ar + r][ac + c] = 1;
        }
      }
    }
  }

  grid[size - 8][8] = 1;
  reserved[size - 8][8] = 1;

  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      reserved[8][i] = 1;
      reserved[i][8] = 1;
    }
  }
  for (let i = size - 8; i < size; i++) {
    reserved[8][i] = 1;
    reserved[i][8] = 1;
  }

  const codewords = buildCodewords(bytes, cfg);
  const stream = [];
  for (const cw of codewords) {
    for (let b = 7; b >= 0; b--) stream.push((cw >> b) & 1);
  }

  let bitIdx = 0;
  let dirUp = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let step = 0; step < size; step++) {
      const r = dirUp ? size - 1 - step : step;
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc;
        if (reserved[r][c]) continue;
        const bit = bitIdx < stream.length ? stream[bitIdx++] : 0;
        // Apply Mask 0: (r + c) % 2 === 0
        grid[r][c] = ((r + c) % 2 === 0) ? (bit ^ 1) : bit;
      }
    }
    dirUp = !dirUp;
  }

  // Format info for EC Level L (01) and Mask 0 (000) -> 15-bit BCH 111011111000100
  const fmt = 0b111011111000100;
  for (let i = 0; i < 15; i++) {
    const bit = (fmt >> (14 - i)) & 1;
    if (i < 6) grid[8][i] = bit;
    else if (i < 8) grid[8][i + 1] = bit;
    else grid[8][size - 15 + i] = bit;

    if (i < 8) grid[size - 1 - i][8] = bit;
    else if (i === 8) grid[7][8] = bit;
    else grid[14 - i][8] = bit;
  }

  const scale = 5;
  const quiet = 4;
  const total = (size + quiet * 2) * scale;
  const rects = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 1) {
        rects.push(`<rect x="${(c + quiet) * scale}" y="${(r + quiet) * scale}" width="${scale}" height="${scale}"/>`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" role="img" aria-label="Kode QR tautan">` +
    `<rect width="${total}" height="${total}" fill="#FFFFFF"/>` +
    `<g fill="#1E3A8A">${rects.join('')}</g></svg>`;
}

module.exports = { generateQrSvg };

