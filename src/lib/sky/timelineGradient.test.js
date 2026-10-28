import { describe, expect, it } from 'vitest';
import { getPhaseSegments } from '../solar/index.js';
import { civilDayBounds } from '../time/zoned.js';
import { buildTimelineGradient } from './timelineGradient.js';

const COLORS = { night: 'N', blueHour: 'B', goldenHour: 'G', day: 'D' };

const stopsOf = (gradient) =>
  gradient
    .replace(/^linear-gradient\(90deg, /, '')
    .replace(/\)$/, '')
    .split(', ')
    .map((stop) => {
      const [color, at] = stop.split(' ');
      return { color, at: Number.parseFloat(at) };
    });

describe('buildTimelineGradient', () => {
  const bounds = civilDayBounds('2026-10-29', 'Europe/Lisbon');
  const segments = getPhaseSegments(bounds.start, bounds.end, 38.7223, -9.1393);

  it('runs night → blue → golden → day → golden → blue → night across the whole bar', () => {
    const stops = stopsOf(buildTimelineGradient(segments, bounds, COLORS));
    const colors = stops.filter((_, i) => i % 2 === 0).map((s) => s.color);
    expect(colors.join('')).toBe('NBGDGBN');
    expect(stops[0].at).toBe(0);
    expect(stops.at(-1).at).toBe(100);
  });

  it('keeps stops in order and blends close to each real boundary', () => {
    const stops = stopsOf(buildTimelineGradient(segments, bounds, COLORS));
    for (let i = 1; i < stops.length; i += 1) expect(stops[i].at).toBeGreaterThanOrEqual(stops[i - 1].at);
    const span = bounds.end - bounds.start;
    const sunriseBoundary = ((segments[2].start - bounds.start) / span) * 100;
    expect(Math.abs(stops[3].at - sunriseBoundary)).toBeLessThanOrEqual(0.8);
  });

  it('handles a single all-night segment', () => {
    const gradient = buildTimelineGradient([{ phase: 'night', start: bounds.start, end: bounds.end }], bounds, COLORS);
    expect(gradient).toBe('linear-gradient(90deg, N 0%, N 100%)');
    expect(buildTimelineGradient([], bounds, COLORS)).toBe('none');
  });
});
