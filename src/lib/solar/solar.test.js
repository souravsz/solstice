import { describe, expect, it } from 'vitest';
import {
  ELEVATION,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  PHASE,
  findCrossings,
  getNextEvent,
  getPhase,
  getPhaseSegments,
  getSunPosition,
  getSunTimes,
} from './index.js';
import { addCivilDays, civilDateOf, civilDayBounds, civilNoon, getZonedParts } from '../time/zoned.js';

const LONDON = { lat: 51.5072, lng: -0.1276, timeZone: 'Europe/London' };
const NEW_YORK = { lat: 40.7128, lng: -74.006, timeZone: 'America/New_York' };
const SYDNEY = { lat: -33.8688, lng: 151.2093, timeZone: 'Australia/Sydney' };
const PARIS = { lat: 48.8566, lng: 2.3522, timeZone: 'Europe/Paris' };
const TROMSO = { lat: 69.6496, lng: 18.956, timeZone: 'Europe/Oslo' };
const EQUATOR = { lat: 0, lng: 0, timeZone: 'UTC' };

const timesFor = (place, civil) =>
  getSunTimes(civilNoon(civil, place.timeZone), place.lat, place.lng, { timeZone: place.timeZone });

/** Minutes since local midnight, for comparing with published local times. */
const localMinutes = (date, timeZone) => {
  const p = getZonedParts(date, timeZone);
  return p.hour * 60 + p.minute + p.second / 60;
};
const hm = (h, m) => h * 60 + m;

describe('getSunTimes on an ordinary day', () => {
  it('orders sunrise < solar noon < sunset', () => {
    const t = timesFor(LONDON, '2026-10-27');
    expect(t.sunrise.getTime()).toBeLessThan(t.solarNoon.getTime());
    expect(t.solarNoon.getTime()).toBeLessThan(t.sunset.getTime());
    expect(t.alwaysUp).toBe(false);
    expect(t.alwaysDown).toBe(false);
  });

  it('orders every phase boundary through the day', () => {
    const t = timesFor(PARIS, '2026-04-15');
    const sequence = [
      t.dawn,
      t.goldenHourMorningStart,
      t.sunrise,
      t.goldenHourMorningEnd,
      t.solarNoon,
      t.goldenHourEveningStart,
      t.sunset,
      t.goldenHourEveningEnd,
      t.dusk,
    ].map((d) => d.getTime());
    expect([...sequence].sort((a, b) => a - b)).toEqual(sequence);
    expect(t.blueHourMorning).toEqual({ start: t.dawn, end: t.goldenHourMorningStart });
    expect(t.blueHourEvening).toEqual({ start: t.goldenHourEveningEnd, end: t.dusk });
  });

  it('matches published NOAA times within two minutes', () => {
    const london = timesFor(LONDON, '2026-06-21');
    expect(Math.abs(localMinutes(london.sunrise, LONDON.timeZone) - hm(4, 43))).toBeLessThan(2);
    expect(Math.abs(localMinutes(london.sunset, LONDON.timeZone) - hm(21, 21))).toBeLessThan(2);

    const newYork = timesFor(NEW_YORK, '2026-12-21');
    expect(Math.abs(localMinutes(newYork.sunrise, NEW_YORK.timeZone) - hm(7, 17))).toBeLessThan(2);
    expect(Math.abs(localMinutes(newYork.sunset, NEW_YORK.timeZone) - hm(16, 32))).toBeLessThan(2);

    const sydney = timesFor(SYDNEY, '2026-12-21');
    expect(Math.abs(localMinutes(sydney.sunrise, SYDNEY.timeZone) - hm(5, 41))).toBeLessThan(2);
    expect(Math.abs(localMinutes(sydney.sunset, SYDNEY.timeZone) - hm(20, 5))).toBeLessThan(2);
  });

  it('has about 12 hours of daylight at the equator on an equinox', () => {
    const t = timesFor(EQUATOR, '2026-03-20');
    // Refraction and the solar radius add roughly 7 minutes to the geometric 12 hours.
    expect(Math.abs(t.dayLength - 12 * MS_PER_HOUR)).toBeLessThan(10 * MS_PER_MINUTE);
  });

  it('agrees with the sampled crossing search to within seconds', () => {
    const t = timesFor(NEW_YORK, '2026-07-04');
    const { start, end } = civilDayBounds('2026-07-04', NEW_YORK.timeZone);
    const crossings = findCrossings(start, end, NEW_YORK.lat, NEW_YORK.lng, [ELEVATION.SUNRISE]);
    expect(crossings).toHaveLength(2);
    expect(Math.abs(crossings[0].at - t.sunrise)).toBeLessThan(5000);
    expect(Math.abs(crossings[1].at - t.sunset)).toBeLessThan(5000);
  });
});

