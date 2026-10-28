import { MS_PER_MINUTE } from '../solar/constants.js';
import { diffCivilDays, parseCivilDate } from './zoned.js';

/**
 * Locale-aware formatting. `locale` defaults to the user's locale, so 12h/24h
 * and date order follow their settings automatically.
 */

const cache = new Map();

function getFormatter(locale, options) {
  const key = `${locale ?? ''}|${JSON.stringify(options)}`;
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    cache.set(key, formatter);
  }
  return formatter;
}

const timeOptions = (timeZone) => ({ hour: 'numeric', minute: '2-digit', timeZone });

export function formatTime(date, timeZone, locale) {
  return getFormatter(locale, timeOptions(timeZone)).format(date);
}

/** Splits "5:42 PM" into { time: '5:42', period: 'PM' } so the period can be styled smaller. */
export function formatTimeParts(date, timeZone, locale) {
  const parts = getFormatter(locale, timeOptions(timeZone)).formatToParts(date);
  const period = parts.find((p) => p.type === 'dayPeriod')?.value ?? null;
  const time = parts
    .filter((p) => p.type !== 'dayPeriod')
    .map((p) => p.value)
    .join('')
    .trim();
  return { time, period };
}

/** "6:41 – 7:24 AM" using Intl's range formatting when available. */
export function formatTimeRange(start, end, timeZone, locale) {
  const formatter = getFormatter(locale, timeOptions(timeZone));
  if (typeof formatter.formatRange === 'function') return formatter.formatRange(start, end);
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

/** "11h 24m", "45m", "24h". Rounds to the nearest minute. */
export function formatDuration(ms) {
  const totalMinutes = Math.max(0, Math.round(ms / MS_PER_MINUTE));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Spoken form for screen readers: "11 hours 24 minutes". */
export function formatDurationLong(ms) {
  const totalMinutes = Math.max(0, Math.round(ms / MS_PER_MINUTE));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const h = hours === 1 ? '1 hour' : `${hours} hours`;
  const m = minutes === 1 ? '1 minute' : `${minutes} minutes`;
  if (hours === 0) return m;
  if (minutes === 0) return h;
  return `${h} ${m}`;
}

/** A civil date as a Date at UTC noon, so formatting with timeZone 'UTC' shows that exact day. */
const civilAsUtcNoon = (civilDate) => {
  const { year, month, day } = parseCivilDate(civilDate);
  return new Date(Date.UTC(year, month - 1, day, 12));
};

/** "Tuesday 27 October", adding the year when it isn't the reference year. */
export function formatDateHeading(civilDate, referenceCivilDate, locale) {
  const sameYear = civilDate.slice(0, 4) === referenceCivilDate?.slice(0, 4);
  return getFormatter(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
    timeZone: 'UTC',
  }).format(civilAsUtcNoon(civilDate));
}

export function formatDateShort(civilDate, locale) {
  return getFormatter(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    civilAsUtcNoon(civilDate),
  );
}

/** "Today", "Tomorrow", "In 3 days", "2 days ago". */
export function formatRelativeDay(civilDate, todayCivilDate, locale) {
  const days = diffCivilDays(todayCivilDate, civilDate);
  const text = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(days, 'day');
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

/** "GMT+1" style offset for a zone at an instant. */
export function formatTimeZoneOffset(date, timeZone, locale) {
  for (const timeZoneName of ['shortOffset', 'short']) {
    try {
      const parts = getFormatter(locale, { timeZone, timeZoneName, hour: 'numeric' }).formatToParts(date);
      const name = parts.find((p) => p.type === 'timeZoneName')?.value;
      if (name) return name;
    } catch {
      // Older engines do not support 'shortOffset'; try the next style.
    }
  }
  return timeZone;
}

/** "Europe/Lisbon" → "Lisbon"; "America/Argentina/Buenos_Aires" → "Buenos Aires". */
export function timeZoneCity(timeZone) {
  const last = timeZone.split('/').pop() ?? timeZone;
  return last.replace(/_/g, ' ');
}
