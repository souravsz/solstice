import { describe, expect, it } from 'vitest';
import { getSunTimes } from '../solar/index.js';
import { addCivilDays, civilDayBounds, civilNoon } from '../time/zoned.js';
import { STAT, WINDOW, buildDaySummary, describeBand, findHighlights, summaryItems } from './cards.js';
import { describeShortChanges } from './compare.js';
import { compassPoint, describeElevation, describeNextEvent } from './describe.js';

const place = (lat, lng, timeZone) => ({ lat, lng, timeZone });
const LONDON = place(51.5072, -0.1276, 'Europe/London');
const TROMSO = place(69.6496, 18.956, 'Europe/Oslo');
const LONGYEARBYEN = place(78.2232, 15.6267, 'Arctic/Longyearbyen');

const dayFor = ({ lat, lng, timeZone }, civil) => ({
  times: getSunTimes(civilNoon(civil, timeZone), lat, lng, { timeZone }),
  bounds: civilDayBounds(civil, timeZone),
});

const summaryFor = (where, civil) => {
  const { times, bounds } = dayFor(where, civil);
  return { times, summary: buildDaySummary(times, bounds) };
};

const stat = (summary, id) => summary.stats.find((s) => s.id === id);
/** Group id → [row label, view kind] pairs, for compact assertions. */
const shape = (summary) =>
  Object.fromEntries(summary.windowGroups.map((g) => [g.id, g.rows.map((r) => [r.label, r.view.kind])]));

describe('buildDaySummary', () => {
  it('shows the four key times and chronological windows on an ordinary day', () => {
    const { times, summary } = summaryFor(LONDON, '2026-10-27');
    expect(summary.stats.map((s) => s.id)).toEqual(Object.values(STAT));
    expect(stat(summary, STAT.SUNRISE).value).toEqual({ type: 'time', at: times.sunrise });
    expect(shape(summary)).toEqual({
      morning: [
        ['Blue hour', 'range'],
        ['Golden hour', 'range'],
      ],
      evening: [
        ['Golden hour', 'range'],
        ['Blue hour', 'range'],
      ],
    });
    const ids = summary.windowGroups.flatMap((g) => g.rows.map((r) => r.id));
    expect(ids).toEqual([WINDOW.BLUE_MORNING, WINDOW.GOLDEN_MORNING, WINDOW.GOLDEN_EVENING, WINDOW.BLUE_EVENING]);
  });

  it('joins midday golden light into one window during polar night', () => {
    // Tromsø in December: the sun peaks near −3°, so no sunrise but golden light around noon.
    const { times, summary } = summaryFor(TROMSO, '2026-12-21');
    expect(stat(summary, STAT.SUNRISE).value).toEqual({ type: 'message', text: 'Doesn’t rise today' });
    expect(stat(summary, STAT.SUNSET).value.text).toBe('Stays below the horizon');
    expect(stat(summary, STAT.DAY_LENGTH).note).toBe('Polar night');
    expect(shape(summary)).toEqual({
      morning: [['Blue hour', 'range']],
      midday: [['Golden hour', 'range']],
      evening: [['Blue hour', 'range']],
    });
    const midday = summary.windowGroups.find((g) => g.id === 'midday').rows[0].view;
    expect(midday.start).toEqual(times.goldenHourMorningStart);
    expect(midday.end).toEqual(times.goldenHourEveningEnd);
  });

  it('shows calm messages during the midnight sun', () => {
    const { summary } = summaryFor(TROMSO, '2026-06-21');
    expect(stat(summary, STAT.SUNSET).value.text).toBe('Doesn’t set today');
    const allDay = summary.windowGroups.find((g) => g.id === 'allDay').rows;
    expect(allDay.find((r) => r.label === 'Blue hour').view.note).toBe('The sky stays too bright for blue hour');
  });

  it('has a single row per band when there is no twilight at all', () => {
    // Svalbard in December: the sun stays below −11°.
    const { summary } = summaryFor(LONGYEARBYEN, '2026-12-21');
    expect(shape(summary)).toEqual({
      allDay: [
        ['Golden hour', 'none'],
        ['Blue hour', 'none'],
      ],
    });
    expect(summary.windowGroups[0].rows[1].view.note).toBe('The sky stays dark all day');
  });

  it('merges an all-day blue hour into one row', () => {
    // At the North Pole in early March the sun circles about 5° below the horizon.
    const { summary } = summaryFor(place(90, 0, 'UTC'), '2026-03-07');
    const allDay = summary.windowGroups.find((g) => g.id === 'allDay').rows;
    expect(allDay.find((r) => r.label === 'Blue hour').view.kind).toBe('allDay');
  });
});

