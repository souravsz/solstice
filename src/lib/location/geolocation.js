/** Promise wrapper around navigator.geolocation with friendly, actionable errors. */

export class GeolocationError extends Error {
  /**
   * @param {'unsupported' | 'insecure' | 'denied' | 'unavailable' | 'timeout'} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'GeolocationError';
    this.code = code;
  }
}

const MESSAGES = {
  unsupported: 'This browser can’t share your location. Search for a city instead.',
  insecure: 'Location is only available over a secure (https) connection. Search for a city instead.',
  denied: 'Location access is turned off for this site. You can allow it in your browser settings, or pick a city.',
  unavailable: 'Your position couldn’t be found right now. Try again, or pick a city.',
  timeout: 'Finding your position took too long. Try again, or pick a city.',
};

export function geolocationErrorFromCode(code) {
  // GeolocationPositionError codes: 1 PERMISSION_DENIED, 2 POSITION_UNAVAILABLE, 3 TIMEOUT
  const key = { 1: 'denied', 2: 'unavailable', 3: 'timeout' }[code] ?? 'unavailable';
  return new GeolocationError(key, MESSAGES[key]);
}

/**
 * @param {{ geolocation?: Geolocation, isSecureContext?: boolean }} [env]
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number }>}
 */
export function getCurrentPosition(env = globalThis) {
  return new Promise((resolve, reject) => {
    const geolocation = env.navigator?.geolocation ?? env.geolocation;
    if (env.isSecureContext === false) {
      reject(new GeolocationError('insecure', MESSAGES.insecure));
      return;
    }
    if (!geolocation) {
      reject(new GeolocationError('unsupported', MESSAGES.unsupported));
      return;
    }
    geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy }),
      (error) => reject(geolocationErrorFromCode(error?.code)),
      // City-level accuracy is plenty for sun times and is faster and lighter on battery.
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 },
    );
  });
}
