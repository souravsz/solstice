import { useEffect, useMemo, useState } from 'react';
import { CITIES } from '../data/cities.js';
import { MIN_QUERY_LENGTH, searchPlaces } from '../lib/location/geocoding.js';
import { locationFromCity, locationFromPlace } from '../lib/location/locations.js';
import { mergePlaceResults, searchCities } from '../lib/location/search.js';

const DEBOUNCE_MS = 250;

/**
 * City search: built-in cities appear instantly (and offline), worldwide results
 * from Open-Meteo follow once typing pauses.
 * @param {string} query
 */
export function usePlaceSearch(query) {
  const trimmed = query.trim();
  const [remote, setRemote] = useState({ query: '', places: [], error: null });

  const local = useMemo(
    () => searchCities(CITIES, trimmed, trimmed ? 8 : 60).map(locationFromCity),
    [trimmed],
  );

  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const places = await searchPlaces(trimmed, { signal: controller.signal });
        setRemote({ query: trimmed, places: places.map(locationFromPlace), error: null });
      } catch (error) {
        if (error?.name === 'AbortError') return;
        setRemote({ query: trimmed, places: [], error: error?.message ?? 'World city search failed.' });
      }
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  const searchable = trimmed.length >= MIN_QUERY_LENGTH;
  const current = searchable && remote.query === trimmed ? remote : null;

  return {
    options: mergePlaceResults(local, current?.places ?? [], 40),
    loading: searchable && current === null,
    error: current?.error ?? null,
  };
}
