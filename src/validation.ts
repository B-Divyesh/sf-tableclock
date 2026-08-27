import { DEFAULT_SETTINGS, PLAYER_COLORS, makePlayer } from './engine';
import type { ClockMode, GameState, Player, SavedSetup, Settings } from './types';

export const CLOCK_MODES: readonly ClockMode[] = ['countup', 'bank', 'fischer', 'fixed'];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isFiniteInRange = (value: unknown, minimum: number, maximum: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum;
const isWholeSecondsInRange = (value: unknown, minimum: number, maximum: number): value is number =>
  isFiniteInRange(value, minimum, maximum) && Number.isInteger(value);

export function isClockMode(value: unknown): value is ClockMode {
  return typeof value === 'string' && CLOCK_MODES.includes(value as ClockMode);
}

/** Validate the portable settings shape before it can reach the clock engine. */
export function hasValidSettings(value: unknown): value is Settings {
  if (!isRecord(value) || !isClockMode(value.mode)) return false;
  if (!isWholeSecondsInRange(value.durationSec, 5, 86_400)) return false;
  if (!isWholeSecondsInRange(value.incrementSec, 0, 3_600)) return false;
  if (!isWholeSecondsInRange(value.nudgeSec, 0, 3_600)) return false;
  if ('sound' in value && typeof value.sound !== 'boolean') return false;
  if ('vibration' in value && typeof value.vibration !== 'boolean') return false;
  if ('direction' in value && value.direction !== 1 && value.direction !== -1) return false;
  return true;
}

function hasValidPlayerNames(value: unknown): value is Array<Record<string, unknown>> {
  return Array.isArray(value)
    && value.length >= 2
    && value.length <= 8
    && value.every((player) => isRecord(player)
      && typeof player.name === 'string'
      && player.name.trim().length > 0
      && player.name.trim().length <= 24);
}

/**
 * Converts a file export into the only setup shape accepted by the app. Player
 * ids, colours and timing counters are always recreated locally.
 */
export function parseImportedSetup(value: unknown): SavedSetup | null {
  if (!isRecord(value) || value.version !== 1 || !hasValidPlayerNames(value.players) || !hasValidSettings(value.settings)) return null;
  const settings = value.settings;
  return {
    version: 1,
    players: value.players.map((player, index) => ({
      ...makePlayer((player.name as string).trim(), index),
      color: PLAYER_COLORS[index]!,
    })),
    settings: {
      ...DEFAULT_SETTINGS,
      mode: settings.mode,
      durationSec: settings.durationSec,
      incrementSec: settings.incrementSec,
      nudgeSec: settings.nudgeSec,
      ...(typeof settings.sound === 'boolean' ? { sound: settings.sound } : {}),
      ...(typeof settings.vibration === 'boolean' ? { vibration: settings.vibration } : {}),
      ...(settings.direction === 1 || settings.direction === -1 ? { direction: settings.direction } : {}),
    },
  };
}

export function setupValidationError(setup: Pick<SavedSetup, 'players' | 'settings'>): string | null {
  if (!hasValidPlayerNames(setup.players)) return 'Use two to eight player names, each up to 24 characters.';
  if (!isClockMode(setup.settings.mode)) return 'Choose a valid clock mode.';
  if (!isWholeSecondsInRange(setup.settings.durationSec, 5, 86_400)) return 'Choose a whole-number starting time between 5 and 86,400 seconds.';
  if (!isWholeSecondsInRange(setup.settings.incrementSec, 0, 3_600)) return 'Choose a whole-number increment between 0 and 3,600 seconds.';
  if (!isWholeSecondsInRange(setup.settings.nudgeSec, 0, 3_600)) return 'Choose a whole-number nudge between 0 and 3,600 seconds.';
  return null;
}

function hasFiniteGamePlayer(value: unknown): value is Player {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.color === 'string'
    && typeof value.out === 'boolean'
    && isFiniteInRange(value.elapsedMs, 0, Number.MAX_SAFE_INTEGER)
    && isFiniteInRange(value.remainingMs, 0, Number.MAX_SAFE_INTEGER);
}

/** Reject corrupted IndexedDB state rather than rendering an unusable clock. */
export function isValidGameState(value: unknown): value is GameState {
  if (!isRecord(value) || value.version !== 1 || !hasValidSettings(value.settings) || !Array.isArray(value.players)) return false;
  if (value.players.length < 2 || value.players.length > 8 || !value.players.every(hasFiniteGamePlayer)) return false;
  return typeof value.activeIndex === 'number'
    && Number.isInteger(value.activeIndex)
    && value.activeIndex >= 0
    && value.activeIndex < value.players.length
    && typeof value.running === 'boolean'
    && value.started === true
    && (value.turnStartedAt === null || isFiniteInRange(value.turnStartedAt, 0, Number.MAX_SAFE_INTEGER))
    && isFiniteInRange(value.turnBaseElapsedMs, 0, Number.MAX_SAFE_INTEGER)
    && isFiniteInRange(value.turnBaseRemainingMs, 0, Number.MAX_SAFE_INTEGER)
    && typeof value.turnNumber === 'number'
    && Number.isInteger(value.turnNumber)
    && value.turnNumber >= 1
    && isFiniteInRange(value.updatedAt, 0, Number.MAX_SAFE_INTEGER);
}
