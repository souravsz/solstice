import { contrastRatio, hexToRgb, mixHex, mixRgb, overlayRgb, rgbToHex } from '../color/color.js';

/**
 * Sky colours keyed by sun elevation (degrees): [top, middle, horizon].
 * Deep navy at night, indigo in blue hour, rose and peach at dawn,
 * amber in golden hour, pale blue by day. The overhead sky stays darker than
 * the horizon at low sun angles, as it does outdoors.
 */
const KEYFRAMES = [
  { at: -90, colors: ['#05070F', '#090D1F', '#10162E'] },
  { at: -18, colors: ['#070B1A', '#0D1431', '#1A2246'] },
  { at: -12, colors: ['#0A1130', '#162055', '#2A346E'] },
  { at: -8, colors: ['#111A45', '#232F72', '#424C94'] },
  { at: -6, colors: ['#151E50', '#2B3784', '#5B5FAE'] },
  { at: -4, colors: ['#192458', '#36408C', '#8A6AA8'] },
  { at: -2, colors: ['#1E2A62', '#474C90', '#C7798A'] },
  { at: 0, colors: ['#22306B', '#4F4F8C', '#EE9A7C'] },
  { at: 3, colors: ['#2B3C7A', '#5E5A8C', '#F4B36E'] },
  { at: 5, colors: ['#344A88', '#686B98', '#F2C589'] },
  { at: 8, colors: ['#6D93CF', '#AFC0DC', '#F0D9B0'] },
  { at: 12, colors: ['#78A4DD', '#B6CFEA', '#ECE3CC'] },
  { at: 20, colors: ['#7DAFE6', '#AED0F0', '#DDEAF5'] },
  { at: 45, colors: ['#6FA8E4', '#A7CCF0', '#D5E8F8'] },
  { at: 90, colors: ['#62A0E1', '#9DC6EF', '#D0E5F8'] },
];

/** Where each colour sits in the CSS gradient (0 = top, 1 = bottom). */
export const STOP_POSITIONS = [0, 0.62, 1];

/** Text lives in the upper part of the panel; the bottom band is the "horizon". */
export const TEXT_REGION_END = 0.7;

export const LIGHT_TEXT = '#FFFFFF';
export const DARK_TEXT = '#0A0C14';
const DARK_SCRIM = '#060914';
const LIGHT_SCRIM = '#FFFFFF';

/** WCAG AA for normal text, with a little headroom for rounding in the browser. */
export const MIN_CONTRAST = 4.6;

/** The three sky colours for an elevation, interpolated smoothly between keyframes. */
export function skyColors(elevation) {
  const e = Math.min(90, Math.max(-90, Number.isFinite(elevation) ? elevation : -90));
  let i = 0;
  while (i < KEYFRAMES.length - 2 && e > KEYFRAMES[i + 1].at) i += 1;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  const t = (e - a.at) / (b.at - a.at);
  return a.colors.map((color, index) => mixHex(color, b.colors[index], t));
}

/** Colour of the CSS gradient at position `t`, interpolated in sRGB like the browser does. */
export function sampleGradient(colors, t) {
  const rgb = colors.map(hexToRgb);
  for (let i = 0; i < STOP_POSITIONS.length - 1; i += 1) {
    const [p0, p1] = [STOP_POSITIONS[i], STOP_POSITIONS[i + 1]];
    if (t <= p1) return mixRgb(rgb[i], rgb[i + 1], (t - p0) / (p1 - p0));
  }
  return rgb.at(-1);
}

function textRegionSamples(colors) {
  const samples = [];
  for (let t = 0; t <= TEXT_REGION_END + 1e-9; t += TEXT_REGION_END / 24) samples.push(sampleGradient(colors, t));
  return samples;
}

const minContrast = (samples, text) => Math.min(...samples.map((c) => contrastRatio(c, text)));

/** Smallest scrim opacity that lifts every sample to MIN_CONTRAST against the text colour. */
function requiredScrim(samples, text, scrimColor) {
  const scrim = hexToRgb(scrimColor);
  const passes = (opacity) => minContrast(samples.map((c) => overlayRgb(c, scrim, opacity)), text) >= MIN_CONTRAST;
  if (passes(0)) return 0;
  let lo = 0;
  let hi = 0.8;
  for (let i = 0; i < 18; i += 1) {
    const mid = (lo + hi) / 2;
    if (passes(mid)) hi = mid;
    else lo = mid;
  }
  return Math.ceil(hi * 1000) / 1000;
}

/**
 * Everything the sky panel needs to paint itself for a sun elevation.
 *
 * Text colour is whichever of light/dark contrasts better with the text region.
 * When neither reaches AA (briefly, as the sky brightens past the switch point),
 * a soft scrim is layered over the text region, just strong enough to pass.
 *
 * @param {number} elevation degrees
 */
export function skyGradient(elevation) {
  const colors = skyColors(elevation);
  const samples = textRegionSamples(colors);
  const lightContrast = minContrast(samples, LIGHT_TEXT);
  const darkContrast = minContrast(samples, DARK_TEXT);
  const useLightText = lightContrast >= darkContrast;
  const textColor = useLightText ? LIGHT_TEXT : DARK_TEXT;
  const scrimColor = useLightText ? DARK_SCRIM : LIGHT_SCRIM;
  const scrimOpacity = requiredScrim(samples, textColor, scrimColor);

  const scrimRgb = hexToRgb(scrimColor);
  const effective = samples.map((c) => overlayRgb(c, scrimRgb, scrimOpacity));
  const contrast = minContrast(effective, textColor);

  const sky = `linear-gradient(180deg, ${colors
    .map((color, i) => `${color} ${Math.round(STOP_POSITIONS[i] * 100)}%`)
    .join(', ')})`;
  const { r, g, b } = scrimRgb;
  const scrim =
    scrimOpacity > 0
      ? `linear-gradient(180deg, rgba(${r}, ${g}, ${b}, ${scrimOpacity}) 0%, rgba(${r}, ${g}, ${b}, ${scrimOpacity}) ${Math.round(
          TEXT_REGION_END * 100,
        )}%, rgba(${r}, ${g}, ${b}, 0) 100%)`
      : null;

  return {
    colors,
    textColor,
    isDark: useLightText,
    scrimOpacity,
    contrast,
    background: scrim ? `${scrim}, ${sky}` : sky,
    /** A colour from the horizon, for glows and accents. */
    horizon: colors[2],
    /** The text-region colour nearest the text baseline, useful for subtle chips. */
    surface: rgbToHex(effective[Math.floor(effective.length / 2)]),
  };
}
