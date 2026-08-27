import type { SavedSetup } from './types';

interface PortablePreset {
  v: 1;
  n: string[];
  m: SavedSetup['settings']['mode'];
  d: number;
  i: number;
  a: number;
}

export function encodePreset(setup: SavedSetup): string {
  const portable: PortablePreset = {
    v: 1,
    n: setup.players.map((p) => p.name.slice(0, 24)),
    m: setup.settings.mode,
    d: setup.settings.durationSec,
    i: setup.settings.incrementSec,
    a: setup.settings.nudgeSec,
  };
  const bytes = new TextEncoder().encode(JSON.stringify(portable));
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export function decodePreset(value: string): PortablePreset | null {
  try {
    const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const candidate = JSON.parse(new TextDecoder().decode(bytes)) as Partial<PortablePreset>;
    if (candidate.v !== 1 || !Array.isArray(candidate.n) || candidate.n.length < 2 || candidate.n.length > 8) return null;
    if (!['countup', 'bank', 'fischer', 'fixed'].includes(candidate.m ?? '')) return null;
    if (!Number.isFinite(candidate.d) || candidate.d! < 5 || candidate.d! > 86_400) return null;
    return candidate as PortablePreset;
  } catch {
    return null;
  }
}
