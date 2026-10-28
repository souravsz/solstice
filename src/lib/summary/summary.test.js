import { describe, expect, it } from 'vitest';
import { getSunTimes } from '../solar/index.js';
import { addCivilDays, civilDayBounds, civilNoon } from '../time/zoned.js';
import { CARD, buildSunCards, describeBand, findHighlights } from './cards.js';
import { describeDayLengthChange, describeEventShift, describeTomorrow } from './compare.js';
import { compassPoint, describeElevation, describeNextEvent } from './describe.js';

const place = (lat, lng, timeZone) => ({ lat, lng, timeZone });
const LONDON = place(51.5072, -0.1276, 'Europe/London');
const TROMSO = place(69.6496, 18.956, 'Europe/Oslo');
const LONGYEARBYEN = place(78.2232, 15.6267, 'Arctic/Longyearbyen');

const dayFor = ({ lat, lng, timeZone }, civil) => ({
  times: getSunTimes(civilNoon(civil, timeZone), lat, lng, { timeZone }),
  bounds: civilDayBounds(civil, timeZone),
});

const card = (cards, id) => cards.find((c) => c.id === id);

describe('buildSunCards', () => {
  it('shows times and ranges on an ordinary day', () => {
    const { times, bounds } = dayFor(LONDON, '2026-10-27');
    const cards = buildSunCards(times, bounds);
    expect(cards.map((c) => c.id)).toEqual(Object.values(CARD));
    expect(card(cards, CARD.SUNRISE).value).toEqual({ type: 'time', at: times.sunrise });
    expect(card(cards, CARD.GOLDEN_MORNING).value.view.kind).toBe('range');
    expect(card(cards, CARD.BLUE_HOURS).value.rows.map((r) => r.label)).toEqual(['Morning', 'Evening']);
  });

  it('shows calm messages during polar night', () => {
    const { times, bounds } = dayFor(TROMSO, '2026-12-21');
    const cards = buildSunCards(times, bounds);
    expect(card(cards, CARD.SUNRISE).value).toEqual({ type: 'message', text: 'The sun doesn’t rise today' });
    expect(card(cards, CARD.SUNSET).value.text).toBe('The sun stays below the horizon');
    // The sun peaks near −3°: golden light around midday, but no sunrise.
    expect(card(cards, CARD.GOLDEN_MORNING).value.view).toMatchObject({ kind: 'from', note: 'Lasts through midday' });
    expect(card(cards, CARD.GOLDEN_EVENING).value.view).toMatchObject({ kind: 'until', note: 'Continues from midday' });
    expect(card(cards, CARD.DAY_LENGTH).note).toBe('Polar night');
  });

  it('shows calm messages during the midnight sun', () => {
    const { times, bounds } = dayFor(TROMSO, '2026-06-21');
    const cards = buildSunCards(times, bounds);
    expect(card(cards, CARD.SUNSET).value.text).toBe('The sun doesn’t set today');
    expect(card(cards, CARD.BLUE_HOURS).value.rows[0].view.note).toBe('The sky stays too bright for blue hour');
  });

  it('has no twilight at all in deep polar night', () => {
    // Svalbard in December: the sun stays below −11°.
    const { times, bounds } = dayFor(LONGYEARBYEN, '2026-12-21');
    const cards = buildSunCards(times, bounds);
    expect(card(cards, CARD.SUNRISE).value.type).toBe('message');
    expect(card(cards, CARD.GOLDEN_EVENING).value.view.note).toBe('The sun stays too low for golden light');
    expect(card(cards, CARD.BLUE_HOURS).value.rows[0].view.note).toBe('The sky stays dark all day');
  });

  it('merges an all-day blue hour into one row', () => {
    // At the North Pole in early March the sun circles about 5° below the horizon.
    const { times, bounds } = dayFor(place(90, 0, 'UTC'), '2026-03-07');
    const rows = card(buildSunCards(times, bounds), CARD.BLUE_HOURS).value.rows;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ label: 'All day', view: { kind: 'allDay' } });
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
    const { times, bounds } = dayFor(LONDON, '2026-10-27');
    const cards = buildSunCards(times, bounds);

    const atNoon = findHighlights(cards, new Date(times.solarNoon.getTime() + 60000));
    expect(atNoon.nextId).toBe(CARD.GOLDEN_EVENING);
    expect(atNoon.activeIds.size).toBe(0);

    const inGolden = findHighlights(cards, new Date(times.sunset.getTime() - 5 * 60000));
    expect(inGolden.nextId).toBe(CARD.SUNSET);
    expect(inGolden.activeIds.has(CARD.GOLDEN_EVENING)).toBe(true);

    expect(findHighlights(cards, null).nextId).toBeNull();
  });
});

describe('comparisons', () => {
  it('describes clock shifts and day length changes', () => {
    const today = { sunrise: new Date('2026-10-27T07:00:00Z'), sunset: null };
    const tomorrow = { sunrise: new Date('2026-10-28T07:02:00Z'), sunset: null };
    expect(describeEventShift('sunrise', today, tomorrow, 'UTC')).toBe('Tomorrow’s sunrise is 2 min later');
    expect(describeDayLengthChange(36000000, 36000000 - 133000)).toBe('Tomorrow is 2 min 13 s shorter');
    expect(describeDayLengthChange(36000000, 36000000 + 40000)).toBe('Tomorrow is 40 s longer');
    expect(describeEventShift('sunrise', today, tomorrow, 'UTC', 'nextDay')).toBe('The next day’s sunrise is 2 min later');
  });

  it('reports the real DST jump on change days', () => {
    // Clocks go back on 2026-10-25 in London, so sunrise moves an hour earlier by the clock.
    const a = dayFor(LONDON, '2026-10-24').times;
    const b = dayFor(LONDON, '2026-10-25').times;
    expect(describeEventShift('sunrise', a, b, LONDON.timeZone)).toMatch(/^Tomorrow’s sunrise is 5\d min earlier$/);
  });

  it('handles the return of the sun after polar night', () => {
    let civil = '2027-01-01';
    let lines = [];
    for (let i = 0; i < 40; i += 1) {
      const a = dayFor(TROMSO, civil).times;
      const b = dayFor(TROMSO, addCivilDays(civil, 1)).times;
      if (a.alwaysDown && !b.alwaysDown) {
        lines = describeTomorrow(a, b, TROMSO.timeZone);
        break;
      }
      civil = addCivilDays(civil, 1);
    }
    expect(lines).toContain('The sun rises again tomorrow');
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
