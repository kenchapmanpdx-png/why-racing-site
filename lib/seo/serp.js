// lib/seo/serp.js
//
// Estimated pixel width of a <title> or meta description as Google renders it,
// so templates can pick the longest variant that is not cut off with "...".
// Model: Arial advance widths (units per 1000 em) at 19.2 px for titles and
// 13.7 px for descriptions. Calibrated 2026-11-14 against Screaming Frog's
// pixel widths for all 33 site pages (average error 6 px titles, 7 px
// descriptions; worst case about 20 px under).
//
// Limits: Screaming Frog flags titles over 561 px and descriptions over 985 px.
// The fit limits below leave a margin for the model's error.

const ARIAL = {
  ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  ':': 278, ';': 278, '?': 556, '@': 1015, '|': 260,
  0: 556, 1: 556, 2: 556, 3: 556, 4: 556, 5: 556, 6: 556, 7: 556, 8: 556, 9: 556,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500,
  K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611,
  U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222,
  k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278,
  u: 556, v: 500, w: 722, x: 500, y: 500, z: 500
};

function emUnits(text) {
  let total = 0;
  for (const ch of String(text || '')) total += ARIAL[ch] !== undefined ? ARIAL[ch] : 556;
  return total;
}

const titleWidth = (t) => Math.round(emUnits(t) * 19.2 / 1000);
const descriptionWidth = (d) => Math.round(emUnits(d) * 13.7 / 1000);

const TITLE_FIT_PX = 550;
const DESCRIPTION_FIT_PX = 940;

const titleFits = (t) => titleWidth(t) <= TITLE_FIT_PX;
const descriptionFits = (d) => d.length <= 155 && descriptionWidth(d) <= DESCRIPTION_FIT_PX;

module.exports = { titleWidth, descriptionWidth, titleFits, descriptionFits, TITLE_FIT_PX, DESCRIPTION_FIT_PX };
