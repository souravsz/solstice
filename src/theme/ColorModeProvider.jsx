import { useCallback, useEffect, useMemo, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ThemeProvider } from '@mui/material/styles';
import { ColorModeContext, COLOR_MODE_STORAGE_KEY } from './ColorModeContext.js';
import { createAppTheme } from './createAppTheme.js';
import { surfaces } from './tokens.js';

const PREFERENCES = ['system', 'light', 'dark'];

function readPreference() {
  try {
    const stored = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    return PREFERENCES.includes(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

function writePreference(preference) {
  try {
    if (preference === 'system') window.localStorage.removeItem(COLOR_MODE_STORAGE_KEY);
    else window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, preference);
  } catch {
    // Storage can be unavailable (private browsing); the choice still applies for this session.
  }
}

/** Follows the system colour scheme by default, with a manual override saved in localStorage. */
export function ColorModeProvider({ children }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const [preference, setPreferenceState] = useState(readPreference);
  const mode = preference === 'system' ? (prefersDark ? 'dark' : 'light') : preference;

  const setPreference = useCallback((next) => {
    setPreferenceState(next);
    writePreference(next);
  }, []);

  const toggle = useCallback(() => {
    const next = mode === 'dark' ? 'light' : 'dark';
    // Choosing the mode the system already uses means "follow the system" again.
    setPreference(next === (prefersDark ? 'dark' : 'light') ? 'system' : next);
  }, [mode, prefersDark, setPreference]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, preference, toggle, setPreference }), [mode, preference, toggle, setPreference]);

  // Keep the browser chrome and the pre-paint background in step with the theme.
  useEffect(() => {
    const background = surfaces[mode].background;
    document.documentElement.style.backgroundColor = background;
    document.documentElement.style.colorScheme = mode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background);
  }, [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
