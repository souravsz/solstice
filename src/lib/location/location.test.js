import { describe, expect, it, vi } from 'vitest';
import { CITIES } from '../../data/cities.js';
import { isValidTimeZone } from '../time/zoned.js';
import { distanceKm, formatCoordinates, parseCoordinate, validateCoordinate } from './coordinates.js';
import { GeolocationError, getCurrentPosition } from './geolocation.js';
import {
  isValidLocation,
  locationFromCity,
  locationFromCoordinates,
  locationFromGeolocation,
  solarTimeZone,
} from './locations.js';
import { searchCities } from './search.js';
import { LOCATION_STORAGE_KEY, loadLocation, saveLocation } from './storage.js';

const memoryStorage = () => {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
};

describe('city data', () => {
  it('has about 100 cities with valid, unique data', () => {
    expect(CITIES.length).toBeGreaterThanOrEqual(100);
    expect(new Set(CITIES.map((c) => c.id)).size).toBe(CITIES.length);
    for (const city of CITIES) {
      expect(city.lat).toBeGreaterThanOrEqual(-90);
      expect(city.lat).toBeLessThanOrEqual(90);
      expect(city.lng).toBeGreaterThanOrEqual(-180);
      expect(city.lng).toBeLessThanOrEqual(180);
      expect(isValidTimeZone(city.timeZone), city.timeZone).toBe(true);
    }
  });
});

describe('coordinates', () => {
  it('parses common ways of typing degrees', () => {
    expect(parseCoordinate('38.72', 'lat')).toBe(38.72);
    expect(parseCoordinate(' -9,14 ', 'lng')).toBe(-9.14);
    expect(parseCoordinate('38.72°', 'lat')).toBe(38.72);
    expect(parseCoordinate('9.14 W', 'lng')).toBe(-9.14);
    expect(parseCoordinate('33.9s', 'lat')).toBe(-33.9);
    expect(parseCoordinate('abc', 'lat')).toBeNaN();
    expect(parseCoordinate('-9.1W', 'lng')).toBeNaN();
    expect(parseCoordinate('1.2.3', 'lat')).toBeNaN();
  });

  it('validates ranges with helpful messages', () => {
    expect(validateCoordinate('45', 'lat')).toEqual({ value: 45, error: null });
    expect(validateCoordinate('', 'lat').error).toMatch(/required/);
    expect(validateCoordinate('91', 'lat').error).toMatch(/between/);
    expect(validateCoordinate('-180.5', 'lng').error).toMatch(/between/);
    expect(validateCoordinate('north', 'lng').error).toMatch(/decimal/);
    expect(validateCoordinate('180', 'lng').value).toBe(180);
  });

  it('formats and measures', () => {
    expect(formatCoordinates(38.7223, -9.1393)).toBe('38.72° N, 9.14° W');
    const london = { lat: 51.5072, lng: -0.1276 };
    const paris = { lat: 48.8566, lng: 2.3522 };
    expect(distanceKm(london, paris)).toBeGreaterThan(330);
    expect(distanceKm(london, paris)).toBeLessThan(350);
  });
});

