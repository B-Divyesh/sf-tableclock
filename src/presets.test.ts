import { describe, expect, it } from 'vitest';
import { initialSetup } from './engine';
import { decodePreset, encodePreset } from './presets';

describe('shareable presets', () => {
  it('round-trips player names and timing rules', () => {
    const setup = initialSetup();
    setup.players[0]!.name = 'North';
    setup.settings.mode = 'fischer';
    setup.settings.durationSec = 180;
    setup.settings.incrementSec = 8;
    const result = decodePreset(encodePreset(setup));
    expect(result).toMatchObject({ v: 1, n: ['North', 'Player 2', 'Player 3'], m: 'fischer', d: 180, i: 8 });
  });

  it('rejects malformed data', () => {
    expect(decodePreset('not-a-preset')).toBeNull();
  });

  it('rejects non-finite and out-of-range timing values', () => {
    const malformed = (value: object) => btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
    expect(decodePreset(malformed({ v: 1, n: ['A', 'B'], m: 'bank', d: 300, i: -1, a: 0 }))).toBeNull();
    expect(decodePreset(malformed({ v: 1, n: ['A', 'B'], m: 'bank', d: 300, i: 0, a: 3_601 }))).toBeNull();
  });
});
