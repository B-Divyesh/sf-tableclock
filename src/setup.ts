import type { Player } from './types';

export type ReorderDirection = 'up' | 'down';

/**
 * Moves one player one place in the turn order.
 *
 * The array is updated in place so callers can retain the saved setup object.
 * `false` means the player was already at that edge of the order.
 */
export function movePlayer(players: Player[], id: string, direction: ReorderDirection): boolean {
  const index = players.findIndex((player) => player.id === id);
  const destination = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || destination < 0 || destination >= players.length) return false;
  [players[index], players[destination]] = [players[destination]!, players[index]!];
  return true;
}
