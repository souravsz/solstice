/**
 * Time-zone helpers built on Intl only (no tz database shipped with the app).
 *
 * A "civil date" is a plain 'YYYY-MM-DD' string: a calendar day in some time zone,
 * independent of any particular instant. It matches the value of <input type="date">.
 */

const partsFormatters = new Map();

function getPartsFormatter(timeZone) {
  let formatter = partsFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    partsFormatters.set(timeZone, formatter);
  }
  return formatter;
}

export function getDeviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function isValidTimeZone(timeZone) {
  if (typeof timeZone !== 'string' || timeZone.length === 0) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Wall-clock fields of an instant in a time zone. Month is 1–12. */
export function getZonedParts(date, timeZone) {
  const fields = {};
  for (const part of getPartsFormatter(timeZone).formatToParts(date)) {
    if (part.type !== 'literal') fields[part.type] = part.value;
  }
  return {
    year: Number(fields.year),
    month: Number(fields.month),
    day: Number(fields.day),
    hour: Number(fields.hour) % 24,
    minute: Number(fields.minute),
    second: Number(fields.second),
  };
}

/** Offset of the time zone from UTC at an instant, in milliseconds (east positive). */
export function getTimeZoneOffsetMs(date, timeZone) {
  const p = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const wholeSeconds = Math.floor(date.getTime() / 1000) * 1000;
  return asUtc - wholeSeconds;
}

/**
 * The instant at which a wall-clock time occurs in a time zone.
 * Ambiguous times (clocks going back) resolve to the first occurrence;
 * times inside a gap (clocks going forward) resolve to the moment just after the gap.
 */
export function zonedTimeToUtc({ year, month, day, hour = 0, minute = 0, second = 0 }, timeZone) {
  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset1 = getTimeZoneOffsetMs(new Date(wall), timeZone);
  const first = wall - offset1;
  const offset2 = getTimeZoneOffsetMs(new Date(first), timeZone);
  if (offset1 === offset2) return new Date(first);

  const second2 = wall - offset2;
  const offset3 = getTimeZoneOffsetMs(new Date(second2), timeZone);
  if (offset3 === offset2) return new Date(second2);

  // The wall time does not exist (DST gap); use the instant the gap ends.
  return new Date(Math.max(first, second2));
}

const pad = (value, length = 2) => String(value).padStart(length, '0');

export const formatCivilDate = ({ year, month, day }) => `${pad(year, 4)}-${pad(month)}-${pad(day)}`;

/** Parse 'YYYY-MM-DD' into fields, or null if it is not a real calendar date. */
export function parseCivilDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

/** Civil date of an instant in a time zone. */
export function civilDateOf(date, timeZone) {
  return formatCivilDate(getZonedParts(date, timeZone));
}

export function addCivilDays(civilDate, days) {
  const { year, month, day } = parseCivilDate(civilDate);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return formatCivilDate({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  });
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function diffCivilDays(from, to) {
  const a = parseCivilDate(from);
  const b = parseCivilDate(to);
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86400000);
}

/** First and last instants of a civil day. Days can be 23 or 25 hours long around DST changes. */
export function civilDayBounds(civilDate, timeZone) {
  const fields = parseCivilDate(civilDate);
  const start = zonedTimeToUtc({ ...fields, hour: 0 }, timeZone);
  const end = zonedTimeToUtc({ ...parseCivilDate(addCivilDays(civilDate, 1)), hour: 0 }, timeZone);
  return { start, end };
}

/** Local noon of a civil day: a safe representative instant for "that day". */
export function civilNoon(civilDate, timeZone) {
  return zonedTimeToUtc({ ...parseCivilDate(civilDate), hour: 12 }, timeZone);
}

/** Minutes since local midnight (wall clock) for an instant. */
export function minutesIntoDay(date, timeZone) {
  const p = getZonedParts(date, timeZone);
  return p.hour * 60 + p.minute + p.second / 60;
}
