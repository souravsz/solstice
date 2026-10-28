import { useMemo } from 'react';
import { getNextEvent, getPhase, getSunPosition } from '../lib/solar/index.js';

/** Where the sun is right now, which phase of light that is, and what changes next. */
export function useSunNow(location, now) {
  return useMemo(() => {
    if (!location) return null;
    const position = getSunPosition(now, location.lat, location.lng);
    return {
      position,
      phase: getPhase(position.elevation),
      next: getNextEvent(now, location.lat, location.lng),
    };
  }, [location, now]);
}
