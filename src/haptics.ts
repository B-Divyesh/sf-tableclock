export type CueKind = 'turn' | 'nudge' | 'expired';

/**
 * Chromium only permits vibration after a pointing-device activation. Keyboard
 * activation is intentionally excluded: it is a valid way to operate the
 * clock, but it does not grant the haptics permission and would log an error.
 */
export function vibrationPattern(kind: CueKind, enabled: boolean, pointerActivated: boolean): VibratePattern | null {
  if (!enabled || !pointerActivated || kind !== 'turn') return null;
  return 35;
}
