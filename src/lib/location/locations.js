import { formatCoordinates, findNearestCity, isValidLatitude, isValidLongitude } from './coordinates.js';
import { getDeviceTimeZone, isValidTimeZone } from '../time/zoned.js';

/**
 * A location the app can show sun times for.
 * @typedef {object} SolsticeLocation
 * @property {string} id
 * @property {string} name   short label, e.g. "Lisbon" or "Near Lisbon"
 * @property {string} detail secondary label, e.g. "Portugal" or coordinates
 * @property {number} lat
 * @property {number} lng
 * @property {string} timeZone IANA zone used to display times
 * @property {'city' | 'geolocation' | 'manual'} source
 */

/** Within this distance a place is described as "near" a known city. */
const NEAR_KM = 60;
/** Within this distance a known city's time zone is assumed for arbitrary coordinates. */
const TIME_ZONE_KM = 600;

/**
 * An IANA "Etc/GMT±N" zone from longitude, for places far from any known city
 * (oceans, Antarctica). Note the POSIX sign: Etc/GMT-9 is UTC+9.
 */
export function solarTimeZone(lng) {
  const offset = Math.max(-12, Math.min(12, Math.round(lng / 15)));
  if (offset === 0) return 'Etc/GMT';
  return `Etc/GMT${offset > 0 ? '-' : '+'}${Math.abs(offset)}`;
}

/** Best-effort time zone for coordinates using the built-in city list. */
export function timeZoneForCoordinates(lat, lng, cities) {
  const nearest = findNearestCity({ lat, lng }, cities);
  if (nearest && nearest.distanceKm <= TIME_ZONE_KM && isValidTimeZone(nearest.city.timeZone)) {
    return nearest.city.timeZone;
  }
  return solarTimeZone(lng);
}

const round = (value) => Math.round(value * 10000) / 10000;

/** @returns {SolsticeLocation} */
export function locationFromCity(city) {
  return {
    id: `city:${city.id}`,
    name: city.name,
    detail: city.country,
    lat: city.lat,
    lng: city.lng,
    timeZone: isValidTimeZone(city.timeZone) ? city.timeZone : getDeviceTimeZone(),
    source: 'city',
  };
}

/**
 * From the device's position. The device's own time zone is used, since that is
 * the clock the person holding it lives by.
 * @returns {SolsticeLocation}
 */
export function locationFromGeolocation({ latitude, longitude }, cities, timeZone = getDeviceTimeZone()) {
  const lat = round(latitude);
  const lng = round(longitude);
  const nearest = findNearestCity({ lat, lng }, cities);
  const near = nearest && nearest.distanceKm <= NEAR_KM ? nearest.city : null;
  return {
    id: `geo:${lat},${lng}`,
    name: near ? `Near ${near.name}` : 'My location',
    detail: formatCoordinates(lat, lng),
    lat,
    lng,
    timeZone,
    source: 'geolocation',
  };
}

/** @returns {SolsticeLocation} */
export function locationFromCoordinates(latitude, longitude, cities) {
  const lat = round(latitude);
  const lng = round(longitude);
  const nearest = findNearestCity({ lat, lng }, cities);
  const near = nearest && nearest.distanceKm <= NEAR_KM ? nearest.city : null;
  return {
    id: `manual:${lat},${lng}`,
    name: formatCoordinates(lat, lng),
    detail: near ? `Near ${near.name}, ${near.country}` : 'Custom coordinates',
    lat,
    lng,
    timeZone: timeZoneForCoordinates(lat, lng, cities),
    source: 'manual',
  };
}

/** Checks data read back from storage before trusting it. */
export function isValidLocation(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.detail === 'string' &&
    isValidLatitude(value.lat) &&
    isValidLongitude(value.lng) &&
    isValidTimeZone(value.timeZone) &&
    ['city', 'geolocation', 'manual'].includes(value.source)
  );
}
