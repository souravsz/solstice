import { describe, expect, it } from 'vitest';
import {
  addCivilDays,
  civilDateOf,
  civilDayBounds,
  diffCivilDays,
  getTimeZoneOffsetMs,
  getZonedParts,
  isValidTimeZone,
  parseCivilDate,
  zonedTimeToUtc,
} from './zoned.js';

const HOUR = 3600000;

describe('civil dates', () => {
  it('parses and rejects dates', () => {
    expect(parseCivilDate('2026-10-27')).toEqual({ year: 2026, month: 10, day: 27 });
    expect(parseCivilDate('2026-02-30')).toBeNull();
    expect(parseCivilDate('27/10/2026')).toBeNull();
    expect(parseCivilDate('')).toBeNull();
  });

  it('adds and diffs days across month and year ends', () => {
    expect(addCivilDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addCivilDays('2028-03-01', -1)).toBe('2028-02-29');
    expect(diffCivilDays('2026-10-27', '2026-11-03')).toBe(7);
    expect(diffCivilDays('2026-10-27', '2026-10-26')).toBe(-1);
  });
});

describe('zoned conversions', () => {
  it('reads wall-clock fields in a zone', () => {
    const p = getZonedParts(new Date('2026-07-01T12:00:00Z'), 'Asia/Kolkata');
    expect(p).toMatchObject({ year: 2026, month: 7, day: 1, hour: 17, minute: 30 });
    expect(getTimeZoneOffsetMs(new Date('2026-07-01T12:00:00Z'), 'Asia/Kolkata')).toBe(5.5 * HOUR);
  });

  it('round-trips wall times', () => {
    const instant = zonedTimeToUtc({ year: 2026, month: 10, day: 27, hour: 9, minute: 15 }, 'America/New_York');
    expect(instant.toISOString()).toBe('2026-10-27T13:15:00.000Z');
  });

  it('resolves DST gaps to the end of the gap', () => {
    // London springs forward at 01:00 → 02:00 on 2026-03-29.
    const inGap = zonedTimeToUtc({ year: 2026, month: 3, day: 29, hour: 1, minute: 30 }, 'Europe/London');
    expect(getZonedParts(inGap, 'Europe/London').hour).toBe(2);
  });

  it('has 23- and 25-hour days around DST changes', () => {
    const spring = civilDayBounds('2026-03-29', 'Europe/London');
    expect(spring.end - spring.start).toBe(23 * HOUR);
    const autumn = civilDayBounds('2026-10-25', 'Europe/London');
    expect(autumn.end - autumn.start).toBe(25 * HOUR);
  });

  it('starts every day on the right date, even where midnight is skipped', () => {
    for (const zone of ['America/Santiago', 'America/Havana', 'Asia/Beirut', 'Pacific/Apia', 'Australia/Lord_Howe']) {
      let civil = '2026-01-01';
      for (let i = 0; i < 366; i += 1) {
        const { start, end } = civilDayBounds(civil, zone);
        expect(civilDateOf(start, zone)).toBe(civil);
        expect(end.getTime()).toBeGreaterThan(start.getTime());
        civil = addCivilDays(civil, 1);
      }
    }
  });

  it('validates time zone names', () => {
    expect(isValidTimeZone('Europe/Lisbon')).toBe(true);
    expect(isValidTimeZone('Etc/GMT-14')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus_Mons')).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
  });
});