describe('getSunTimes at high latitudes', () => {
  it('returns null sunrise and alwaysDown during polar night', () => {
    const t = timesFor(TROMSO, '2026-12-21');
    expect(t.sunrise).toBeNull();
    expect(t.sunset).toBeNull();
    expect(t.alwaysDown).toBe(true);
    expect(t.alwaysUp).toBe(false);
    expect(t.dayLength).toBe(0);
    // Civil twilight still happens around noon in Tromsø in December.
    expect(t.dawn).not.toBeNull();
  });

  it('returns null sunset and alwaysUp during the midnight sun', () => {
    const t = timesFor(TROMSO, '2026-06-21');
    expect(t.sunset).toBeNull();
    expect(t.alwaysUp).toBe(true);
    expect(t.dayLength).toBe(24 * MS_PER_HOUR);
  });

  it('handles white nights where the sun sets but twilight never ends', () => {
    const helsinki = { lat: 60.1699, lng: 24.9384, timeZone: 'Europe/Helsinki' };
    const t = timesFor(helsinki, '2026-06-21');
    expect(t.sunrise).not.toBeNull();
    expect(t.sunset).not.toBeNull();
    // The sun only dips to about −6.4°, so blue hour exists but is short;
    // further north (Reykjavík) civil dusk never arrives.
    const reykjavik = timesFor({ lat: 64.1466, lng: -21.9426, timeZone: 'Atlantic/Reykjavik' }, '2026-06-21');
    expect(reykjavik.sunset).not.toBeNull();
    expect(reykjavik.dusk).toBeNull();
    expect(reykjavik.goldenHourEveningEnd).toBeNull();
  });

  it('copes with the poles themselves', () => {
    const north = getSunTimes(new Date('2026-06-21T12:00:00Z'), 90, 0, { timeZone: 'UTC' });
    expect(north.alwaysUp).toBe(true);
    const south = getSunTimes(new Date('2026-06-21T12:00:00Z'), -90, 0, { timeZone: 'UTC' });
    expect(south.alwaysDown).toBe(true);
  });
});

describe('getSunTimes across time zones and calendars', () => {
  it('keeps events on the selected day near the date line', () => {
    const places = [
      { lat: 1.87, lng: -157.4, timeZone: 'Pacific/Kiritimati' }, // UTC+14
      { lat: -13.83, lng: -171.76, timeZone: 'Pacific/Apia' }, // UTC+13
      { lat: -18.14, lng: 178.44, timeZone: 'Pacific/Fiji' },
      { lat: 21.31, lng: -157.86, timeZone: 'Pacific/Honolulu' },
    ];
    for (const place of places) {
      for (const civil of ['2026-01-01', '2026-06-15', '2026-12-31']) {
        const t = timesFor(place, civil);
        expect(t.date).toBe(civil);
        expect(civilDateOf(t.sunrise, place.timeZone)).toBe(civil);
        expect(civilDateOf(t.solarNoon, place.timeZone)).toBe(civil);
        expect(civilDateOf(t.sunset, place.timeZone)).toBe(civil);
      }
    }
  });

  it('is unaffected by daylight-saving changes', () => {
    const cases = [
      [LONDON, '2026-03-29'],
      [LONDON, '2026-10-25'],
      [NEW_YORK, '2026-03-08'],
      [NEW_YORK, '2026-11-01'],
      [SYDNEY, '2026-04-05'],
      [SYDNEY, '2026-10-04'],
    ];
    for (const [place, civil] of cases) {
      const t = timesFor(place, civil);
      expect(civilDateOf(t.sunrise, place.timeZone)).toBe(civil);
      expect(civilDateOf(t.sunset, place.timeZone)).toBe(civil);
      const dayBefore = timesFor(place, addCivilDays(civil, -1));
      // Real day length changes by minutes, never by the DST hour.
      expect(Math.abs(t.dayLength - dayBefore.dayLength)).toBeLessThan(6 * MS_PER_MINUTE);
    }
  });

  it('defaults to the device time zone', () => {
    const date = new Date('2026-05-01T12:00:00Z');
    const t = getSunTimes(date, LONDON.lat, LONDON.lng);
    expect(t.timeZone).toBeTypeOf('string');
    expect(t.sunrise).toBeInstanceOf(Date);
  });
});

