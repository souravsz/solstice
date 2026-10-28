import { describe, expect, it } from 'vitest';
import { contrastRatio, hexToRgb, overlayRgb } from '../color/color.js';
import { DARK_TEXT, LIGHT_TEXT, TEXT_REGION_END, sampleGradient, skyColors, skyGradient } from './skyGradient.js';

const elevations = [];
for (let e = -90; e <= 90; e += 0.25) elevations.push(e);

describe('skyGradient', () => {
  it('keeps AA contrast for text across every elevation', () => {
    for (const e of elevations) {
      const sky = skyGradient(e);
      const scrim = hexToRgb(sky.textColor === LIGHT_TEXT ? '#060914' : '#FFFFFF');
      for (let t = 0; t <= TEXT_REGION_END; t += 0.01) {
        const color = overlayRgb(sampleGradient(sky.colors, t), scrim, sky.scrimOpacity);
        expect(contrastRatio(color, sky.textColor), `elevation ${e}, position ${t.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('changes smoothly, with no hard jumps between nearby elevations', () => {
    for (let e = -90; e < 90; e += 0.1) {
      const a = skyColors(e).map(hexToRgb);
      const b = skyColors(e + 0.1).map(hexToRgb);
      for (let i = 0; i < 3; i += 1) {
        for (const channel of ['r', 'g', 'b']) {
          expect(Math.abs(a[i][channel] - b[i][channel])).toBeLessThanOrEqual(6);
        }
      }
    }
  });

  it('is dark with light text at night and light with dark text by day', () => {
    expect(skyGradient(-30).textColor).toBe(LIGHT_TEXT);
    expect(skyGradient(-5).textColor).toBe(LIGHT_TEXT);
    expect(skyGradient(40).textColor).toBe(DARK_TEXT);
    expect(skyGradient(-30).scrimOpacity).toBe(0);
    expect(skyGradient(40).scrimOpacity).toBe(0);
  });

  it('gives a warm horizon in golden hour and a cool one by day', () => {
    const golden = hexToRgb(skyGradient(3).horizon);
    expect(golden.r).toBeGreaterThan(golden.b);
    const day = hexToRgb(skyGradient(50).horizon);
    expect(day.b).toBeGreaterThan(day.r);
  });

  it('tolerates out-of-range and invalid input', () => {
    expect(skyGradient(200).colors).toEqual(skyGradient(90).colors);
    expect(skyGradient(Number.NaN).colors).toEqual(skyGradient(-90).colors);
  });
});
