import { describe, expect, it } from 'vitest';
import { vibrationPattern } from './haptics';

describe('haptic cue permissions', () => {
  it('vibrates a turn only after a pointer activation', () => {
    expect(vibrationPattern('turn', true, true)).toBe(35);
  });

  it('suppresses keyboard and autonomous clock-state vibrations', () => {
    expect(vibrationPattern('turn', true, false)).toBeNull();
    expect(vibrationPattern('nudge', true, true)).toBeNull();
    expect(vibrationPattern('expired', true, true)).toBeNull();
    expect(vibrationPattern('turn', false, true)).toBeNull();
  });
});
