import { describe, expect, it } from 'vitest';
import { contrastRatio, mixHex } from '../lib/color/color.js';
import { focusRing, phaseAccents, sun, surfaces } from './tokens.js';

describe.each(['light', 'dark'])('%s theme contrast', (mode) => {
  const s = surfaces[mode];
  const backgrounds = [s.background, s.surface, s.surfaceMuted];

  it('meets WCAG AA for every text colour on every surface', () => {
    for (const text of [s.textPrimary, s.textSecondary, s.textTertiary]) {
      for (const bg of backgrounds) expect(contrastRatio(text, bg)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps phase accents and the focus ring visible (3:1 for UI graphics)', () => {
    for (const accent of [...Object.values(phaseAccents[mode]), focusRing[mode]]) {
      for (const bg of backgrounds) expect(contrastRatio(accent, bg)).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps soft chip text readable on its tinted background', () => {
    const k = sun[mode];
    for (const tone of ['golden', 'blue']) {
      // Chips are filled with the phase colour at 12% over the card.
      const chip = mixHex(s.surface, k[tone], 0.12);
      expect(contrastRatio(k[`${tone}Text`], chip)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(k[`${tone}Text`], s.surface)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('uses readable primary buttons', () => {
    expect(contrastRatio(s.ink, s.onInk)).toBeGreaterThanOrEqual(7);
  });
});
