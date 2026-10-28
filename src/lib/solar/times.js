import { ELEVATION, MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE } from './constants.js';
import { getSolarParameters } from './orbit.js';
import { getSunElevation } from './position.js';
import { clampLatitude, deg, rad } from './math.js';
import { civilDateOf, getDeviceTimeZone, getZonedParts, zonedTimeToUtc } from '../time/zoned.js';

/** Solar noon (UTC ms) for the UTC calendar day starting at `dayStartUtc`. */
function solarNoonForUtcDay(dayStartUtc, lng) {
  let noon = dayStartUtc + (720 - 4 * lng) * MS_PER_MINUTE;
  for (let i = 0; i < 3; i += 1) {
    const { equationOfTime } = getSolarParameters(new Date(noon));
    noon = dayStartUtc + (720 - 4 * lng - equationOfTime) * MS_PER_MINUTE;
  }
  return noon;
}

/**
 * The solar noon that belongs to a civil day: the one closest to local clock noon.
 * Choosing by proximity (instead of assuming the UTC date) keeps places such as
 * Kiribati (UTC+14) or Samoa on the correct calendar day.
 */
function findSolarNoon(localNoonMs, lng) {
  const utc = new Date(localNoonMs);
  const baseDay = Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
  let best = null;
  for (const offset of [-1, 0, 1]) {
    const dayStartUtc = baseDay + offset * MS_PER_DAY;
    const noon = solarNoonForUtcDay(dayStartUtc, lng);
    if (best === null || Math.abs(noon - localNoonMs) < Math.abs(best.noon - localNoonMs)) {
      best = { noon, dayStartUtc };
    }
  }
  return best;
}

/** cos of the hour angle at which the sun reaches `elevation`. Outside [-1, 1] means "never". */
function cosHourAngle(elevation, lat, declination) {
  const latR = rad(lat);
  const decR = rad(declination);
  return (Math.sin(rad(elevation)) - Math.sin(latR) * Math.sin(decR)) / (Math.cos(latR) * Math.cos(decR));
}

/**
 * Time the sun crosses `elevation` before (direction −1) or after (+1) solar noon.
 * Iterates so declination and equation of time are evaluated at the event itself.
 * @returns {Date|null}
 */
function crossingTime({ noon, dayStartUtc }, lat, lng, elevation, direction) {
  let t = noon;
  for (let i = 0; i < 6; i += 1) {
    const { declination, equationOfTime } = getSolarParameters(new Date(t));
    const cosH = cosHourAngle(elevation, lat, declination);
    if (cosH < -1 || cosH > 1) return null;
    const hourAngle = deg(Math.acos(cosH));
    const transit = dayStartUtc + (720 - 4 * lng - equationOfTime) * MS_PER_MINUTE;
    const next = transit + direction * hourAngle * 4 * MS_PER_MINUTE;
    const converged = Math.abs(next - t) < 500;
    t = next;
    if (converged) break;
  }
  return new Date(Math.round(t));
}

const range = (start, end) => ({ start, end });

/**
 * Sun events for the calendar day that contains `date` in `timeZone`.
 *
 * All instants are JavaScript Dates (absolute UTC instants). Events that do not
 * happen that day (polar day/night, white nights) are `null`.
 *
 * @param {Date} date any instant within the wanted day
 * @param {number} lat latitude, degrees north
 * @param {number} lng longitude, degrees east
 * @param {{ timeZone?: string }} [options] defaults to the device time zone
 */
export function getSunTimes(date, lat, lng, options = {}) {
  const timeZone = options.timeZone ?? getDeviceTimeZone();
  const latitude = clampLatitude(lat);
  const civil = getZonedParts(date, timeZone);
  const localNoon = zonedTimeToUtc({ year: civil.year, month: civil.month, day: civil.day, hour: 12 }, timeZone);
  const noonInfo = findSolarNoon(localNoon.getTime(), lng);

  const morning = (elevation) => crossingTime(noonInfo, latitude, lng, elevation, -1);
  const evening = (elevation) => crossingTime(noonInfo, latitude, lng, elevation, 1);

  const solarNoon = new Date(Math.round(noonInfo.noon));
  const noonElevation = getSunElevation(solarNoon, latitude, lng);
  const nadirElevation = Math.min(
    getSunElevation(new Date(noonInfo.noon - 12 * MS_PER_HOUR), latitude, lng),
    getSunElevation(new Date(noonInfo.noon + 12 * MS_PER_HOUR), latitude, lng),
  );

  const sunrise = morning(ELEVATION.SUNRISE);
  const sunset = evening(ELEVATION.SUNRISE);
  const dawn = morning(ELEVATION.CIVIL);
  const dusk = evening(ELEVATION.CIVIL);
  const goldenHourMorningStart = morning(ELEVATION.GOLDEN_LOWER);
  const goldenHourMorningEnd = morning(ELEVATION.GOLDEN_UPPER);
  const goldenHourEveningStart = evening(ELEVATION.GOLDEN_UPPER);
  const goldenHourEveningEnd = evening(ELEVATION.GOLDEN_LOWER);

  const noEvents = sunrise === null && sunset === null;
  const alwaysUp = noEvents && nadirElevation > ELEVATION.SUNRISE;
  const alwaysDown = noEvents && noonElevation < ELEVATION.SUNRISE;

  let dayLength = 0;
  if (sunrise && sunset) dayLength = sunset.getTime() - sunrise.getTime();
  else if (alwaysUp) dayLength = MS_PER_DAY;

  return {
    date: civilDateOf(localNoon, timeZone),
    timeZone,
    solarNoon,
    noonElevation,
    nadirElevation,
    sunrise,
    sunset,
    dawn,
    dusk,
    goldenHourMorningStart,
    goldenHourMorningEnd,
    goldenHourEveningStart,
    goldenHourEveningEnd,
    goldenHourMorning: range(goldenHourMorningStart, goldenHourMorningEnd),
    goldenHourEvening: range(goldenHourEveningStart, goldenHourEveningEnd),
    blueHourMorning: range(dawn, goldenHourMorningStart),
    blueHourEvening: range(goldenHourEveningEnd, dusk),
    dayLength,
    alwaysUp,
    alwaysDown,
  };
}
