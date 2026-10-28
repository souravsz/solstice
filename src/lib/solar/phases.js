import { ELEVATION, MS_PER_HOUR, MS_PER_MINUTE } from './constants.js';
import { getSunElevation } from './position.js';

export const PHASE = Object.freeze({
  NIGHT: 'night',
  BLUE_HOUR: 'blueHour',
  GOLDEN_HOUR: 'goldenHour',
  DAY: 'day',
});

export const PHASE_LABEL = Object.freeze({
  [PHASE.NIGHT]: 'Night',
  [PHASE.BLUE_HOUR]: 'Blue hour',
  [PHASE.GOLDEN_HOUR]: 'Golden hour',
  [PHASE.DAY]: 'Daylight',
});

/** Phase of light for a geometric sun elevation in degrees. */
export function getPhase(elevation) {
  if (elevation >= ELEVATION.GOLDEN_UPPER) return PHASE.DAY;
  if (elevation >= ELEVATION.GOLDEN_LOWER) return PHASE.GOLDEN_HOUR;
  if (elevation >= ELEVATION.CIVIL) return PHASE.BLUE_HOUR;
  return PHASE.NIGHT;
}

const PHASE_THRESHOLDS = [ELEVATION.GOLDEN_UPPER, ELEVATION.GOLDEN_LOWER, ELEVATION.CIVIL];
const EVENT_THRESHOLDS = [ELEVATION.GOLDEN_UPPER, ELEVATION.SUNRISE, ELEVATION.GOLDEN_LOWER, ELEVATION.CIVIL];

/**
 * Every time the sun crosses one of `thresholds` between `start` and `end`.
 * Samples coarsely, then refines each crossing by bisection to under a second.
 *
 * @returns {{ at: Date, threshold: number, rising: boolean }[]} sorted by time
 */
export function findCrossings(start, end, lat, lng, thresholds = EVENT_THRESHOLDS, stepMinutes = 5) {
  const step = stepMinutes * MS_PER_MINUTE;
  const endMs = end.getTime();
  const elevationAt = (ms) => getSunElevation(new Date(ms), lat, lng);
  const crossings = [];

  let t0 = start.getTime();
  let e0 = elevationAt(t0);
  while (t0 < endMs) {
    const t1 = Math.min(t0 + step, endMs);
    const e1 = elevationAt(t1);
    for (const threshold of thresholds) {
      const below0 = e0 < threshold;
      if (below0 === e1 < threshold) continue;
      let a = t0;
      let b = t1;
      while (b - a > 500) {
        const mid = (a + b) / 2;
        if (elevationAt(mid) < threshold === below0) a = mid;
        else b = mid;
      }
      crossings.push({ at: new Date(Math.round((a + b) / 2)), threshold, rising: below0 });
    }
    t0 = t1;
    e0 = e1;
  }
  return crossings.sort((x, y) => x.at - y.at);
}

/**
 * Split [start, end) into contiguous segments of night / blue hour / golden hour / day.
 * @returns {{ phase: string, start: Date, end: Date }[]}
 */
export function getPhaseSegments(start, end, lat, lng) {
  const boundaries = findCrossings(start, end, lat, lng, PHASE_THRESHOLDS).map((c) => c.at.getTime());
  const points = [start.getTime(), ...boundaries, end.getTime()];
  const segments = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const [a, b] = [points[i], points[i + 1]];
    if (b <= a) continue;
    const phase = getPhase(getSunElevation(new Date((a + b) / 2), lat, lng));
    const previous = segments[segments.length - 1];
    if (previous && previous.phase === phase) previous.end = new Date(b);
    else segments.push({ phase, start: new Date(a), end: new Date(b) });
  }
  return segments;
}

export const EVENT = Object.freeze({
  SUNRISE: 'sunrise',
  SUNSET: 'sunset',
  GOLDEN_HOUR_START: 'goldenHourStart',
  GOLDEN_HOUR_END: 'goldenHourEnd',
  BLUE_HOUR_START: 'blueHourStart',
  NIGHT_START: 'nightStart',
});

function classifyCrossing({ threshold, rising }) {
  switch (threshold) {
    case ELEVATION.GOLDEN_UPPER:
      return rising ? EVENT.GOLDEN_HOUR_END : EVENT.GOLDEN_HOUR_START;
    case ELEVATION.SUNRISE:
      return rising ? EVENT.SUNRISE : EVENT.SUNSET;
    case ELEVATION.GOLDEN_LOWER:
      return rising ? EVENT.GOLDEN_HOUR_START : EVENT.BLUE_HOUR_START;
    default:
      return rising ? EVENT.BLUE_HOUR_START : EVENT.NIGHT_START;
  }
}

/**
 * Elevation sampled at a fixed step across [start, end], always including `end`.
 * @returns {{ t: number, elevation: number }[]} t in epoch ms
 */
export function sampleElevations(start, end, lat, lng, stepMinutes = 10) {
  const step = stepMinutes * MS_PER_MINUTE;
  const samples = [];
  for (let t = start.getTime(); t < end.getTime(); t += step) {
    samples.push({ t, elevation: getSunElevation(new Date(t), lat, lng) });
  }
  samples.push({ t: end.getTime(), elevation: getSunElevation(end, lat, lng) });
  return samples;
}

/**
 * The next change in light after `now`, looking up to `horizonHours` ahead.
 * @returns {{ type: string, at: Date } | null} null when nothing changes (polar day or night)
 */
export function getNextEvent(now, lat, lng, horizonHours = 48) {
  const end = new Date(now.getTime() + horizonHours * MS_PER_HOUR);
  const [first] = findCrossings(now, end, lat, lng, EVENT_THRESHOLDS);
  return first ? { type: classifyCrossing(first), at: first.at } : null;
}