describe('describeBand', () => {
  const band = {
    lower: -4,
    upper: 6,
    noonElevation: 3,
    nadirElevation: -2,
    messages: { tooLow: 'low', tooHigh: 'high', allDay: 'all day' },
  };
  const d = new Date();

  it('handles every combination of missing edges', () => {
    expect(describeBand({ start: d, end: d }, 'morning', band).kind).toBe('range');
    expect(describeBand({ start: d, end: null }, 'morning', band)).toMatchObject({ kind: 'from', note: 'Lasts through midday' });
    expect(describeBand({ start: null, end: d }, 'evening', band)).toMatchObject({ kind: 'until', note: 'Continues from midday' });
    expect(describeBand({ start: null, end: null }, 'morning', band)).toMatchObject({ kind: 'allDay', note: 'all day' });
    expect(describeBand({ start: null, end: null }, 'morning', { ...band, noonElevation: -10 }).note).toBe('low');
    expect(describeBand({ start: null, end: null }, 'morning', { ...band, nadirElevation: 8 }).note).toBe('high');
  });
});

describe('findHighlights', () => {
  it('marks the next event and anything in progress', () => {
    const { times, summary } = summaryFor(LONDON, '2026-10-27');
    const items = summaryItems(summary);

    const atNoon = findHighlights(items, new Date(times.solarNoon.getTime() + 60000));
    expect(atNoon.nextId).toBe(WINDOW.GOLDEN_EVENING);
    expect(atNoon.activeIds.size).toBe(0);

    const inGolden = findHighlights(items, new Date(times.sunset.getTime() - 5 * 60000));
    expect(inGolden.nextId).toBe(STAT.SUNSET);
    expect(inGolden.activeIds.has(WINDOW.GOLDEN_EVENING)).toBe(true);

    expect(findHighlights(items, null).nextId).toBeNull();
  });
});

describe('describeShortChanges', () => {
  it('describes clock shifts and day length changes', () => {
    const today = { sunrise: new Date('2026-10-27T07:00:00Z'), sunset: new Date('2026-10-27T17:00:00Z'), dayLength: 36000000 };
    const next = { sunrise: new Date('2026-10-28T07:02:00Z'), sunset: new Date('2026-10-28T17:00:10Z'), dayLength: 36000000 - 110000 };
    expect(describeShortChanges(today, next, 'UTC')).toEqual({
      sunrise: '2 min later tomorrow',
      sunset: 'Same time tomorrow',
      dayLength: '1 min 50 s shorter tomorrow',
    });
    expect(describeShortChanges(today, next, 'UTC', 'nextDay').sunrise).toBe('2 min later next day');
  });

  it('reports the real DST jump on change days', () => {
    // Clocks go back on 2026-10-25 in London, so sunrise moves an hour earlier by the clock.
    const a = dayFor(LONDON, '2026-10-24').times;
    const b = dayFor(LONDON, '2026-10-25').times;
    expect(describeShortChanges(a, b, LONDON.timeZone).sunrise).toMatch(/^5\d min earlier tomorrow$/);
  });

  it('handles the return of the sun after polar night', () => {
    let civil = '2027-01-01';
    let changes = null;
    for (let i = 0; i < 40; i += 1) {
      const a = dayFor(TROMSO, civil).times;
      const b = dayFor(TROMSO, addCivilDays(civil, 1)).times;
      if (a.alwaysDown && !b.alwaysDown) {
        changes = describeShortChanges(a, b, TROMSO.timeZone);
        break;
      }
      civil = addCivilDays(civil, 1);
    }
    expect(changes).toMatchObject({ sunrise: 'Rises again tomorrow', sunset: 'Sets again tomorrow', dayLength: null });
  });
});

describe('describe', () => {
  it('phrases the next event', () => {
    const now = new Date('2026-10-27T12:00:00Z');
    const next = { type: 'goldenHourStart', at: new Date(now.getTime() + 72 * 60000) };
    expect(describeNextEvent(next, now, 'day').text).toBe('Golden hour begins in 1h 12m');
    expect(describeNextEvent(next, now, 'day').spoken).toBe('Golden hour begins in 1 hour 12 minutes');
    expect(describeNextEvent({ type: 'sunset', at: new Date(now.getTime() + 20000) }, now, 'goldenHour').text).toBe(
      'Sunset now',
    );
    expect(describeNextEvent(null, now, 'day').text).toBe('The sun stays up all day');
  });

  it('names directions and elevations', () => {
    expect(compassPoint(0)).toBe('N');
    expect(compassPoint(359)).toBe('N');
    expect(compassPoint(225)).toBe('SW');
    expect(describeElevation(23.4)).toBe('23° above the horizon');
    expect(describeElevation(-4.2)).toBe('4° below the horizon');
    expect(describeElevation(0.2)).toBe('on the horizon');
  });
});
