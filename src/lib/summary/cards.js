import { ELEVATION, PHASE } from '../solar/index.js';

/**
 * Turns raw sun times into card view models. Pure data, no formatting or React,
 * so every polar and twilight edge case can be unit tested.
 */

export const CARD = Object.freeze({
  SUNRISE: 'sunrise',
  SUNSET: 'sunset',
  SOLAR_NOON: 'solarNoon',
  GOLDEN_MORNING: 'goldenMorning',
  GOLDEN_EVENING: 'goldenEvening',
  BLUE_HOURS: 'blueHours',
  DAY_LENGTH: 'dayLength',
});

/**
 * @typedef {{ kind: 'range' | 'from' | 'until' | 'allDay' | 'none', start: Date | null, end: Date | null, note: string | null }} RangeView
 */

/**
 * Describe one occurrence of a band of elevations (golden or blue hour).
 * @param {{ start: Date | null, end: Date | null }} range
 * @param {'morning' | 'evening'} when
 * @param {{ lower: number, upper: number, noonElevation: number, nadirElevation: number, messages: { tooLow: string, tooHigh: string, allDay: string } }} band
 * @returns {RangeView}
 */
export function describeBand({ start, end }, when, band) {
  if (start && end) return { kind: 'range', start, end, note: null };
  if (start && !end) {
    return { kind: 'from', start, end: null, note: when === 'morning' ? 'Lasts through midday' : 'Lasts through the night' };
  }
  if (!start && end) {
    return { kind: 'until', start: null, end, note: when === 'morning' ? 'Continues from the night' : 'Continues from midday' };
  }
  const { lower, upper, noonElevation, nadirElevation, messages } = band;
  if (noonElevation < lower) return { kind: 'none', start: null, end: null, note: messages.tooLow };
  if (nadirElevation >= upper) return { kind: 'none', start: null, end: null, note: messages.tooHigh };
  if (nadirElevation >= lower && noonElevation < upper) return { kind: 'allDay', start: null, end: null, note: messages.allDay };
  return { kind: 'none', start: null, end: null, note: 'Not today' };
}

const GOLDEN_MESSAGES = {
  tooLow: 'The sun stays too low for golden light',
  tooHigh: 'The sun stays above golden-hour height',
  allDay: 'Golden light all day',
};

const BLUE_MESSAGES = {
  tooLow: 'The sky stays dark all day',
  tooHigh: 'The sky stays too bright for blue hour',
  allDay: 'Blue light all day',
};

function horizonMessage(times, event) {
  if (times.alwaysUp) return event === 'sunrise' ? 'The sun is up all day' : 'The sun doesn’t set today';
  if (times.alwaysDown) return event === 'sunrise' ? 'The sun doesn’t rise today' : 'The sun stays below the horizon';
  return event === 'sunrise' ? 'No sunrise today' : 'No sunset today';
}

/** Instants a card "points at", used to find the next upcoming event. */
const startsOf = (...views) =>
  views.flatMap((v) => (v.kind === 'range' || v.kind === 'from' ? [v.start] : []));

/** Intervals a card covers, used to mark it as happening now. */
const intervalsOf = (bounds, ...views) =>
  views.flatMap((v) => {
    if (v.kind === 'range') return [{ start: v.start, end: v.end }];
    if (v.kind === 'from') return [{ start: v.start, end: bounds.end }];
    if (v.kind === 'until') return [{ start: bounds.start, end: v.end }];
    if (v.kind === 'allDay') return [{ start: bounds.start, end: bounds.end }];
    return [];
  });

/**
 * @param {ReturnType<typeof import('../solar/times.js').getSunTimes>} times
 * @param {{ start: Date, end: Date }} bounds the civil day being shown
 */
