import { describe, expect, it, vi } from 'vitest';
import { createGame, endTurn, formatTime, initialSetup, nextEligible, pause, startOrResume, toggleOut } from './engine';

describe('clock engine', () => {
  it('accumulates only the active player and advances', () => {
    let game = startOrResume(createGame(initialSetup(), 1000), 1000);
    game = endTurn(game, 3500);
    expect(game.players[0]?.elapsedMs).toBe(2500);
    expect(game.activeIndex).toBe(1);
    expect(game.turnNumber).toBe(2);
  });

  it('applies Fischer increment after a turn', () => {
    const setup = initialSetup();
    setup.settings.mode = 'fischer';
    setup.settings.durationSec = 60;
    setup.settings.incrementSec = 5;
    let game = startOrResume(createGame(setup, 0), 0);
    game = endTurn(game, 2000);
    expect(game.players[0]?.remainingMs).toBe(63_000);
  });

  it('skips out players and supports reverse order', () => {
    const game = createGame(initialSetup());
    game.players[1]!.out = true;
    expect(nextEligible(game)).toBe(2);
    game.settings.direction = -1;
    expect(nextEligible(game)).toBe(2);
  });

  it('pauses when the active player is marked out', () => {
    let game = startOrResume(createGame(initialSetup(), 0), 0);
    game = toggleOut(game, 0, 1500);
    expect(game.running).toBe(false);
    expect(game.activeIndex).toBe(1);
  });

  it('does not count paused time', () => {
    let game = startOrResume(createGame(initialSetup(), 0), 0);
    game = pause(game, 1000);
    game = startOrResume(game, 10_000);
    game = endTurn(game, 11_000);
    expect(game.players[0]?.elapsedMs).toBe(2000);
  });

  it('formats game-length and short times', () => {
    expect(formatTime(65_000)).toBe('1:05');
    expect(formatTime(3_665_000)).toBe('1:01:05');
    expect(formatTime(12_345, true)).toBe('0:12.3');
  });
});
