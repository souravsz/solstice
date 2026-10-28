import { minutesIntoDay } from '../time/zoned.js';

/**
 * Plain-language comparisons between a day and the one after it, e.g.
 * "Tomorrow’s sunrise is 1 min earlier".
 */

const WORDS = {
  tomorrow: { subject: 'Tomorrow', possessive: 'Tomorrow’s', adverb: 'tomorrow' },
  nextDay: { subject: 'The next day', possessive: 'The next day’s', adverb: 'the next day' },
};

function formatMinutes(totalMinutes) {
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

/** Clock-time shift of an event, in minutes (positive = later the next day). */
export function clockShiftMinutes(today, tomorrow, timeZone) {
  let diff = minutesIntoDay(tomorrow, timeZone) - minutesIntoDay(today, timeZone);
  // Events can wrap past midnight at high latitudes; take the shortest way round.
  if (diff > 720) diff -= 1440;
  if (diff < -720) diff += 1440;
  return diff;
}

/**
 * @param {'sunrise' | 'sunset'} event
 * @param {{ sunrise: Date|null, sunset: Date|null, alwaysUp: boolean, alwaysDown: boolean }} today
 * @param {typeof today} tomorrow
 * @param {string} timeZone
 * @param {'tomorrow' | 'nextDay'} [wording]
 * @returns {string | null}
 */
export function describeEventShift(event, today, tomorrow, timeZone, wording = 'tomorrow') {
  const w = WORDS[wording];
  const a = today[event];
  const b = tomorrow[event];
  if (a && b) {
    const diff = clockShiftMinutes(a, b, timeZone);
    if (Math.abs(diff) < 0.5) return `${w.possessive} ${event} is at about the same time`;
    return `${w.possessive} ${event} is ${formatMinutes(Math.abs(diff))} ${diff > 0 ? 'later' : 'earlier'}`;
  }
  if (!a && b) return event === 'sunrise' ? `The sun rises again ${w.adverb}` : `The sun sets again ${w.adverb}`;
  if (a && !b) return tomorrow.alwaysUp ? `${w.subject} the sun doesn’t set` : `${w.subject} the sun doesn’t rise`;
  return null;
}

/** "Tomorrow is 2 min 13 s longer" */
export function describeDayLengthChange(todayMs, tomorrowMs, wording = 'tomorrow') {
  const w = WORDS[wording];
  const diffSeconds = Math.round((tomorrowMs - todayMs) / 1000);
  const abs = Math.abs(diffSeconds);
  if (abs < 1) return `${w.subject} is about as long`;
  const minutes = Math.floor(abs / 60);
  const seconds = abs % 60;
  const amount = minutes === 0 ? `${seconds} s` : seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} s`;
  return `${w.subject} is ${amount} ${diffSeconds > 0 ? 'longer' : 'shorter'}`;
}

/** All comparison lines for the day length card, skipping any that don't apply. */
export function describeTomorrow(today, tomorrow, timeZone, wording = 'tomorrow') {
  const w = WORDS[wording];
  const lines = [];
  const bothNormal = today.sunrise && today.sunset && tomorrow.sunrise && tomorrow.sunset;
  if (bothNormal) lines.push(describeDayLengthChange(today.dayLength, tomorrow.dayLength, wording));
  else if (today.alwaysUp && tomorrow.alwaysUp) lines.push(`The midnight sun continues ${w.adverb}`);
  else if (today.alwaysDown && tomorrow.alwaysDown) lines.push(`The polar night continues ${w.adverb}`);
  for (const event of ['sunrise', 'sunset']) {
    const line = describeEventShift(event, today, tomorrow, timeZone, wording);
    if (line) lines.push(line);
  }
  return lines;
}
