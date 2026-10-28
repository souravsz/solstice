/** Parsing, validation and formatting of latitude/longitude. */

/**
 * Parse a coordinate typed by a person: accepts "38.72", "-9,14", "38.72°", "9.14 W".
 * @returns {number} NaN when the text is not a number
 */
export function parseCoordinate(input, axis) {
  if (typeof input === 'number') return input;
  let text = String(input ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace('°', '')
    .replace(',', '.')
    .toUpperCase();
  let sign = 1;
  const hemisphere = text.at(-1);
  const negative = axis === 'lat' ? 'S' : 'W';
  const positive = axis === 'lat' ? 'N' : 'E';
  if (hemisphere === negative || hemisphere === positive) {
    sign = hemisphere === negative ? -1 : 1;
    text = text.slice(0, -1);
    if (text.startsWith('-')) return Number.NaN; // "-9.1W" is contradictory
  }
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(text)) return Number.NaN;
  return sign * Number(text);
}

const LIMITS = { lat: 90, lng: 180 };
const NAMES = { lat: 'Latitude', lng: 'Longitude' };

/** @returns {{ value: number | null, error: string | null }} */
export function validateCoordinate(input, axis) {
  if (String(input ?? '').trim() === '') return { value: null, error: `${NAMES[axis]} is required` };
  const value = parseCoordinate(input, axis);
  if (Number.isNaN(value)) return { value: null, error: 'Use decimal degrees, like 38.72' };
  const limit = LIMITS[axis];
  if (value < -limit || value > limit) {
    return { value: null, error: `${NAMES[axis]} must be between −${limit} and ${limit}` };
  }
  return { value, error: null };
}

export const isValidLatitude = (v) => typeof v === 'number' && Number.isFinite(v) && v >= -90 && v <= 90;
export const isValidLongitude = (v) => typeof v === 'number' && Number.isFinite(v) && v >= -180 && v <= 180;

/** "38.72° N, 9.14° W" */
export function formatCoordinates(lat, lng, digits = 2) {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(digits)}° ${ns}, ${Math.abs(lng).toFixed(digits)}° ${ew}`;
}

/** Great-circle distance in kilometres. */
export function distanceKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** @returns {{ city: object, distanceKm: number } | null} */
export function findNearestCity(point, cities) {
  let best = null;
  for (const city of cities) {
    const d = distanceKm(point, city);
    if (!best || d < best.distanceKm) best = { city, distanceKm: d };
  }
  return best;
}
