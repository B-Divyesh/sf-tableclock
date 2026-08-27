import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const main = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

describe('running player strip regressions', () => {
  it('keeps the 390px horizontal strip keyboard-focusable and arrow-scrollable', () => {
    expect(main).toContain('class="player-strip" tabindex="0"');
    expect(main).toContain("target.matches('.player-strip')");
    expect(main).toContain("event.key === 'ArrowRight'");
    expect(styles).toMatch(/\.player-strip\s*\{[^}]*overflow-x:\s*auto/s);
  });

  it('keeps desktop players in a non-scrolling responsive grid', () => {
    expect(styles).toMatch(/@media \(min-width: 820px\)\s*\{\s*\.player-strip\s*\{\s*grid-auto-flow:\s*initial;\s*grid-template-columns:\s*repeat\(auto-fit, minmax\(120px, 1fr\)\);/s);
  });
});
