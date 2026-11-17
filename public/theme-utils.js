(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SapaTheme = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_THEME_COLOR = '#38BDF8';

  const THEME_PRESETS = [
    { name: 'Biru Langit (Bawaan)', hex: '#38BDF8' },
    { name: 'Biru Royal', hex: '#2563EB' },
    { name: 'Hijau Zamrud', hex: '#10B981' },
    { name: 'Teal Samudra', hex: '#0D9488' },
    { name: 'Ungu Indigo', hex: '#7C3AED' },
    { name: 'Merah Marun', hex: '#DC2626' },
    { name: 'Oranye Emas', hex: '#EA580C' }
  ];

  function normalizeHex(value) {
    const raw = String(value || '').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toUpperCase();
    const shortMatch = raw.match(/^#([0-9a-fA-F]{3})$/);
    if (shortMatch) {
      const s = shortMatch[1];
      return `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`.toUpperCase();
    }
    return null;
  }

  function hexToRgb(hex) {
    const norm = normalizeHex(hex) || DEFAULT_THEME_COLOR;
    return {
      r: parseInt(norm.slice(1, 3), 16),
      g: parseInt(norm.slice(3, 5), 16),
      b: parseInt(norm.slice(5, 7), 16)
    };
  }

  function rgbToHex(r, g, b) {
    const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
    return (
      '#' +
      [clamp(r), clamp(g), clamp(b)]
        .map((n) => n.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    );
  }

  function hexToHsl(hex) {
    const { r, g, b } = hexToRgb(hex);
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
      else if (max === gn) h = (bn - rn) / d + 2;
      else h = (rn - gn) / d + 4;
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function hslToHex(h, s, l) {
    const hue = ((Number(h) % 360) + 360) % 360;
    const sat = Math.max(0, Math.min(100, Number(s))) / 100;
    const lig = Math.max(0, Math.min(100, Number(l))) / 100;

    const c = (1 - Math.abs(2 * lig - 1)) * sat;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = lig - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (hue < 60) { r = c; g = x; }
    else if (hue < 120) { r = x; g = c; }
    else if (hue < 180) { g = c; b = x; }
    else if (hue < 240) { g = x; b = c; }
    else if (hue < 300) { r = x; b = c; }
    else { r = c; b = x; }

    return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
  }

  function hexToHsv(hex) {
    const { r, g, b } = hexToRgb(hex);
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (d !== 0) {
      if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
      else if (max === gn) h = (bn - rn) / d + 2;
      else h = (rn - gn) / d + 4;
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  }

  function hsvToHex(h, s, v) {
    const hue = ((Number(h) % 360) + 360) % 360;
    const sat = Math.max(0, Math.min(100, Number(s))) / 100;
    const val = Math.max(0, Math.min(100, Number(v))) / 100;
    const c = val * sat;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = val - c;
    let r = 0;
    let g = 0;
    let b = 0;

    if (hue < 60) { r = c; g = x; }
    else if (hue < 120) { r = x; g = c; }
    else if (hue < 180) { g = c; b = x; }
    else if (hue < 240) { g = x; b = c; }
    else if (hue < 300) { r = x; b = c; }
    else { r = c; b = x; }

    return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
  }

  function getRelativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const toLinear = (c) => {
      const srgb = c / 255;
      return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }

  function getContrastRatio(hex1, hex2) {
    const l1 = getRelativeLuminance(hex1);
    const l2 = getRelativeLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function pickAccessibleInk(bgHex, darkCandidate = '#0F172A', lightCandidate = '#FFFFFF') {
    const darkRatio = getContrastRatio(bgHex, darkCandidate);
    const lightRatio = getContrastRatio(bgHex, lightCandidate);
    return darkRatio >= lightRatio ? darkCandidate : lightCandidate;
  }

  function buildThemeTokens(rawHex, rawStyle = 'gradient') {
    const hex = normalizeHex(rawHex) || DEFAULT_THEME_COLOR;
    const style = rawStyle === 'flat' ? 'flat' : 'gradient';
    if (hex === DEFAULT_THEME_COLOR && style === 'gradient') {
      return null;
    }

    const { h, s, l } = hexToHsl(hex);
    const { r, g, b } = hexToRgb(hex);

    const accentInk = pickAccessibleInk(hex, '#0F172A', '#FFFFFF');
    const hoverL = accentInk === '#FFFFFF' ? Math.max(l - 8, 18) : Math.min(Math.max(l - 8, 38), 75);
    const accentHover = hslToHex(h, Math.min(s + 5, 92), hoverL);
    const accentBright = hslToHex(h, Math.min(s, 85), Math.min(Math.max(l + 14, 68), 82));

    const heroStart = hslToHex(h, Math.min(s, 82), 84);
    const heroMid = hslToHex(h, Math.min(s, 86), Math.min(Math.max(l, 45), 74));
    const heroEnd = hex;
    const heroBg = style === 'flat' ? hex : heroMid;
    const heroInk = pickAccessibleInk(heroBg, '#0F172A', '#FFFFFF');
    const heroGradient = style === 'flat'
      ? 'none'
      : `radial-gradient(ellipse at 86% 14%, rgba(255, 255, 255, 0.45), transparent 48%), radial-gradient(ellipse at 14% 88%, rgba(${r}, ${g}, ${b}, 0.22), transparent 52%), linear-gradient(145deg, ${heroStart} 0%, ${heroMid} 48%, ${heroEnd} 100%)`;
    const brandPrimary = hslToHex(h, Math.min(Math.max(s, 45), 86), 27);
    const focusRing = hslToHex(h, Math.min(Math.max(s, 55), 90), 38);

    const light = {
      bgPage: hslToHex(h, Math.min(s, 82), 97),
      bgSurface: '#FFFFFF',
      bgSubtle: hslToHex(h, Math.min(s, 78), 93),
      bgTint: hslToHex(h, Math.min(s, 75), 86),
      brandPrimary,
      accentPrimary: hex,
      accentHover,
      accentBright,
      accentInk,
      heroBg,
      heroInk,
      heroInkSoft: heroInk,
      heroGradient,
      borderSoft: hslToHex(h, Math.min(s, 70), 84),
      focusRing,
      shadowPremium: `0 0 0 1px rgba(${r}, ${g}, ${b}, 0.10), 0 2px 4px rgba(15, 23, 42, 0.04), 0 8px 20px rgba(${r}, ${g}, ${b}, 0.09)`,
      shadowPremiumHover: `0 0 0 1px rgba(${r}, ${g}, ${b}, 0.26), 0 4px 10px rgba(15, 23, 42, 0.05), 0 14px 28px rgba(${r}, ${g}, ${b}, 0.16)`,
      shadowBrand: `0 12px 32px rgba(${r}, ${g}, ${b}, 0.24), 0 4px 12px rgba(15, 23, 42, 0.06)`
    };

    const darkAccent = hslToHex(h, Math.min(Math.max(s, 55), 88), 62);
    const darkAccentHover = hslToHex(h, Math.min(Math.max(s, 60), 90), 74);
    const darkAccentRgb = hexToRgb(darkAccent);
    const darkHero1 = hslToHex(h, Math.min(Math.max(s, 50), 78), 16);
    const darkHero2 = hslToHex(h, Math.min(Math.max(s, 52), 80), 23);
    const darkHero3 = hslToHex(h, Math.min(Math.max(s, 50), 78), 29);

    const dark = {
      bgPage: hslToHex(h, Math.min(s, 45), 8),
      bgSurface: hslToHex(h, Math.min(s, 42), 13),
      bgSubtle: hslToHex(h, Math.min(s, 48), 6),
      bgTint: hslToHex(h, Math.min(s, 32), 18),
      brandPrimary: hslToHex(h, Math.min(Math.max(s, 55), 88), 76),
      accentPrimary: darkAccent,
      accentHover: darkAccentHover,
      accentBright: hslToHex(h, Math.min(Math.max(s, 55), 86), 48),
      accentInk: pickAccessibleInk(darkAccent, '#0F172A', '#FFFFFF'),
      heroBg: darkHero2,
      heroInk: '#FFFFFF',
      heroInkSoft: hslToHex(h, Math.min(s, 75), 93),
      heroGradient: style === 'flat'
        ? 'none'
        : `radial-gradient(ellipse at 86% 14%, rgba(${darkAccentRgb.r}, ${darkAccentRgb.g}, ${darkAccentRgb.b}, 0.22), transparent 48%), linear-gradient(145deg, ${darkHero1} 0%, ${darkHero2} 58%, ${darkHero3} 100%)`,
      borderSoft: hslToHex(h, Math.min(s, 65), 27),
      focusRing: darkAccent
    };

    return {
      hex,
      style,
      light,
      dark,
      contrastRatio: Number(getContrastRatio(hex, accentInk).toFixed(2))
    };
  }

  function buildThemeCss(rawHex, rawStyle = 'gradient') {
    const palette = buildThemeTokens(rawHex, rawStyle);
    if (!palette) return '';
    const { light, dark } = palette;
    return [
      ':root {',
      `  --bg-page: ${light.bgPage};`,
      `  --bg-surface: ${light.bgSurface};`,
      `  --bg-subtle: ${light.bgSubtle};`,
      `  --bg-tint: ${light.bgTint};`,
      `  --brand-primary: ${light.brandPrimary};`,
      `  --accent-primary: ${light.accentPrimary};`,
      `  --accent-hover: ${light.accentHover};`,
      `  --accent-bright: ${light.accentBright};`,
      `  --accent-ink: ${light.accentInk};`,
      `  --hero-bg: ${light.heroBg};`,
      `  --hero-ink: ${light.heroInk};`,
      `  --hero-ink-soft: ${light.heroInkSoft};`,
      `  --hero-gradient: ${light.heroGradient};`,
      `  --border-soft: ${light.borderSoft};`,
      `  --focus-ring: ${light.focusRing};`,
      `  --shadow-premium: ${light.shadowPremium};`,
      `  --shadow-premium-hover: ${light.shadowPremiumHover};`,
      `  --shadow-brand: ${light.shadowBrand};`,
      '}',
      '[data-theme="dark"] {',
      `  --bg-page: ${dark.bgPage};`,
      `  --bg-surface: ${dark.bgSurface};`,
      `  --bg-subtle: ${dark.bgSubtle};`,
      `  --bg-tint: ${dark.bgTint};`,
      `  --brand-primary: ${dark.brandPrimary};`,
      `  --accent-primary: ${dark.accentPrimary};`,
      `  --accent-hover: ${dark.accentHover};`,
      `  --accent-bright: ${dark.accentBright};`,
      `  --accent-ink: ${dark.accentInk};`,
      `  --hero-bg: ${dark.heroBg};`,
      `  --hero-ink: ${dark.heroInk};`,
      `  --hero-ink-soft: ${dark.heroInkSoft};`,
      `  --hero-gradient: ${dark.heroGradient};`,
      `  --border-soft: ${dark.borderSoft};`,
      `  --focus-ring: ${dark.focusRing};`,
      '}'
    ].join('\n');
  }

  return {
    DEFAULT_THEME_COLOR,
    THEME_PRESETS,
    normalizeHex,
    hexToRgb,
    rgbToHex,
    hexToHsl,
    hslToHex,
    hexToHsv,
    hsvToHex,
    getRelativeLuminance,
    getContrastRatio,
    pickAccessibleInk,
    buildThemeTokens,
    buildThemeCss
  };
});
