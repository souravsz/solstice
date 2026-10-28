import { isValidLatitude, isValidLongitude } from './coordinates.js';
import { isValidTimeZone } from '../time/zoned.js';

/**
 * Worldwide place search using the free Open-Meteo Geocoding API (data from GeoNames, CC BY 4.0).
 * https://open-meteo.com/en/docs/geocoding-api
 *
 * Only the typed search text is sent. Sun calculations never need the network.
 */

export const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/** The API returns nothing for one-character searches. */
export const MIN_QUERY_LENGTH = 2;

const MAX_CACHE_ENTRIES = 100;
const cache = new Map();

export class GeocodingError extends Error {
  /** @param {'network' | 'server'} code */
  constructor(code, message) {
    super(message);
    this.name = 'GeocodingError';
    this.code = code;
  }
}

const text = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * Checks and reshapes one API result. Returns null for anything incomplete,
 * so bad data from the network never reaches the app.
 * @returns {{ id: string, name: string, region: string, country: string, lat: number, lng: number, timeZone: string, population: number } | null}
 */
export function normalizePlace(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = text(raw.name);
  if (!Number.isFinite(raw.id) || !name) return null;
  if (!isValidLatitude(raw.latitude) || !isValidLongitude(raw.longitude)) return null;
  if (!isValidTimeZone(raw.timezone)) return null;
  return {
    id: `geonames-${raw.id}`,
    name,
    region: text(raw.admin1),
    country: text(raw.country),
    lat: raw.latitude,
    lng: raw.longitude,
    timeZone: raw.timezone,
    population: Number.isFinite(raw.population) ? raw.population : 0,
  };
}

export function clearGeocodingCache() {
  cache.clear();
}

/**
 * @param {string} query
 * @param {{ signal?: AbortSignal, fetchImpl?: typeof fetch, count?: number }} [options]
 * @returns {Promise<ReturnType<typeof normalizePlace>[]>} AbortError is re-thrown as-is
 */
export async function searchPlaces(query, { signal, fetchImpl = globalThis.fetch, count = 20 } = {}) {
  const q = String(query ?? '').trim();
  if (q.length < MIN_QUERY_LENGTH) return [];

  const key = q.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  const url = new URL(GEOCODING_URL);
  url.search = new URLSearchParams({ name: q, count: String(count), language: 'en', format: 'json' }).toString();

  let response;
  try {
    response = await fetchImpl(url.toString(), { signal });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new GeocodingError('network', 'World city search needs an internet connection.');
  }
  if (!response.ok) throw new GeocodingError('server', 'World city search is unavailable right now.');

  const body = await response.json().catch(() => null);
  const results = Array.isArray(body?.results) ? body.results.map(normalizePlace).filter(Boolean) : [];

  if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value);
  cache.set(key, results);
  return results;
}
