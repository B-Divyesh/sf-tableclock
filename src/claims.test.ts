import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('claim contract', () => {
  it('maps every declared claim to exactly one tagged browser test', () => {
    const claims = JSON.parse(readFileSync(new URL('../.factory/claims.json', import.meta.url), 'utf8')) as { id: string; test: string }[];
    const browserTests = readFileSync(new URL('../e2e/clock.spec.ts', import.meta.url), 'utf8');
    const ids = claims.map((claim) => claim.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const claim of claims) {
      expect(claim.test).toBe(`npm run test:e2e -- --grep @claim:${claim.id}`);
      expect(browserTests.match(new RegExp(`@claim:${claim.id}(?![a-z-])`, 'g'))).toHaveLength(1);
    }
    const tags = [...browserTests.matchAll(/@claim:([a-z-]+)/g)].map((match) => match[1]);
    expect(tags.sort()).toEqual([...ids].sort());
  });
});
