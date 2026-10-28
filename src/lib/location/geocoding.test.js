import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CITIES } from '../../data/cities.js';
import { GeocodingError, clearGeocodingCache, normalizePlace, searchPlaces } from './geocoding.js';
import { isValidLocation, locationFromCity, locationFromPlace } from './locations.js';
import { mergePlaceResults } from './search.js';

const THALASSERY = {
  id: 1254780,
  name: 'Thalassery',
  latitude: 11.74811,
  longitude: 75.4929,
  timezone: 'Asia/Kolkata',
  population: 97201,
  country: 'India',
  admin1: 'Kerala',
};

const okResponse = (body) => ({ ok: true, json: async () => body });

beforeEach(() => clearGeocodingCache());

describe('normalizePlace', () => {
  it('reshapes a valid result', () => {
    expect(normalizePlace(THALASSERY)).toEqual({
      id: 'geonames-1254780',
      name: 'Thalassery',
      region: 'Kerala',
      country: 'India',
      lat: 11.74811,
      lng: 75.4929,
      timeZone: 'Asia/Kolkata',
      population: 97201,
    });
  });

  it('drops incomplete or invalid results', () => {
    expect(normalizePlace(null)).toBeNull();
    expect(normalizePlace({ ...THALASSERY, name: ' ' })).toBeNull();
    expect(normalizePlace({ ...THALASSERY, latitude: 120 })).toBeNull();
    expect(normalizePlace({ ...THALASSERY, timezone: 'Nowhere/Land' })).toBeNull();
    expect(normalizePlace({ ...THALASSERY, timezone: undefined })).toBeNull();
  });

  it('becomes a valid saved location', () => {
    const location = locationFromPlace(normalizePlace(THALASSERY));
    expect(location).toMatchObject({ name: 'Thalassery', detail: 'Kerala, India', timeZone: 'Asia/Kolkata' });
    expect(isValidLocation(location)).toBe(true);
  });
});

describe('searchPlaces', () => {
  it('queries the API, filters bad rows and caches by query', async () => {
    const fetchImpl = vi.fn(async () => okResponse({ results: [THALASSERY, { id: 2, name: 'Broken' }] }));
    const first = await searchPlaces('Thalassery', { fetchImpl });
    expect(first.map((p) => p.name)).toEqual(['Thalassery']);
    const url = new URL(fetchImpl.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://geocoding-api.open-meteo.com/v1/search');
    expect(url.searchParams.get('name')).toBe('Thalassery');

    await searchPlaces('  thalassery ', { fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('skips the network for very short queries', async () => {
    const fetchImpl = vi.fn();
    expect(await searchPlaces('k', { fetchImpl })).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns an empty list when nothing matches', async () => {
    expect(await searchPlaces('zzqx', { fetchImpl: async () => okResponse({}) })).toEqual([]);
  });

  it('reports offline and server failures, and passes aborts through', async () => {
    const offline = async () => {
      throw new TypeError('Failed to fetch');
    };
    await expect(searchPlaces('Kannur', { fetchImpl: offline })).rejects.toMatchObject({ code: 'network' });
    await expect(
      searchPlaces('Kannur', { fetchImpl: async () => ({ ok: false, json: async () => ({}) }) }),
    ).rejects.toBeInstanceOf(GeocodingError);
    const aborted = async () => {
      throw new DOMException('Aborted', 'AbortError');
    };
    await expect(searchPlaces('Kannur', { fetchImpl: aborted })).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('mergePlaceResults', () => {
  it('keeps built-in cities first and removes worldwide duplicates', () => {
    const lisbon = locationFromCity(CITIES.find((c) => c.name === 'Lisbon'));
    const onlineLisbon = locationFromPlace(
      normalizePlace({ ...THALASSERY, id: 2267057, name: 'Lisbon', latitude: 38.71, longitude: -9.13, timezone: 'Europe/Lisbon' }),
    );
    const lisbonOhio = { ...onlineLisbon, id: 'place:geonames-5161262', lat: 40.77, lng: -80.77 };
    const merged = mergePlaceResults([lisbon], [onlineLisbon, lisbonOhio]);
    expect(merged.map((l) => l.id)).toEqual([lisbon.id, lisbonOhio.id]);
  });
});
