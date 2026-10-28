import { toJulianCentury, toJulianDay } from './julian.js';
import { deg, mod, rad } from './math.js';

/**
 * Sun's declination and the equation of time for an instant,
 * following the NOAA Solar Calculator equations (Meeus, "Astronomical Algorithms").
 *
 * @param {Date} date
 * @returns {{ declination: number, equationOfTime: number }}
 *   declination in degrees, equation of time in minutes.
 */
export function getSolarParameters(date) {
  const t = toJulianCentury(toJulianDay(date));

  // Geometric mean longitude and mean anomaly of the sun (degrees).
  const meanLongitude = mod(280.46646 + t * (36000.76983 + t * 0.0003032), 360);
  const meanAnomaly = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);

  const m = rad(meanAnomaly);
  const equationOfCentre =
    Math.sin(m) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * m) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * m) * 0.000289;

  const trueLongitude = meanLongitude + equationOfCentre;
  const omega = rad(125.04 - 1934.136 * t);
  const apparentLongitude = trueLongitude - 0.00569 - 0.00478 * Math.sin(omega);

  const meanObliquity = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const obliquity = meanObliquity + 0.00256 * Math.cos(omega);

  const declination = deg(Math.asin(Math.sin(rad(obliquity)) * Math.sin(rad(apparentLongitude))));

  const y = Math.tan(rad(obliquity) / 2) ** 2;
  const l0 = rad(meanLongitude);
  const equationOfTime =
    4 *
    deg(
      y * Math.sin(2 * l0) -
        2 * eccentricity * Math.sin(m) +
        4 * eccentricity * y * Math.sin(m) * Math.cos(2 * l0) -
        0.5 * y * y * Math.sin(4 * l0) -
        1.25 * eccentricity * eccentricity * Math.sin(2 * m),
    );

  return { declination, equationOfTime };
}
