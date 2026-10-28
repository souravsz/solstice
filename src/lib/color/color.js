/** Small sRGB colour utilities: parsing, mixing and WCAG contrast. */

export function hexToRgb(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value;
  const n = Number.parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const toHexByte = (v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');

export const rgbToHex = ({ r, g, b }) => `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`.toUpperCase();

/** Linear interpolation between two colours in sRGB, as CSS gradients do by default. */
export function mixRgb(a, b, t) {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t };
}

export const mixHex = (a, b, t) => rgbToHex(mixRgb(hexToRgb(a), hexToRgb(b), t));

/** Composite `top` with opacity `alpha` over an opaque `bottom` colour. */
export const overlayRgb = (bottom, top, alpha) => mixRgb(bottom, top, alpha);

const channelToLinear = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance (0–1). */
export function relativeLuminance(color) {
  const { r, g, b } = typeof color === 'string' ? hexToRgb(color) : color;
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

/** WCAG contrast ratio (1–21) between two colours. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** CSS rgba() string from a hex colour and an alpha. */
export function alpha(hex, opacity) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Number(opacity.toFixed(3))})`;
}
