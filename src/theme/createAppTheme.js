import { createTheme } from '@mui/material/styles';
import { alpha } from '../lib/color/color.js';
import { focusRing, fonts, motion, phaseAccents, phaseFills, radius, shadows, spacingUnit, sun, surfaces } from './tokens.js';

const tabularNumerals = {
  fontVariantNumeric: 'tabular-nums lining-nums',
  fontFeatureSettings: '"tnum" 1, "lnum" 1',
};

/**
 * Build the Solstice theme for a colour mode.
 * @param {'light' | 'dark'} mode
 */
export function createAppTheme(mode) {
  const s = surfaces[mode];
  const accents = phaseAccents[mode];
  const ring = focusRing[mode];

  const theme = createTheme({
    spacing: spacingUnit,
    // sx `borderRadius: 1` = 10px (controls). Cards use radius.card (16px) via their override.
    shape: { borderRadius: radius.control },
    palette: {
      mode,
      primary: { main: s.ink, contrastText: s.onInk },
      secondary: { main: accents.goldenHour },
      info: { main: accents.blueHour },
      error: { main: mode === 'light' ? '#B3261E' : '#F2B8B5' },
      background: { default: s.background, paper: s.surface },
      text: { primary: s.textPrimary, secondary: s.textSecondary, disabled: alpha(s.textPrimary, 0.38) },
      divider: s.border,
      phase: accents,
      phaseFill: phaseFills[mode],
      /** Sun phase fills plus readable text shades: night, blue, golden, day, blueText, goldenText. */
      sun: sun[mode],
      surface: s,
      focus: ring,
    },
    typography: {
      fontFamily: fonts.sans,
      fontSize: 14,
      h1: {
        fontFamily: fonts.serif,
        fontWeight: 450,
        fontSize: 'clamp(2.25rem, 1.7rem + 2.2vw, 3.5rem)',
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontFamily: fonts.serif,
        fontWeight: 450,
        fontSize: 'clamp(1.6rem, 1.35rem + 1vw, 2.1rem)',
        lineHeight: 1.15,
        letterSpacing: '-0.015em',
      },
      h3: {
        fontFamily: fonts.serif,
        fontWeight: 500,
        fontSize: '1.5rem',
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontFamily: fonts.serif,
        fontWeight: 500,
        fontSize: '1.25rem',
        lineHeight: 1.25,
        letterSpacing: '-0.005em',
      },
      h5: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
      h6: { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.4 },
      subtitle1: { fontWeight: 500, fontSize: '1rem', lineHeight: 1.5 },
      subtitle2: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.45 },
      body1: { fontSize: '1rem', lineHeight: 1.55 },
      body2: { fontSize: '0.875rem', lineHeight: 1.5 },
      button: { fontWeight: 600, fontSize: '0.9375rem', textTransform: 'none', letterSpacing: 0 },
      caption: { fontSize: '0.8125rem', lineHeight: 1.45, letterSpacing: '0.005em' },
      overline: {
        fontSize: '0.6875rem',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      },
      /** Hero clock. */
      time: {
        fontFamily: fonts.serif,
        fontWeight: 400,
        fontSize: 'clamp(3.75rem, 2.4rem + 6vw, 6.5rem)',
        lineHeight: 0.95,
        letterSpacing: '-0.03em',
        ...tabularNumerals,
      },
      /** Page date title ("Thursday, 29 October"). */
      dateTitle: {
        fontFamily: fonts.sans,
        fontWeight: 600,
        fontSize: 'clamp(1.625rem, 1.4rem + 0.9vw, 2rem)',
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
      },
      /** Card headings ("Sun times", "Sun path"). */
      cardTitle: {
        fontFamily: fonts.sans,
        fontWeight: 600,
        fontSize: '1.0625rem',
        lineHeight: 1.35,
        letterSpacing: '-0.01em',
      },
      /** Primary stat numbers (sunrise, sunset). */
      statPrimary: {
        fontFamily: fonts.sans,
        fontWeight: 500,
        fontSize: 'clamp(2.125rem, 1.95rem + 0.6vw, 2.5rem)',
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        ...tabularNumerals,
      },
      /** Secondary stat numbers (solar noon, day length). */
      statSecondary: {
        fontFamily: fonts.sans,
        fontWeight: 500,
        fontSize: 'clamp(1.5rem, 1.4rem + 0.35vw, 1.75rem)',
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        ...tabularNumerals,
      },
      /** A sentence in place of a stat number ("Doesn't rise today"). */
      statMessage: {
        fontFamily: fonts.sans,
        fontWeight: 500,
        fontSize: '1.125rem',
        lineHeight: 1.35,
        letterSpacing: '-0.01em',
      },
      /** Stat labels ("Sunrise"). */
      statLabel: { fontFamily: fonts.sans, fontWeight: 500, fontSize: '0.8125rem', lineHeight: 1.4 },
      /** Helper text under a stat ("Same time tomorrow"). */
      statHelper: { fontFamily: fonts.sans, fontWeight: 400, fontSize: '0.8125rem', lineHeight: 1.45 },
      /** Golden / blue hour row names. */
      rowLabel: { fontFamily: fonts.sans, fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.45 },
      /** Time ranges in rows. */
      timeRange: {
        fontFamily: fonts.sans,
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.45,
        ...tabularNumerals,
      },
      /** Axis ticks under the timeline and the sun path. */
      tick: { fontFamily: fonts.sans, fontWeight: 500, fontSize: '0.75rem', lineHeight: 1.3, ...tabularNumerals },
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: motion.fast,
        short: motion.base,
        standard: motion.slow,
        complex: motion.slow,
        enteringScreen: motion.base,
        leavingScreen: motion.fast,
      },
      easing: {
        easeInOut: motion.easing,
        easeOut: 'cubic-bezier(0, 0, 0, 1)',
        easeIn: 'cubic-bezier(0.3, 0, 1, 1)',
        sharp: motion.easing,
      },
    },
  });

  const focusVisible = {
    outline: `2px solid ${ring}`,
    outlineOffset: 2,
  };

  theme.components = {
    MuiCssBaseline: {
      styleOverrides: {
        html: { WebkitTextSizeAdjust: '100%' },
        body: {
          backgroundColor: s.background,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        },
        '::selection': { backgroundColor: alpha(accents.blueHour, 0.24) },
        ':focus-visible': focusVisible,
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          time: 'p',
          dateTitle: 'h2',
          cardTitle: 'h3',
          statPrimary: 'p',
          statSecondary: 'p',
          statMessage: 'p',
          statLabel: 'span',
          statHelper: 'p',
          rowLabel: 'span',
          timeRange: 'span',
          tick: 'span',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation1: {
          boxShadow:
            mode === 'light'
              ? '0 1px 2px rgba(29, 27, 24, 0.04), 0 4px 16px rgba(29, 27, 24, 0.04)'
              : '0 1px 2px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: radius.card,
          border: `1px solid ${s.border}`,
          backgroundColor: s.surface,
          boxShadow: shadows[mode].card,
          transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow'], {
            duration: motion.base,
          }),
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          // 20px on phones, 32px from tablets up.
          padding: theme.spacing(2.5),
          '&:last-child': { paddingBottom: theme.spacing(2.5) },
          [theme.breakpoints.up('md')]: {
            padding: theme.spacing(4),
            '&:last-child': { paddingBottom: theme.spacing(4) },
          },
        },
      },
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
      styleOverrides: { root: { '&.Mui-focusVisible': focusVisible } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radius.control,
          textTransform: 'none',
          fontWeight: 600,
          paddingInline: theme.spacing(2),
          minHeight: 40,
          transition: theme.transitions.create(['background-color', 'border-color', 'color'], {
            duration: motion.fast,
          }),
        },
        outlined: {
          borderColor: s.borderStrong,
          color: s.textPrimary,
          '&:hover': { borderColor: s.textTertiary, backgroundColor: alpha(s.textPrimary, 0.04) },
        },
        text: {
          color: s.textPrimary,
          '&:hover': { backgroundColor: alpha(s.textPrimary, 0.05) },
        },
        containedPrimary: {
          '&:hover': { backgroundColor: alpha(s.ink, 0.86) },
        },
        sizeSmall: { minHeight: 32, paddingInline: theme.spacing(1.5), fontSize: '0.875rem' },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.control,
          color: s.textPrimary,
          transition: theme.transitions.create(['background-color', 'border-color'], { duration: motion.fast }),
          '&:hover': { backgroundColor: alpha(s.textPrimary, 0.06) },
        },
      },
    },
    MuiChip: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          borderRadius: radius.control,
          fontWeight: 500,
          borderColor: s.borderStrong,
          color: s.textPrimary,
          transition: theme.transitions.create(['background-color', 'border-color'], { duration: motion.fast }),
        },
        outlined: { backgroundColor: 'transparent' },
        clickable: {
          '&:hover': { backgroundColor: alpha(s.textPrimary, 0.05), borderColor: s.borderStrong },
        },
        sizeSmall: { fontSize: '0.75rem', height: 24 },
        icon: { color: 'inherit', marginLeft: 8 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radius.dialog,
          border: `1px solid ${s.border}`,
          backgroundColor: s.surface,
          backgroundImage: 'none',
          boxShadow: mode === 'light' ? '0 24px 64px rgba(29, 27, 24, 0.14)' : '0 24px 64px rgba(0, 0, 0, 0.5)',
          [theme.breakpoints.down('sm')]: { margin: theme.spacing(2), width: `calc(100% - ${theme.spacing(4)})` },
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          '&:not(.MuiBackdrop-invisible)': {
            backgroundColor: mode === 'light' ? 'rgba(29, 27, 24, 0.28)' : 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(2px)',
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: fonts.serif,
          fontWeight: 500,
          fontSize: '1.5rem',
          letterSpacing: '-0.01em',
          padding: theme.spacing(3, 3, 1),
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: { root: { padding: theme.spacing(1, 3, 3) } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          backgroundColor: s.surface,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: s.borderStrong },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: s.textTertiary },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ring, borderWidth: 2 },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { '&.Mui-focused': { color: s.textPrimary } } },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: radius.md,
          border: `1px solid ${s.border}`,
          marginTop: 6,
          boxShadow: mode === 'light' ? '0 12px 32px rgba(29, 27, 24, 0.10)' : '0 12px 32px rgba(0, 0, 0, 0.45)',
        },
        option: {
          minHeight: 44,
          '&.Mui-focused': { backgroundColor: `${alpha(s.textPrimary, 0.06)} !important` },
          '&[aria-selected="true"]': { backgroundColor: `${alpha(accents.blueHour, 0.1)} !important` },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: s.ink,
          color: s.onInk,
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: radius.sm,
          padding: theme.spacing(0.75, 1.25),
        },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: radius.md } },
    },
    MuiLink: {
      styleOverrides: { root: { textUnderlineOffset: '0.2em' } },
    },
  };

  return theme;
}
