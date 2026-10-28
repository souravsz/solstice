/** Sun elevation thresholds in degrees (geometric, centre of the solar disc). */
export const ELEVATION = Object.freeze({
  /** Sunrise / sunset: upper limb on the horizon, including mean atmospheric refraction. */
  SUNRISE: -0.833,
  /** Upper edge of golden hour. */
  GOLDEN_UPPER: 6,
  /** Lower edge of golden hour, which is also the upper edge of blue hour. */
  GOLDEN_LOWER: -4,
  /** Civil twilight: lower edge of blue hour (dawn / dusk). */
  CIVIL: -6,
});

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

/** Latitudes are clamped just short of the poles to keep the trigonometry finite. */
export const MAX_LATITUDE = 89.9999;
