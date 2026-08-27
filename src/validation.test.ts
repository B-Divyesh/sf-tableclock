import { describe, expect, it } from 'vitest';
import { formatTime } from './engine';
import { parseImportedSetup } from './validation';

const validImport = {
  version: 1,
  players: [{ name: 'A' }, { name: 'B' }],
  settings: { mode: 'fischer', durationSec: 300, incrementSec: 10, nudgeSec: 90 },
};

describe('setup import validation', () => {
  it('rejects the reported malformed import before it can create a game', () => {
    expect(parseImportedSetup({
      version: 1,
      players: [{ name: 'A' }, { name: 'B' }],
      settings: { mode: 'nonsense', durationSec: 'not-a-number', incrementSec: -99, nudgeSec: 'x' },
    })).toBeNull();
  });

  it.each([
    [{ ...validImport, settings: { ...validImport.settings, durationSec: Number.NaN } }],
    [{ ...validImport, settings: { ...validImport.settings, durationSec: 86_401 } }],
    [{ ...validImport, settings: { ...validImport.settings, durationSec: 5.5 } }],
    [{ ...validImport, settings: { ...validImport.settings, incrementSec: -1 } }],
    [{ ...validImport, settings: { ...validImport.settings, incrementSec: Number.POSITIVE_INFINITY } }],
    [{ ...validImport, settings: { ...validImport.settings, nudgeSec: -1 } }],
    [{ ...validImport, settings: { ...validImport.settings, nudgeSec: '90' } }],
    [{ ...validImport, players: [{ name: '' }, { name: 'B' }] }],
  ])('rejects invalid imported fields', (incoming) => {
    expect(parseImportedSetup(incoming)).toBeNull();
  });

  it('keeps the display finite as a defensive last line of protection', () => {
    expect(formatTime(Number.NaN, true)).toBe('0:00.0');
  });
});
