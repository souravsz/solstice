/**
 * Design tokens for Solstice: "calm, precise, sky-driven".
 * Plain data only, so the Vite config and tests can import it without React.
 */

export const fonts = {
  serif: '"Fraunces Variable", "Iowan Old Style", "Palatino Linotype", Georgia, serif',
  sans: '"Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

export const radius = {
  sm: 8,
  /** Buttons, chips, inputs and grouped controls. */
  control: 10,
  md: 12,
  card: 16,
  dialog: 24,
  pill: 999,
};

/** Base spacing unit in px; MUI's theme.spacing(n) multiplies this. */
export const spacingUnit = 8;

export const motion = {
  fast: 200,
  base: 250,
  slow: 300,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
};

/** Neutral surfaces and text. `border` is the hairline used for cards and dividers. */
export const surfaces = {
  light: {
    background: '#F7F6F3',
    surface: '#FFFFFF',
    surfaceMuted: '#F0EFEB',
    border: 'rgba(0, 0, 0, 0.06)',
    borderStrong: '#D6D4CE',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B6B6B',
    textTertiary: '#6B6B6B',
    ink: '#1A1A1A',
    onInk: '#FFFFFF',
  },
  dark: {
    background: '#121211',
    surface: '#1A1A19',
    surfaceMuted: '#242423',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: '#3B3B39',
    textPrimary: '#F2F2F0',
    textSecondary: '#A3A39F',
    textTertiary: '#94948F',
    ink: '#F2F2F0',
    onInk: '#121211',
  },
};

export const shadows = {
  light: { card: '0 1px 2px rgba(0, 0, 0, 0.04)' },
  dark: { card: 'none' },
};

/**
 * Sun phase colours for fills (timeline, dots, icons, chip backgrounds).
 * `goldenText` / `blueText` are deeper shades of the same hues for text,
 * because the fills themselves are too light to read as text on white.
 */
export const sun = {
  light: {
    night: '#1E2A4A',
    blue: '#5B6CDB',
    golden: '#E0A23B',
    day: '#CFE3F5',
    blueText: '#4A55C2',
    goldenText: '#8F5300',
  },
  dark: {
    night: '#2C3A64',
    blue: '#7D8AEE',
    golden: '#E6AC4E',
    day: '#5A84AB',
    blueText: '#A5AEF7',
    goldenText: '#F0BC66',
  },
};

/** One accent per sun phase, used where a phase colour must read as text or a line. */
export const phaseAccents = {
  light: {
    night: '#2A3772',
    blueHour: sun.light.blueText,
    goldenHour: sun.light.goldenText,
    day: '#2B72B0',
  },
  dark: {
    night: '#8E9DE2',
    blueHour: sun.dark.blueText,
    goldenHour: sun.dark.goldenText,
    day: '#7DBBEE',
  },
};

/** Large-area fills keyed by phase name (the sun-path arc), taken from the sun tokens. */
export const phaseFills = {
  light: { night: sun.light.night, blueHour: sun.light.blue, goldenHour: sun.light.golden, day: sun.light.day },
  dark: { night: sun.dark.night, blueHour: sun.dark.blue, goldenHour: sun.dark.golden, day: sun.dark.day },
};

export const focusRing = {
  light: '#4A55C2',
  dark: '#A5AEF7',
};

/** Used by the PWA manifest and index.html. */
export const brand = {
  themeColor: '#151E50',
  backgroundColor: surfaces.light.background,
};
