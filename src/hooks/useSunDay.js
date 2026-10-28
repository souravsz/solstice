import { useMemo } from 'react';
import { getPhaseSegments, getSunTimes, sampleElevations } from '../lib/solar/index.js';
import { buildSunCards } from '../lib/summary/cards.js';
import { describeTomorrow } from '../lib/summary/compare.js';
import { addCivilDays, civilDayBounds, civilNoon, parseCivilDate, zonedTimeToUtc } from '../lib/time/zoned.js';

/**
 * Everything about one calendar day at one place. Recomputed only when either changes.
 * @param {object | null} location
 * @param {string | null} civilDate 'YYYY-MM-DD' in the location's time zone
 * @param {boolean} isToday words comparisons as "tomorrow" rather than "the next day"
 */
export function useSunDay(location, civilDate, isToday) {
  return useMemo(() => {
    if (!location || !civilDate) return null;
    const { lat, lng, timeZone } = location;
    const bounds = civilDayBounds(civilDate, timeZone);
    const times = getSunTimes(civilNoon(civilDate, timeZone), lat, lng, { timeZone });
    const nextDay = getSunTimes(civilNoon(addCivilDays(civilDate, 1), timeZone), lat, lng, { timeZone });
    const fields = parseCivilDate(civilDate);

    return {
      civilDate,
      timeZone,
      bounds,
      times,
      cards: buildSunCards(times, bounds),
      comparisons: describeTomorrow(times, nextDay, timeZone, isToday ? 'tomorrow' : 'nextDay'),
      segments: getPhaseSegments(bounds.start, bounds.end, lat, lng),
      samples: sampleElevations(bounds.start, bounds.end, lat, lng, 10),
      // Clock positions for axis labels; real instants, so DST days stay accurate.
      ticks: [0, 6, 12, 18, 24].map((hour) =>
        hour === 24 ? bounds.end : hour === 0 ? bounds.start : zonedTimeToUtc({ ...fields, hour }, timeZone),
      ),
    };
  }, [location, civilDate, isToday]);
}
