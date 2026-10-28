/**
 * A CSS linear-gradient for the 24-hour bar, built from the day's real phase segments.
 *
 * Each segment keeps its solid colour across its own span; neighbouring colours blend
 * over a short band centred on the boundary, so transitions look soft while staying
 * at the correct time of day.
 *
 * @param {{ phase: string, start: Date, end: Date }[]} segments contiguous, in time order
 * @param {{ start: Date, end: Date }} bounds the day shown
 * @param {Record<string, string>} colors colour per phase key
 * @param {number} [maxBlend] largest half-width of a blend, in percent of the bar
 */
export function buildTimelineGradient(segments, bounds, colors, maxBlend = 0.8) {
  if (segments.length === 0) return 'none';
  const start = bounds.start.getTime();
  const span = bounds.end.getTime() - start;
  const pct = (date) => Math.min(100, Math.max(0, ((date.getTime() - start) / span) * 100));
  const fmt = (value) => `${Math.round(value * 100) / 100}%`;

  const stops = [];
  segments.forEach((segment, i) => {
    const a = pct(segment.start);
    const b = pct(segment.end);
    // Short segments (a few-minute blue hour) blend over less, so they stay visible.
    const blend = Math.min(maxBlend, (b - a) / 3);
    const color = colors[segment.phase];
    stops.push(`${color} ${fmt(i === 0 ? a : a + blend)}`);
    stops.push(`${color} ${fmt(i === segments.length - 1 ? b : b - blend)}`);
  });
  return `linear-gradient(90deg, ${stops.join(', ')})`;
}
