import { MS_PER_DAY, MS_PER_MINUTE } from './constants.js';
import { getSolarParameters } from './orbit.js';
import { clamp, clampLatitude, deg, mod, rad } from './math.js';

/**
 * Approximate atmospheric refraction in degrees for a geometric elevation (NOAA).
 * @param {number} elevation degrees
 */
export function atmosphericRefraction(elevation) {
  if (elevation > 85) return 0;
  const te = Math.tan(rad(elevation));
  let arcSeconds;
  if (elevation > 5) {
    arcSeconds = 58.1 / te - 0.07 / te ** 3 + 0.000086 / te ** 5;
  } else if (elevation > -0.575) {
    arcSeconds = 1735 + elevation * (-518.2 + elevation * (103.4 + elevation * (-12.79 + elevation * 0.711)));
  } else {
    arcSeconds = -20.774 / te;
  }
  return arcSeconds / 3600;
}

/**
 * Position of the sun in the sky.
 *
 * `elevation` is geometric (no refraction) so it lines up with the phase thresholds,
 * which already account for refraction where it matters (sunrise uses −0.833°).
 * `apparentElevation` adds refraction and matches what NOAA's calculator displays.
 *
 * @param {Date} date
 * @param {number} lat latitude in degrees (north positive)
 * @param {number} lng longitude in degrees (east positive)
 * @returns {{ elevation: number, apparentElevation: number, azimuth: number }}
 *   degrees; azimuth is measured clockwise from north.
 */
export function getSunPosition(date, lat, lng) {
  const { declination, equationOfTime } = getSolarParameters(date);
  const utcMinutes = mod(date.getTime(), MS_PER_DAY) / MS_PER_MINUTE;
  const trueSolarTime = mod(utcMinutes + equationOfTime + 4 * lng, 1440);
  const hourAngle = trueSolarTime / 4 - 180;

  const latR = rad(clampLatitude(lat));
  const decR = rad(declination);

  const cosZenith = clamp(
    Math.sin(latR) * Math.sin(decR) + Math.cos(latR) * Math.cos(decR) * Math.cos(rad(hourAngle)),
    -1,
    1,
  );
  const zenith = deg(Math.acos(cosZenith));
  const elevation = 90 - zenith;

  const denominator = Math.cos(latR) * Math.sin(rad(zenith));
  let azimuth;
  if (Math.abs(denominator) < 1e-12) {
    // Sun exactly overhead: azimuth is undefined, report due south/north.
    azimuth = lat >= 0 ? 180 : 0;
  } else {
    const cosAzimuth = clamp((Math.sin(latR) * cosZenith - Math.sin(decR)) / denominator, -1, 1);
    const angle = deg(Math.acos(cosAzimuth));
    azimuth = hourAngle > 0 ? mod(angle + 180, 360) : mod(540 - angle, 360);
  }

  return {
    elevation,
    apparentElevation: elevation + atmosphericRefraction(elevation),
    azimuth,
  };
}

/** Geometric elevation only; a small convenience for sampling loops. */
export const getSunElevation = (date, lat, lng) => getSunPosition(date, lat, lng).elevation;
