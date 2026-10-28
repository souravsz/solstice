import { ELEVATION, PHASE } from '../solar/index.js';

/**
 * Turns raw sun times into the view model for the "Sun times" card. Pure data,
 * no formatting or React, so every polar and twilight edge case can be unit tested.
 */

export const STAT = Object.freeze({
  SUNRISE: 'sunrise',
  SOLAR_NOON: 'solarNoon',
  SUNSET: 'sunset',
  DAY_LENGTH: 'dayLength',
});

export const WINDOW = Object.freeze({
  BLUE_MORNING: 'blueMorning',
  GOLDEN_MORNING: 'goldenMorning',
  GOLDEN_EVENING: 'goldenEvening',
  BLUE_EVENING: 'blueEvening',
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
  if (times.alwaysUp) return event === 'sunrise' ? 'Up all day' : 'Doesn’t set today';
  if (times.alwaysDown) return event === 'sunrise' ? 'Doesn’t rise today' : 'Stays below the horizon';
  return event === 'sunrise' ? 'No sunrise today' : 'No sunset today';
}

/** Instants an item "points at", used to find the next upcoming event. */
const startsOf = (view) => (view.kind === 'range' || view.kind === 'from' ? [view.start] : []);

/** Intervals an item covers, used to mark it as happening now. */
function intervalsOf(bounds, view) {
  if (view.kind === 'range') return [{ start: view.start, end: view.end }];
  if (view.kind === 'from') return [{ start: view.start, end: bounds.end }];
  if (view.kind === 'until') return [{ start: bounds.start, end: view.end }];
  if (view.kind === 'allDay') return [{ start: bounds.start, end: bounds.end }];
  return [];
}

const windowItem = (id, label, phase, view, bounds) => ({
  id,
  label,
  phase,
  view,
  moments: startsOf(view),
  intervals: intervalsOf(bounds, view),
});

const GROUP_LABEL = { morning: 'Morning', midday: 'Around midday', evening: 'Evening', allDay: 'All day' };

/**
 * Golden and blue hours as rows grouped by part of the day, in time order.
 *
 * - When morning and evening say the same thing ("all day", "too low"), one row is shown.
 * - When the sun peaks inside a band (polar winter), the morning "from" and evening
 *   "until" halves are one continuous window around midday, shown as a single range.
 */
function groupWindows(bands, bounds) {
  const groups = { morning: [], midday: [], evening: [], allDay: [] };

  for (const { key, label, phase, morning, evening } of bands) {
    const sameAllDay =
      (morning.kind === 'allDay' || morning.kind === 'none') && morning.kind === evening.kind && morning.note === evening.note;
    if (sameAllDay) {
      groups.allDay.push(windowItem(`${key}AllDay`, label, phase, morning, bounds));
    } else if (morning.kind === 'from' && evening.kind === 'until') {
      const view = { kind: 'range', start: morning.start, end: evening.end, note: null };
      groups.midday.push(windowItem(`${key}Midday`, label, phase, view, bounds));
    } else {
      groups.morning.push(windowItem(WINDOW[`${key.toUpperCase()}_MORNING`], label, phase, morning, bounds));
      groups.evening.push(windowItem(WINDOW[`${key.toUpperCase()}_EVENING`], label, phase, evening, bounds));
    }
  }

  // Morning: blue light comes before golden. Evening: golden before blue.
  const order = { morning: [PHASE.BLUE_HOUR, PHASE.GOLDEN_HOUR], midday: [PHASE.BLUE_HOUR, PHASE.GOLDEN_HOUR], evening: [PHASE.GOLDEN_HOUR, PHASE.BLUE_HOUR], allDay: [PHASE.GOLDEN_HOUR, PHASE.BLUE_HOUR] };
  return Object.entries(groups)
    .filter(([, rows]) => rows.length > 0)
    .map(([id, rows]) => ({
      id,
      label: GROUP_LABEL[id],
      rows: [...rows].sort((a, b) => order[id].indexOf(a.phase) - order[id].indexOf(b.phase)),
    }));
}

/**
 * @param {ReturnType<typeof import('../solar/times.js').getSunTimes>} times
 * @param {{ start: Date, end: Date }} bounds the civil day being shown
 */
export function buildDaySummary(times, bounds) {
  const golden = {
    lower: ELEVATION.GOLDEN_LOWER,
    upper: ELEVATION.GOLDEN_UPPER,
    noonElevation: times.noonElevation,
    nadirElevation: times.nadirElevation,
    messages: GOLDEN_MESSAGES,
  };
  const blue = { ...golden, lower: ELEVATION.CIVIL, upper: ELEVATION.GOLDEN_LOWER, messages: BLUE_MESSAGES };

  const stats = [
    {
      id: STAT.SUNRISE,
      label: 'Sunrise',
      phase: PHASE.GOLDEN_HOUR,
      value: times.sunrise ? { type: 'time', at: times.sunrise } : { type: 'message', text: horizonMessage(times, 'sunrise') },
      moments: times.sunrise ? [times.sunrise] : [],
      intervals: [],
    },
    {
      id: STAT.SOLAR_NOON,
      label: 'Solar noon',
      phase: PHASE.DAY,
      value: { type: 'time', at: times.solarNoon },
      elevation: times.noonElevation,
      moments: [times.solarNoon],
      intervals: [],
    },
    {
      id: STAT.SUNSET,
      label: 'Sunset',
      phase: PHASE.GOLDEN_HOUR,
      value: times.sunset ? { type: 'time', at: times.sunset } : { type: 'message', text: horizonMessage(times, 'sunset') },
      moments: times.sunset ? [times.sunset] : [],
      intervals: [],
    },
    {
      id: STAT.DAY_LENGTH,
      label: 'Day length',
      phase: PHASE.DAY,
      value: { type: 'duration', ms: times.dayLength },
      note: times.alwaysUp ? 'Midnight sun' : times.alwaysDown ? 'Polar night' : null,
      moments: [],
      intervals: [],
    },
  ];

  const windowGroups = groupWindows(
    [
      {
        key: 'golden',
        label: 'Golden hour',
        phase: PHASE.GOLDEN_HOUR,
        morning: describeBand(times.goldenHourMorning, 'morning', golden),
        evening: describeBand(times.goldenHourEvening, 'evening', golden),
      },
      {
        key: 'blue',
        label: 'Blue hour',
        phase: PHASE.BLUE_HOUR,
        morning: describeBand(times.blueHourMorning, 'morning', blue),
        evening: describeBand(times.blueHourEvening, 'evening', blue),
      },
    ],
    bounds,
  );

  return { stats, windowGroups };
}

/** Every item that can be highlighted, in one flat list. */
export const summaryItems = (summary) => [...summary.stats, ...summary.windowGroups.flatMap((g) => g.rows)];

/**
 * Which item is next, and which are happening now.
 * @param {{ id: string, moments: Date[], intervals: { start: Date, end: Date }[] }[]} items
 * @param {Date | null} now null when not viewing today
 */
export function findHighlights(items, now) {
  if (!now) return { nextId: null, activeIds: new Set() };
  const t = now.getTime();
  let nextId = null;
  let nextAt = Infinity;
  const activeIds = new Set();
  for (const item of items) {
    for (const moment of item.moments) {
      const m = moment.getTime();
      if (m > t && m < nextAt) {
        nextAt = m;
        nextId = item.id;
      }
    }
    if (item.intervals.some(({ start, end }) => start.getTime() <= t && t < end.getTime())) activeIds.add(item.id);
  }
  return { nextId, activeIds };
}
