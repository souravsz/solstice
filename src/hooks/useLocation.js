import { useCallback, useRef, useState } from 'react';
import { CITIES } from '../data/cities.js';
import { getCurrentPosition } from '../lib/location/geolocation.js';
import {
  isValidLocation,
  locationFromCity,
  locationFromCoordinates,
  locationFromGeolocation,
} from '../lib/location/locations.js';
import { loadLocation, saveLocation } from '../lib/location/storage.js';

/**
 * The chosen location, persisted in localStorage.
 * Supports picking a city, typing coordinates, or asking the browser for the position.
 */
export function useLocation() {
  const [location, setLocationState] = useState(loadLocation);
  const [geoStatus, setGeoStatus] = useState({ state: 'idle', message: null });
  // Bumped on every choice so a slow geolocation answer can't overwrite a newer pick.
  const choiceId = useRef(0);

  const commit = useCallback((next) => {
    choiceId.current += 1;
    setLocationState(next);
    saveLocation(next);
    return next;
  }, []);

  const chooseCity = useCallback((city) => commit(locationFromCity(city)), [commit]);

  /** A location already built by the search (built-in or worldwide). */
  const chooseLocation = useCallback((next) => (isValidLocation(next) ? commit(next) : null), [commit]);

  const chooseCoordinates = useCallback(
    (lat, lng) => commit(locationFromCoordinates(lat, lng, CITIES)),
    [commit],
  );

  /** @returns {Promise<object | null>} the new location, or null if it failed or was superseded */
  const locate = useCallback(async () => {
    const id = choiceId.current;
    setGeoStatus({ state: 'locating', message: null });
    try {
      const position = await getCurrentPosition();
      if (choiceId.current !== id) return null;
      setGeoStatus({ state: 'idle', message: null });
      return commit(locationFromGeolocation(position, CITIES));
    } catch (error) {
      if (choiceId.current === id) {
        setGeoStatus({ state: 'error', message: error?.message ?? 'Your position couldn’t be found.' });
      }
      return null;
    }
  }, [commit]);

  const clearGeoStatus = useCallback(() => setGeoStatus({ state: 'idle', message: null }), []);

  return { location, chooseCity, chooseLocation, chooseCoordinates, locate, geoStatus, clearGeoStatus };
}
