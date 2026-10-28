import { minutesIntoDay } from '../time/zoned.js';

/**
 * Short notes comparing a day with the one after it, e.g. "1 min later tomorrow".
 */

function formatMinutes(totalMinutes) {
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} s`;
  return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} s`;
}

/** Clock-time shift of an event, in minutes (positive = later the next day). */
export function clockShiftMinutes(today, tomorrow, timeZone) {
  let diff = minutesIntoDay(tomorrow, timeZone) - minutesIntoDay(today, timeZone);
  // Events can wrap past midnight at high latitudes; take the shortest way round.
  if (diff > 720) diff -= 1440;
  if (diff < -720) diff += 1440;
  return diff;
}

/** Short note for one event, e.g. "1 min later tomorrow". */
function shortEventShift(event, today, next, timeZone, when) {
  const a = today[event];
  const b = next[event];
  if (a && b) {
    const diff = clockShiftMinutes(a, b, timeZone);
    if (Math.abs(diff) < 0.5) return `Same time ${when}`;
    return `${formatMinutes(Math.abs(diff))} ${diff > 0 ? 'later' : 'earlier'} ${when}`;
  }
  if (!a && b) return `${event === 'sunrise' ? 'Rises' : 'Sets'} again ${when}`;
  if (a && !b) {
    if (next.alwaysUp) return event === 'sunrise' ? `Up all day ${when}` : `Doesn’t set ${when}`;
    if (next.alwaysDown) return event === 'sunrise' ? `Doesn’t rise ${when}` : `Stays down ${when}`;
    return `No ${event} ${when}`;
  }
  return null;
}

/**
 * Compact notes that sit under each time in the summary.
 * @param {{ sunrise: Date|null, sunset: Date|null, dayLength: number, alwaysUp: boolean, alwaysDown: boolean }} today
 * @param {typeof today} next the following day
 * @param {string} timeZone
 * @param {'tomorrow' | 'nextDay'} [wording]
 * @returns {{ sunrise: string | null, sunset: string | null, dayLength: string | null }}
 */
export function describeShortChanges(today, next, timeZone, wording = 'tomorrow') {
  const when = wording === 'tomorrow' ? 'tomorrow' : 'next day';
  let dayLength = null;
  if (today.sunrise && today.sunset && next.sunrise && next.sunset) {
    const diffSeconds = Math.round((next.dayLength - today.dayLength) / 1000);
    dayLength =
      Math.abs(diffSeconds) < 1
        ? `Same length ${when}`
        : `${formatSeconds(Math.abs(diffSeconds))} ${diffSeconds > 0 ? 'longer' : 'shorter'} ${when}`;
  }
  return {
    sunrise: shortEventShift('sunrise', today, next, timeZone, when),
    sunset: shortEventShift('sunset', today, next, timeZone, when),
    dayLength,
  };
}
