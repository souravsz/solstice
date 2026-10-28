import { EVENT, PHASE } from '../solar/index.js';
import { MS_PER_MINUTE } from '../solar/constants.js';
import { formatDuration, formatDurationLong } from '../time/format.js';

const EVENT_TEXT = {
  [EVENT.SUNRISE]: 'Sunrise',
  [EVENT.SUNSET]: 'Sunset',
  [EVENT.GOLDEN_HOUR_START]: 'Golden hour begins',
  [EVENT.GOLDEN_HOUR_END]: 'Golden hour ends',
  [EVENT.BLUE_HOUR_START]: 'Blue hour begins',
  [EVENT.NIGHT_START]: 'Night falls',
};

/**
 * One calm line about what happens next, e.g. "Golden hour begins in 1h 12m".
 * @param {{ type: string, at: Date } | null} next
 * @param {Date} now
 * @param {string} phase current phase, used when nothing changes for two days
 * @returns {{ text: string, spoken: string }}
 */
export function describeNextEvent(next, now, phase) {
  if (!next) {
    const text =
      phase === PHASE.DAY
        ? 'The sun stays up all day'
        : phase === PHASE.NIGHT
          ? 'The sun stays below the horizon all day'
          : 'Twilight lingers all day';
    return { text, spoken: text };
  }
  const label = EVENT_TEXT[next.type];
  const ms = next.at.getTime() - now.getTime();
  if (ms < MS_PER_MINUTE) return { text: `${label} now`, spoken: `${label} now` };
  return { text: `${label} in ${formatDuration(ms)}`, spoken: `${label} in ${formatDurationLong(ms)}` };
}

/** "south-west" style compass point for an azimuth in degrees. */
export function compassPoint(azimuth) {
  const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return points[Math.round((((azimuth % 360) + 360) % 360) / 45) % 8];
}

/** "23° above the horizon" / "4° below the horizon" */
export function describeElevation(elevation) {
  const rounded = Math.round(Math.abs(elevation));
  if (rounded === 0) return 'on the horizon';
  return `${rounded}° ${elevation >= 0 ? 'above' : 'below'} the horizon`;
}