describe('locations', () => {
  const lisbon = CITIES.find((c) => c.name === 'Lisbon');

  it('builds a location from a city', () => {
    const loc = locationFromCity(lisbon);
    expect(loc).toMatchObject({ name: 'Lisbon', detail: 'Portugal', timeZone: 'Europe/Lisbon', source: 'city' });
    expect(isValidLocation(loc)).toBe(true);
  });

  it('names a geolocated position after a nearby city and uses the device zone', () => {
    const loc = locationFromGeolocation({ latitude: 38.75, longitude: -9.2 }, CITIES, 'Europe/Lisbon');
    expect(loc.name).toBe('Near Lisbon');
    expect(loc.timeZone).toBe('Europe/Lisbon');
    const remote = locationFromGeolocation({ latitude: -48.9, longitude: -123.4 }, CITIES, 'UTC');
    expect(remote.name).toBe('My location');
  });

  it('picks a sensible time zone for typed coordinates', () => {
    expect(locationFromCoordinates(40.0, -3.5, CITIES).timeZone).toBe('Europe/Madrid');
    // Point Nemo, far from every city: fall back to a longitude-based zone.
    expect(locationFromCoordinates(-48.88, -123.39, CITIES).timeZone).toBe('Etc/GMT+8');
  });

  it('derives POSIX-style solar zones', () => {
    expect(solarTimeZone(0)).toBe('Etc/GMT');
    expect(solarTimeZone(135)).toBe('Etc/GMT-9');
    expect(solarTimeZone(-75)).toBe('Etc/GMT+5');
    expect(solarTimeZone(180)).toBe('Etc/GMT-12');
    expect(isValidTimeZone(solarTimeZone(-180))).toBe(true);
  });

  it('rejects malformed stored data', () => {
    expect(isValidLocation(null)).toBe(false);
    expect(isValidLocation({ ...locationFromCity(lisbon), lat: 200 })).toBe(false);
    expect(isValidLocation({ ...locationFromCity(lisbon), timeZone: 'Nowhere/Land' })).toBe(false);
  });
});

describe('storage', () => {
  it('round-trips a location and ignores corrupt data', () => {
    const storage = memoryStorage();
    expect(loadLocation(storage)).toBeNull();
    const loc = locationFromCity(CITIES[0]);
    expect(saveLocation(loc, storage)).toBe(true);
    expect(loadLocation(storage)).toEqual(loc);
    storage.setItem(LOCATION_STORAGE_KEY, '{not json');
    expect(loadLocation(storage)).toBeNull();
  });

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('full');
      },
    };
    expect(loadLocation(broken)).toBeNull();
    expect(saveLocation(locationFromCity(CITIES[0]), broken)).toBe(false);
  });
});

describe('search', () => {
  it('ignores accents and case, and ranks prefix matches first', () => {
    expect(searchCities(CITIES, 'sao')[0].name).toBe('São Paulo');
    expect(searchCities(CITIES, 'TROMSO')[0].name).toBe('Tromsø');
    expect(searchCities(CITIES, 'york')[0].name).toBe('New York');
    expect(searchCities(CITIES, 'japan').map((c) => c.country)).toEqual(['Japan', 'Japan', 'Japan']);
    expect(searchCities(CITIES, 'zzzz')).toEqual([]);
  });
});

describe('geolocation', () => {
  it('resolves coordinates', async () => {
    const geolocation = {
      getCurrentPosition: (ok) => ok({ coords: { latitude: 1, longitude: 2, accuracy: 30 } }),
    };
    await expect(getCurrentPosition({ geolocation, isSecureContext: true })).resolves.toEqual({
      latitude: 1,
      longitude: 2,
      accuracy: 30,
    });
  });

  it.each([
    [1, 'denied'],
    [2, 'unavailable'],
    [3, 'timeout'],
  ])('maps error code %i to %s', async (code, expected) => {
    const geolocation = { getCurrentPosition: (_ok, fail) => fail({ code }) };
    const error = await getCurrentPosition({ geolocation, isSecureContext: true }).catch((e) => e);
    expect(error).toBeInstanceOf(GeolocationError);
    expect(error.code).toBe(expected);
    expect(error.message.length).toBeGreaterThan(10);
  });

  it('reports unsupported and insecure environments', async () => {
    await expect(getCurrentPosition({ isSecureContext: true })).rejects.toMatchObject({ code: 'unsupported' });
    const geolocation = { getCurrentPosition: vi.fn() };
    await expect(getCurrentPosition({ geolocation, isSecureContext: false })).rejects.toMatchObject({
      code: 'insecure',
    });
    expect(geolocation.getCurrentPosition).not.toHaveBeenCalled();
  });
});
