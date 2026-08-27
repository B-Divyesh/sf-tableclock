import type { GameState, Player, SavedSetup, Settings } from './types';

export const PLAYER_COLORS = ['#175A70', '#84372E', '#2F6249', '#67405D', '#8A5A10', '#334868', '#53632D', '#50585D'];

export const DEFAULT_SETTINGS: Settings = {
  mode: 'countup',
  durationSec: 300,
  incrementSec: 10,
  nudgeSec: 90,
  sound: true,
  vibration: true,
  direction: 1,
};

export function makePlayer(name: string, index: number): Player {
  return {
    id: crypto.randomUUID(),
    name,
    color: PLAYER_COLORS[index % PLAYER_COLORS.length] ?? PLAYER_COLORS[0]!,
    elapsedMs: 0,
    remainingMs: DEFAULT_SETTINGS.durationSec * 1000,
    out: false,
  };
}

export function initialSetup(): SavedSetup {
  return { version: 1, players: [makePlayer('Player 1', 0), makePlayer('Player 2', 1), makePlayer('Player 3', 2)], settings: { ...DEFAULT_SETTINGS } };
}

export function createGame(setup: SavedSetup, now = Date.now()): GameState {
  const duration = setup.settings.durationSec * 1000;
  return {
    ...structuredClone(setup),
    players: setup.players.map((p) => ({ ...p, elapsedMs: 0, remainingMs: duration, out: false })),
    activeIndex: 0,
    running: false,
    started: true,
    turnStartedAt: null,
    turnBaseElapsedMs: 0,
    turnBaseRemainingMs: duration,
    turnNumber: 1,
    updatedAt: now,
  };
}

export function activeValues(state: GameState, now = Date.now()): { elapsedMs: number; remainingMs: number } {
  const player = state.players[state.activeIndex];
  if (!player) return { elapsedMs: 0, remainingMs: 0 };
  if (!state.running || state.turnStartedAt === null) return { elapsedMs: player.elapsedMs, remainingMs: player.remainingMs };
  const delta = Math.max(0, now - state.turnStartedAt);
  const elapsedMs = state.turnBaseElapsedMs + delta;
  const remainingMs = Math.max(0, state.turnBaseRemainingMs - delta);
  return { elapsedMs, remainingMs };
}

export function startOrResume(state: GameState, now = Date.now()): GameState {
  if (state.running) return state;
  const active = state.players[state.activeIndex];
  if (!active) return state;
  return { ...state, running: true, turnStartedAt: now, turnBaseElapsedMs: active.elapsedMs, turnBaseRemainingMs: active.remainingMs, updatedAt: now };
}

export function pause(state: GameState, now = Date.now()): GameState {
  if (!state.running) return state;
  const values = activeValues(state, now);
  const players = state.players.map((player, index) => index === state.activeIndex ? { ...player, ...values } : player);
  return { ...state, players, running: false, turnStartedAt: null, updatedAt: now };
}

export function nextEligible(state: Pick<GameState, 'players' | 'activeIndex' | 'settings'>): number {
  const count = state.players.length;
  for (let step = 1; step <= count; step += 1) {
    const candidate = (state.activeIndex + step * state.settings.direction + count * 2) % count;
    if (!state.players[candidate]?.out) return candidate;
  }
  return state.activeIndex;
}

export function endTurn(state: GameState, now = Date.now()): GameState {
  if (!state.running) return state;
  const values = activeValues(state, now);
  const players = state.players.map((player, index) => {
    if (index !== state.activeIndex) return player;
    const increment = state.settings.mode === 'fischer' ? state.settings.incrementSec * 1000 : 0;
    return { ...player, elapsedMs: values.elapsedMs, remainingMs: values.remainingMs + increment };
  });
  const provisional = { ...state, players };
  const activeIndex = nextEligible(provisional);
  const next = players[activeIndex];
  if (!next || activeIndex === state.activeIndex && players.filter((p) => !p.out).length <= 1) return pause({ ...state, players }, now);
  const perTurn = state.settings.mode === 'fixed' ? state.settings.durationSec * 1000 : next.remainingMs;
  const nextPlayers = players.map((p, i) => i === activeIndex && state.settings.mode === 'fixed' ? { ...p, remainingMs: perTurn } : p);
  return {
    ...state,
    players: nextPlayers,
    activeIndex,
    turnNumber: state.turnNumber + 1,
    turnStartedAt: now,
    turnBaseElapsedMs: next.elapsedMs,
    turnBaseRemainingMs: perTurn,
    updatedAt: now,
  };
}

export function toggleOut(state: GameState, index: number, now = Date.now()): GameState {
  const player = state.players[index];
  if (!player) return state;
  const wasActive = index === state.activeIndex;
  const players = state.players.map((p, i) => i === index ? { ...p, out: !p.out } : p);
  let next = { ...state, players, updatedAt: now };
  if (wasActive && players[index]?.out) {
    next = pause(next, now);
    const activeIndex = nextEligible(next);
    const active = players[activeIndex];
    if (active) next = { ...next, activeIndex, turnBaseElapsedMs: active.elapsedMs, turnBaseRemainingMs: active.remainingMs };
  }
  return next;
}

export function formatTime(ms: number, tenths = false): string {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.floor(safe / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const base = `${minutes}:${String(seconds).padStart(2, '0')}`;
  return tenths && safe < 60_000 ? `${base}.${Math.floor((safe % 1000) / 100)}` : base;
}
