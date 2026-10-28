import { ELEVATION } from '../solar/constants.js';

const round = (v) => Math.round(v * 10) / 10;

/** Smooth SVG path through points using a Catmull-Rom spline converted to cubic Béziers. */
export function smoothPath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${round(points[0].x)},${round(points[0].y)}`;
  let d = `M${round(points[0].x)},${round(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${round(c1x)},${round(c1y)} ${round(c2x)},${round(c2y)} ${round(p2.x)},${round(p2.y)}`;
  }
  return d;
}

/**
 * Layout for the sun-path chart.
 * @param {{ t: number, elevation: number }[]} samples
 * @param {{ start: Date, end: Date }} bounds
 * @param {{ width: number, height: number, padding?: { top: number, right: number, bottom: number, left: number } }} size
 */
export function buildArcGeometry(samples, bounds, { width, height, padding = { top: 36, right: 12, bottom: 30, left: 12 } }) {
  const maxElevation = Math.max(...samples.map((s) => s.elevation));
  const minElevation = Math.min(...samples.map((s) => s.elevation));

  // Keep the horizon visible and give low winter suns some height to work with.
  const yMax = Math.max(maxElevation + 6, 16);
  const yMin = Math.min(-14, Math.max(minElevation - 4, -Math.max(36, yMax * 0.6)));

  const innerWidth = Math.max(1, width - padding.left - padding.right);
  const innerHeight = Math.max(1, height - padding.top - padding.bottom);
  const t0 = bounds.start.getTime();
  const span = bounds.end.getTime() - t0;

  const x = (time) => padding.left + ((time - t0) / span) * innerWidth;
  const y = (elevation) => padding.top + ((yMax - elevation) / (yMax - yMin)) * innerHeight;

  const points = samples.map((s) => ({ x: x(s.t), y: y(s.elevation) }));
  const peak = samples.reduce((best, s) => (s.elevation > best.elevation ? s : best), samples[0]);

  const plot = { x: padding.left, y: padding.top, width: innerWidth, height: innerHeight };

  return {
    width,
    height,
    plot,
    x,
    y,
    path: smoothPath(points),
    horizonY: y(0),
    peak: { x: x(peak.t), y: y(peak.elevation), elevation: peak.elevation, t: peak.t },
    /** Horizontal bands (in SVG y) for clipping the arc into phase colours. */
    bands: {
      day: { y0: 0, y1: y(ELEVATION.GOLDEN_UPPER) },
      golden: { y0: y(ELEVATION.GOLDEN_UPPER), y1: y(ELEVATION.GOLDEN_LOWER) },
      blue: { y0: y(ELEVATION.GOLDEN_LOWER), y1: y(ELEVATION.CIVIL) },
      night: { y0: y(ELEVATION.CIVIL), y1: height },
    },
  };
}
