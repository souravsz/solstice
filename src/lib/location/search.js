import { distanceKm } from './coordinates.js';

/** Accent- and case-insensitive city search, ranked so prefix matches come first. */

export const normalizeSearchText = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ø/gi, 'o')
    .toLowerCase()
    .trim();

/**
 * @param {Array<{ name: string, country: string }>} cities
 * @param {string} query
 * @param {number} [limit]
 */
export function searchCities(cities, query, limit = 50) {
  const q = normalizeSearchText(query);
  if (!q) return cities.slice(0, limit);
  const ranked = [];
  for (const city of cities) {
    const name = normalizeSearchText(city.name);
    const country = normalizeSearchText(city.country);
    let rank = -1;
    if (name.startsWith(q)) rank = 0;
    else if (name.split(/[\s(),.-]+/).some((word) => word.startsWith(q))) rank = 1;
    else if (country.startsWith(q)) rank = 2;
    else if (name.includes(q) || `${name} ${country}`.includes(q)) rank = 3;
    if (rank >= 0) ranked.push({ city, rank });
  }
  return ranked
    .sort((a, b) => a.rank - b.rank || a.city.name.localeCompare(b.city.name))
    .slice(0, limit)
    .map((r) => r.city);
}

/** Within this distance, two results with the same name are treated as the same place. */
const SAME_PLACE_KM = 25;

/**
 * Built-in results first (instant, offline), then worldwide results that aren't duplicates.
 * Both lists hold locations with `name`, `lat` and `lng`.
 */
export function mergePlaceResults(local, online, limit = 40) {
  const merged = [...local];
  for (const place of online) {
    const name = normalizeSearchText(place.name);
    const duplicate = merged.some(
      (existing) => normalizeSearchText(existing.name) === name && distanceKm(existing, place) < SAME_PLACE_KM,
    );
    if (!duplicate) merged.push(place);
  }
  return merged.slice(0, limit);
}
