import useMediaQuery from '@mui/material/useMediaQuery';

/** True when the user has asked the system to minimise motion. */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true });
}