describe('getSunPosition', () => {
  it('has positive elevation at solar noon on a mid-latitude summer day', () => {
    const t = timesFor(PARIS, '2026-06-21');
    const { elevation, azimuth } = getSunPosition(t.solarNoon, PARIS.lat, PARIS.lng);
    expect(elevation).toBeGreaterThan(0);
    // 90 − latitude + declination (23.44°)
    expect(elevation).toBeCloseTo(90 - PARIS.lat + 23.44, 0);
    expect(azimuth).toBeCloseTo(180, 0);
  });

  it('points east in the morning and west in the evening', () => {
    const t = timesFor(LONDON, '2026-03-20');
    expect(getSunPosition(t.sunrise, LONDON.lat, LONDON.lng).azimuth).toBeGreaterThan(80);
    expect(getSunPosition(t.sunrise, LONDON.lat, LONDON.lng).azimuth).toBeLessThan(100);
    expect(getSunPosition(t.sunset, LONDON.lat, LONDON.lng).azimuth).toBeGreaterThan(260);
    expect(getSunPosition(t.sunset, LONDON.lat, LONDON.lng).azimuth).toBeLessThan(280);
  });

  it('is at the sunrise threshold at sunrise, and refraction lifts the apparent sun', () => {
    const t = timesFor(NEW_YORK, '2026-09-01');
    const position = getSunPosition(t.sunrise, NEW_YORK.lat, NEW_YORK.lng);
    expect(position.elevation).toBeCloseTo(ELEVATION.SUNRISE, 1);
    expect(position.apparentElevation).toBeGreaterThan(position.elevation);
  });
});

describe('phases', () => {
  it('classifies elevations', () => {
    expect(getPhase(30)).toBe(PHASE.DAY);
    expect(getPhase(6)).toBe(PHASE.DAY);
    expect(getPhase(2)).toBe(PHASE.GOLDEN_HOUR);
    expect(getPhase(-4)).toBe(PHASE.GOLDEN_HOUR);
    expect(getPhase(-5)).toBe(PHASE.BLUE_HOUR);
    expect(getPhase(-7)).toBe(PHASE.NIGHT);
  });

  it('segments a day contiguously in the expected order', () => {
    const { start, end } = civilDayBounds('2026-04-15', PARIS.timeZone);
    const segments = getPhaseSegments(start, end, PARIS.lat, PARIS.lng);
    expect(segments.map((s) => s.phase)).toEqual([
      PHASE.NIGHT,
      PHASE.BLUE_HOUR,
      PHASE.GOLDEN_HOUR,
      PHASE.DAY,
      PHASE.GOLDEN_HOUR,
      PHASE.BLUE_HOUR,
      PHASE.NIGHT,
    ]);
    expect(segments[0].start).toEqual(start);
    expect(segments.at(-1).end).toEqual(end);
    for (let i = 1; i < segments.length; i += 1) {
      expect(segments[i].start).toEqual(segments[i - 1].end);
    }
  });

  it('finds the next event, and none during polar day', () => {
    const t = timesFor(LONDON, '2026-10-27');
    const next = getNextEvent(new Date(t.solarNoon.getTime()), LONDON.lat, LONDON.lng);
    expect(next.type).toBe('goldenHourStart');
    expect(Math.abs(next.at - t.goldenHourEveningStart)).toBeLessThan(5000);

    const beforeSunset = new Date(t.sunset.getTime() - 10 * MS_PER_MINUTE);
    expect(getNextEvent(beforeSunset, LONDON.lat, LONDON.lng).type).toBe('sunset');

    expect(getNextEvent(new Date('2026-06-21T00:00:00Z'), 78.22, 15.65)).toBeNull();
  });
});