export function buildSunCards(times, bounds) {
  const golden = {
    lower: ELEVATION.GOLDEN_LOWER,
    upper: ELEVATION.GOLDEN_UPPER,
    noonElevation: times.noonElevation,
    nadirElevation: times.nadirElevation,
    messages: GOLDEN_MESSAGES,
  };
  const blue = { ...golden, lower: ELEVATION.CIVIL, upper: ELEVATION.GOLDEN_LOWER, messages: BLUE_MESSAGES };

  const goldenMorning = describeBand(times.goldenHourMorning, 'morning', golden);
  const goldenEvening = describeBand(times.goldenHourEvening, 'evening', golden);
  const blueMorning = describeBand(times.blueHourMorning, 'morning', blue);
  const blueEvening = describeBand(times.blueHourEvening, 'evening', blue);

  // A day that is golden or blue from end to end shows as one "all day" period, not two.
  const mergeAllDay = (a, b) => (a.kind === 'allDay' && b.kind === 'allDay' ? [a] : [a, b]);

  return [
    {
      id: CARD.SUNRISE,
      label: 'Sunrise',
      phase: PHASE.GOLDEN_HOUR,
      value: times.sunrise ? { type: 'time', at: times.sunrise } : { type: 'message', text: horizonMessage(times, 'sunrise') },
      moments: times.sunrise ? [times.sunrise] : [],
      intervals: [],
    },
    {
      id: CARD.SUNSET,
      label: 'Sunset',
      phase: PHASE.GOLDEN_HOUR,
      value: times.sunset ? { type: 'time', at: times.sunset } : { type: 'message', text: horizonMessage(times, 'sunset') },
      moments: times.sunset ? [times.sunset] : [],
      intervals: [],
    },
    {
      id: CARD.SOLAR_NOON,
      label: 'Solar noon',
      phase: PHASE.DAY,
      value: { type: 'time', at: times.solarNoon },
      elevation: times.noonElevation,
      moments: [times.solarNoon],
      intervals: [],
    },
    {
      id: CARD.GOLDEN_MORNING,
      label: 'Morning golden hour',
      phase: PHASE.GOLDEN_HOUR,
      value: { type: 'band', view: goldenMorning },
      moments: startsOf(goldenMorning),
      intervals: intervalsOf(bounds, goldenMorning),
    },
    {
      id: CARD.GOLDEN_EVENING,
      label: 'Evening golden hour',
      phase: PHASE.GOLDEN_HOUR,
      value: { type: 'band', view: goldenEvening },
      moments: startsOf(goldenEvening),
      intervals: intervalsOf(bounds, goldenEvening),
    },
    {
      id: CARD.BLUE_HOURS,
      label: 'Blue hours',
      phase: PHASE.BLUE_HOUR,
      value: {
        type: 'bands',
        rows: mergeAllDay(blueMorning, blueEvening).map((view, i, all) => ({
          label: all.length === 1 ? 'All day' : i === 0 ? 'Morning' : 'Evening',
          view,
        })),
      },
      moments: startsOf(blueMorning, blueEvening),
      intervals: intervalsOf(bounds, blueMorning, blueEvening),
    },
    {
      id: CARD.DAY_LENGTH,
      label: 'Day length',
      phase: PHASE.DAY,
      value: { type: 'duration', ms: times.dayLength },
      note: times.alwaysUp ? 'Midnight sun' : times.alwaysDown ? 'Polar night' : null,
      moments: [],
      intervals: [],
    },
  ];
}

/**
 * Which card is next, and which are happening now.
 * @param {ReturnType<typeof buildSunCards>} cards
 * @param {Date | null} now null when not viewing today
 */
export function findHighlights(cards, now) {
  if (!now) return { nextId: null, activeIds: new Set() };
  const t = now.getTime();
  let nextId = null;
  let nextAt = Infinity;
  const activeIds = new Set();
  for (const card of cards) {
    for (const moment of card.moments) {
      const m = moment.getTime();
      if (m > t && m < nextAt) {
        nextAt = m;
        nextId = card.id;
      }
    }
    if (card.intervals.some(({ start, end }) => start.getTime() <= t && t < end.getTime())) activeIds.add(card.id);
  }
  return { nextId, activeIds };
}
