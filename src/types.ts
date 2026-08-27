export type ClockMode = 'countup' | 'bank' | 'fischer' | 'fixed';

export interface Player {
  id: string;
  name: string;
  color: string;
  elapsedMs: number;
  remainingMs: number;
  out: boolean;
}

export interface Settings {
  mode: ClockMode;
  durationSec: number;
  incrementSec: number;
  nudgeSec: number;
  sound: boolean;
  vibration: boolean;
  direction: 1 | -1;
}

export interface SavedSetup {
  version: 1;
  players: Player[];
  settings: Settings;
}

export interface GameState extends SavedSetup {
  activeIndex: number;
  running: boolean;
  started: boolean;
  turnStartedAt: number | null;
  turnBaseElapsedMs: number;
  turnBaseRemainingMs: number;
  turnNumber: number;
  updatedAt: number;
}
