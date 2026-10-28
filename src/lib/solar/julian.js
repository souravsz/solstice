import { MS_PER_DAY } from './constants.js';

/** Julian day of the Unix epoch (1970-01-01T00:00:00Z). */
const JD_UNIX_EPOCH = 2440587.5;
/** Julian day of the J2000.0 epoch (2000-01-01T12:00:00 TT). */
const JD_J2000 = 2451545;

/** Julian day number (with fraction) for a JavaScript Date. */
export const toJulianDay = (date) => date.getTime() / MS_PER_DAY + JD_UNIX_EPOCH;

/** Julian centuries since J2000.0. */
export const toJulianCentury = (julianDay) => (julianDay - JD_J2000) / 36525;
