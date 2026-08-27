import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio, OUT_LABEL_COLOR, RUNNING_STRIP_COLOR } from './running-colors';

const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

describe('running clock accessibility state', () => {
  it('keeps an out marker fully opaque and above AA contrast on the running strip', () => {
    const outRule = styles.match(/\.mini-player\.is-out\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(outRule).not.toMatch(/opacity\s*:/);
    expect(OUT_LABEL_COLOR).toBe('#ffd4cf');
    expect(RUNNING_STRIP_COLOR).toBe('#151310');
    expect(contrastRatio(OUT_LABEL_COLOR, RUNNING_STRIP_COLOR)).toBeGreaterThanOrEqual(4.5);
  });
});
