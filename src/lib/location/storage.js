import { isValidLocation } from './locations.js';

export const LOCATION_STORAGE_KEY = 'solstice.location.v1';

/** @returns {import('./locations.js').SolsticeLocation | null} */
export function loadLocation(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidLocation(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLocation(location, storage = globalThis.localStorage) {
  try {
    storage?.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    return true;
  } catch {
    // Storage full or blocked: the location still applies until the page closes.
    return false;
  }
}
