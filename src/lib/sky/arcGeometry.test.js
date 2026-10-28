import { describe, expect, it } from 'vitest';
import { sampleElevations } from '../solar/index.js';
import { civilDayBounds } from '../time/zoned.js';
import { buildArcGeometry, smoothPath } from './arcGeometry.js';

describe('arc geometry', () => {
  const bounds = civilDayBounds('2026-06-21', 'Europe/Paris');
  const samples = sampleElevations(bounds.start, bounds.end, 48.8566, 2.3522, 10);

  it('samples every 10 minutes across the day', () => {
    expect(samples.length).toBe(24 * 6 + 1);
    expect(samples.at(-1).t).toBe(bounds.end.getTime());
  });

  it('maps the day onto the plot and keeps the horizon inside it', () => {
    const g = buildArcGeometry(samples, bounds, { width: 360, height: 200 });
    expect(g.x(bounds.start.getTime())).toBe(g.plot.x);
    expect(g.x(bounds.end.getTime())).toBeCloseTo(g.plot.x + g.plot.width);
    expect(g.horizonY).toBeGreaterThan(g.plot.y);
    expect(g.horizonY).toBeLessThan(g.plot.y + g.plot.height);
    expect(g.peak.elevation).toBeGreaterThan(64);
    expect(g.bands.golden.y0).toBeLessThan(g.bands.golden.y1);
    expect(g.path.startsWith('M')).toBe(true);
  });

  it('builds paths for degenerate inputs', () => {
    expect(smoothPath([])).toBe('');
    expect(smoothPath([{ x: 1, y: 2 }])).toBe('M1,2');
  });
});
