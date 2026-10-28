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
  md: 12,
  card: 20,
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

/** Neutral warm greys for surfaces and text. */
export const surfaces = {
  light: {
    background: '#F6F4F0',
    surface: '#FCFBF9',
    surfaceMuted: '#EFECE6',
    border: '#E4DFD7',
    borderStrong: '#CFC8BC',
    textPrimary: '#1D1B18',
    textSecondary: '#59544C',
    textTertiary: '#6E685E',
    ink: '#1D1B18',
    onInk: '#FCFBF9',
  },
  dark: {
    background: '#11100E',
    surface: '#191816',
    surfaceMuted: '#221F1C',
    border: '#2E2B27',
    borderStrong: '#45413B',
    textPrimary: '#F3F0EA',
    textSecondary: '#B4AEA4',
    textTertiary: '#9A948A',
    ink: '#F3F0EA',
    onInk: '#11100E',
  },
};

/** One accent per sun phase. Dark-mode variants are lifted for contrast on dark surfaces. */
export const phaseAccents = {
  light: {
    night: '#2A3772',
    blueHour: '#4A51C4',
    goldenHour: '#9C5B00',
    day: '#2B72B0',
  },
  dark: {
    night: '#8E9DE2',
    blueHour: '#9EA5F6',
    goldenHour: '#F0B04C',
    day: '#7DBBEE',
  },
};

/** Softer fills for large areas (timeline segments), same hue family as the accents. */
export const phaseFills = {
  light: {
    night: '#2A3366',
    blueHour: '#5960C9',
    goldenHour: '#E9A33E',
    day: '#A9CDEB',
  },
  dark: {
    night: '#28306A',
    blueHour: '#5057B8',
    goldenHour: '#C9862A',
    day: '#4F7FA6',
  },
};

export const focusRing = {
  light: '#4A51C4',
  dark: '#9EA5F6',
};

/** Used by the PWA manifest and index.html. */
export const brand = {
  themeColor: '#151E50',
  backgroundColor: surfaces.light.background,
};
