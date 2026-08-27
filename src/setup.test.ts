import { describe, expect, it } from 'vitest';
import { initialSetup } from './engine';
import { movePlayer } from './setup';

describe('setup player reordering', () => {
  it('moves the selected player up or down by one place', () => {
    const setup = initialSetup();
    const selected = setup.players[1]!;

    expect(movePlayer(setup.players, selected.id, 'up')).toBe(true);
    expect(setup.players.map((player) => player.name)).toEqual(['Player 2', 'Player 1', 'Player 3']);

    expect(movePlayer(setup.players, selected.id, 'down')).toBe(true);
    expect(setup.players.map((player) => player.name)).toEqual(['Player 1', 'Player 2', 'Player 3']);
  });

  it('does not move beyond either edge', () => {
    const setup = initialSetup();
    expect(movePlayer(setup.players, setup.players[0]!.id, 'up')).toBe(false);
    expect(movePlayer(setup.players, setup.players[2]!.id, 'down')).toBe(false);
    expect(setup.players.map((player) => player.name)).toEqual(['Player 1', 'Player 2', 'Player 3']);
  });
});
