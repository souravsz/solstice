import { MAX_LATITUDE } from './constants.js';

const DEG_TO_RAD = Math.PI / 180;

export const rad = (degrees) => degrees * DEG_TO_RAD;
export const deg = (radians) => radians / DEG_TO_RAD;

/** Positive modulo: mod(-1, 360) === 359. */
export const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const clampLatitude = (lat) => clamp(lat, -MAX_LATITUDE, MAX_LATITUDE);
