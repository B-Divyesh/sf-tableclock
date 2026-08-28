import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function openDemoSetup(page: Page): Promise<void> {
  await page.goto('/demo');
  await page.getByRole('button', { name: /tableclock menu/i }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /end game and return to setup/i }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Time every player’s turn');
}

async function startMode(page: Page, mode: 'Count up' | 'Time bank' | 'Bank with increment' | 'Per-turn limit'): Promise<void> {
  await openDemoSetup(page);
  await page.getByRole('radio', { name: new RegExp(mode, 'i') }).check();
  if (mode !== 'Count up') await page.getByLabel(mode === 'Per-turn limit' ? 'Per turn' : 'Starting bank').fill('5');
  if (mode === 'Bank with increment') await page.getByRole('spinbutton', { name: /increment/i }).fill('3');
  await page.getByRole('button', { name: /start the clock/i }).click();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
}

async function readStoredState(page: Page, database: string): Promise<{ setup: Record<string, any> | null; game: Record<string, any> | null }> {
  return page.evaluate(async (databaseName) => new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('state')) { db.close(); resolve({ setup: null, game: null }); return; }
      const transaction = db.transaction('state', 'readonly');
      const setupRequest = transaction.objectStore('state').get('setup');
      const gameRequest = transaction.objectStore('state').get('game');
      transaction.oncomplete = () => { db.close(); resolve({ setup: setupRequest.result ?? null, game: gameRequest.result ?? null }); };
      transaction.onerror = () => reject(transaction.error);
    };
    request.onerror = () => reject(request.error);
  }), database);
}

async function readStoredPlayerName(page: Page, database: string): Promise<string | null> {
  return (await readStoredState(page, database)).setup?.players?.[0]?.name ?? null;
}

test('@claim:demo-seed opens the one-click running four-player sample', async ({ page }) => {
  await page.goto('/');
  const action = page.getByRole('button', { name: /try it with sample data/i });
  await expect(action).toBeVisible();
  await action.click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page).toHaveTitle('Demo — Tableclock');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Game clock');
  await expect(page.locator('.demo-banner')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.locator('.active-clock')).toContainText('Priya');
  await expect(page.locator('.turn-meta')).toContainText('Turn 3');
  await expect(page.locator('.player-strip .mini-player')).toHaveCount(4);
  await page.goto('/?demo=1');
  await expect(page.locator('.demo-banner')).toContainText('nothing is saved');
  await expect(page.locator('.active-clock')).toContainText('Priya');
});

test('@claim:demo-isolation never reads or changes a real game', async ({ page }) => {
  await page.goto('/?new=1');
  await page.locator('[data-player-name]').first().fill('Real Ada');
  await expect.poll(() => readStoredPlayerName(page, 'tableclock-local')).toBe('Real Ada');
  await page.getByRole('button', { name: /try it with sample data/i }).click();
  await expect(page.locator('body')).not.toContainText('Real Ada');
  await page.locator('.active-clock').click();
  await expect(page.locator('.active-clock')).toContainText('Sora');
  await page.getByRole('button', { name: /start for real/i }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('[data-player-name]').first()).toHaveValue('Real Ada');
  await expect.poll(() => readStoredPlayerName(page, 'tableclock-demo')).toBeNull();
});

test('@claim:demo-reset restores the original sample', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.locator('.active-clock').click();
  await expect(page.locator('.active-clock')).toContainText('Sora');
  await page.getByRole('button', { name: /reset demo/i }).click();
  await expect(page.locator('.active-clock')).toContainText('Priya');
  await expect(page.locator('.turn-meta')).toContainText('Turn 3');
});

test('@claim:demo-exit discards demo data before starting for real', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.locator('.active-clock').click();
  await page.getByRole('button', { name: /start for real/i }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => readStoredPlayerName(page, 'tableclock-demo')).toBeNull();
});

test('@claim:offline-reload reloads the running demo and ends a turn without a network', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.demo-banner')).toContainText('nothing is saved');
  await expect(page.locator('.active-clock')).toContainText('Priya');
  await page.locator('.active-clock').click();
  await expect(page.locator('.active-clock')).toContainText('Sora');
});

test('@claim:player-range accepts two through eight players and blocks fewer or more', async ({ page }) => {
  await openDemoSetup(page);
  await page.getByRole('button', { name: 'Remove Sora' }).click();
  await page.getByRole('button', { name: 'Remove Priya' }).click();
  await expect(page.getByText('2 / 8')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove Maya' })).toBeDisabled();
  await page.getByRole('button', { name: /start the clock/i }).click();
  await expect(page.locator('.player-strip .mini-player')).toHaveCount(2);
  await page.getByRole('button', { name: /options/i }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /end game and return to setup/i }).click();
  const add = page.getByRole('button', { name: /add player/i });
  for (let count = 2; count < 8; count += 1) await add.click();
  await expect(page.getByText('8 / 8')).toBeVisible();
  await expect(add).toBeDisabled();
  await page.getByRole('button', { name: /start the clock/i }).click();
  await expect(page.locator('.player-strip .mini-player')).toHaveCount(8);
});

test('@claim:free-use completes a demo turn with no account or payment gate', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('.active-clock').click();
  await expect(page.locator('.active-clock')).toContainText('Sora');
  await expect(page.getByRole('link', { name: /buy|subscribe|sign in|create account/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /buy|subscribe|sign in|create account/i })).toHaveCount(0);
});

test('@claim:local-storage restores player names, settings, and the running clock from IndexedDB', async ({ page, context }) => {
  await page.goto('/?new=1');
  await page.locator('[data-player-name]').first().fill('Ada');
  await page.getByRole('radio', { name: /time bank/i }).check();
  await page.getByLabel('Starting bank').fill('30');
  await page.getByRole('button', { name: /start the clock/i }).click();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.close();
  const restored = await context.newPage();
  await restored.goto('/');
  await expect(restored.locator('.active-clock')).toContainText('Ada');
  await expect(restored.locator('.turn-meta')).toContainText('Time bank');
  const stored = await readStoredState(restored, 'tableclock-local');
  expect(stored.setup?.players?.[0]?.name).toBe('Ada');
  expect(stored.setup?.settings).toMatchObject({ mode: 'bank', durationSec: 30 });
  expect(stored.game).toMatchObject({ running: true, activeIndex: 0, started: true });
  await restored.close();
});

test('@claim:same-origin sends no demo data or activity to another origin', async ({ page }) => {
  const requests: { url: string; method: string; type: string }[] = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method(), type: request.resourceType() }));
  await page.goto('/demo');
  const expectedOrigin = new URL(page.url()).origin;
  await page.locator('.active-clock').click();
  await page.getByRole('button', { name: /tableclock menu/i }).click();
  await page.getByRole('button', { name: /close/i }).click();
  await page.getByRole('button', { name: /start for real/i }).click();
  await page.locator('[data-player-name]').first().fill('Real Ada');
  await page.getByRole('button', { name: /start the clock/i }).click();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.locator('.active-clock').click();
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((request) => new URL(request.url).origin === expectedOrigin)).toBe(true);
  expect(requests.every((request) => request.method === 'GET')).toBe(true);
  expect(requests.filter((request) => ['fetch', 'xhr'].includes(request.type))).toEqual([]);
});

test('@claim:no-account uses no account gate or controls', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('.active-clock').click();
  await page.goto('/privacy');
  await expect(page.getByText('Tableclock does not use accounts. It does not use analytics.')).toBeVisible();
  await expect(page.getByRole('link', { name: /sign in|create account/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /sign in|create account/i })).toHaveCount(0);
});

test('@claim:no-analytics makes no analytics data request', async ({ page }) => {
  const dataRequests: string[] = [];
  page.on('request', (request) => {
    if (['fetch', 'xhr'].includes(request.resourceType())) dataRequests.push(request.url());
  });
  await page.goto('/demo');
  await page.locator('.active-clock').click();
  await page.goto('/privacy');
  expect(dataRequests).toEqual([]);
});

test('@claim:setup-link-roundtrip restores every player name and clock rule', async ({ page, context }) => {
  await openDemoSetup(page);
  await page.getByRole('button', { name: /create a setup link/i }).click();
  const shareUrl = await page.locator('#share-url').inputValue();
  expect(shareUrl).toContain('/demo#preset=');
  const second = await context.newPage();
  await second.goto(shareUrl);
  await expect(second).toHaveURL(/\/demo$/);
  await expect.poll(() => second.locator('[data-player-name]').evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value))).toEqual(['Maya', 'Lionel', 'Priya', 'Sora']);
  await expect(second.getByRole('radio', { name: /bank with increment/i })).toBeChecked();
  await expect(second.getByLabel('Starting bank')).toHaveValue('900');
  await expect(second.getByRole('spinbutton', { name: /increment/i })).toHaveValue('30');
  await expect(second.getByRole('spinbutton', { name: /gentle nudge/i })).toHaveValue('75');
  await second.close();
});

test('@claim:setup-link-local creates and opens a setup link without sending its payload', async ({ page }) => {
  const requests: { url: string; method: string; body: string | null }[] = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
  await openDemoSetup(page);
  const expectedOrigin = new URL(page.url()).origin;
  await page.getByRole('button', { name: /create a setup link/i }).click();
  const shareUrl = await page.locator('#share-url').inputValue();
  const setupUrl = new URL(shareUrl);
  expect(setupUrl.search).toBe('');
  expect(new URLSearchParams(setupUrl.hash.slice(1)).get('preset')).toBeTruthy();
  await page.goto(shareUrl);
  await expect(page.locator('[data-player-name]').first()).toHaveValue('Maya');
  expect(requests.every((request) => new URL(request.url).origin === expectedOrigin)).toBe(true);
  expect(requests.every((request) => request.body === null)).toBe(true);
  expect(requests.every((request) => !request.url.includes('Maya') && !request.url.includes('preset='))).toBe(true);
});

test('@claim:mode-count-up increases elapsed time', async ({ page }) => {
  await startMode(page, 'Count up');
  await expect.poll(async () => page.locator('[data-clock]').textContent()).not.toBe('0:00.0');
});

test('@claim:mode-time-bank decreases the player bank', async ({ page }) => {
  await startMode(page, 'Time bank');
  await expect.poll(async () => page.locator('[data-clock]').textContent()).toMatch(/^0:0[34]\./);
});

test('@claim:mode-increment returns three seconds after a completed turn', async ({ page }) => {
  await startMode(page, 'Bank with increment');
  await page.waitForTimeout(250);
  await page.locator('.active-clock').click();
  await expect(page.locator('[data-mini="0"]')).toHaveText(/^0:07$/);
  await expect(page.locator('.active-clock')).toContainText('Lionel');
});

test('@claim:mode-per-turn gives the next player a fresh limit', async ({ page }) => {
  await startMode(page, 'Per-turn limit');
  await page.waitForTimeout(250);
  await page.locator('.active-clock').click();
  await expect(page.locator('.active-clock')).toContainText('Lionel');
  await expect.poll(async () => {
    const text = await page.locator('[data-clock]').textContent() ?? '0:00.0';
    return Number(text.split(':')[1]);
  }).toBeGreaterThan(4.5);
});

test('@claim:keyboard-reorder moves a player, retains focus, and matches the move button', async ({ page }) => {
  await openDemoSetup(page);
  const lionel = page.locator('[data-player-name]').nth(1);
  await lionel.focus();
  await lionel.press('ArrowUp');
  await expect(page.locator('[data-player-name]').first()).toHaveValue('Lionel');
  await expect(page.locator('[data-player-name]').first()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.player-row').first().locator('[data-move="down"]')).toBeFocused();
  await page.locator('.player-row').first().locator('[data-move="down"]').click();
  await expect(page.locator('[data-player-name]').nth(1)).toHaveValue('Lionel');
});

test('@claim:setup-export downloads the current names and clock rules', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /options/i }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /export setup/i }).click(),
  ]);
  const path = await download.path();
  expect(path).not.toBeNull();
  const exported = JSON.parse(await readFile(path!, 'utf8'));
  expect(exported.setup.players.map((player: { name: string }) => player.name)).toEqual(['Maya', 'Lionel', 'Priya', 'Sora']);
  expect(exported.setup.settings).toMatchObject({ mode: 'fischer', durationSec: 900, incrementSec: 30 });
});

test('@claim:setup-import restores a valid exported setup', async ({ page }) => {
  await openDemoSetup(page);
  const imported = {
    product: 'tableclock',
    setup: { version: 1, players: [{ name: 'Nia' }, { name: 'Omar' }], settings: { mode: 'fixed', durationSec: 45, incrementSec: 0, nudgeSec: 10 } },
  };
  await page.locator('[data-import-file]').setInputFiles({ name: 'tableclock-setup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported)) });
  await expect(page.getByText('Setup imported. Review it, then start when everyone is ready.')).toBeVisible();
  await expect.poll(() => page.locator('[data-player-name]').evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value))).toEqual(['Nia', 'Omar']);
  await expect(page.getByRole('radio', { name: /per-turn limit/i })).toBeChecked();
  await expect(page.getByLabel('Per turn')).toHaveValue('45');
});

test('@claim:one-shared-device states one-device use and presents no sync action', async ({ page }) => {
  await openDemoSetup(page);
  await expect(page.getByText('Runs on one shared phone. Cross-phone sync is not included.')).toBeVisible();
  await expect(page.getByRole('button', { name: /sync|join room|create room/i })).toHaveCount(0);
});

test('@claim:no-scorekeeping keeps score controls out of the timer', async ({ page }) => {
  await openDemoSetup(page);
  await expect(page.getByRole('heading', { name: 'What this timer does not do' })).toBeVisible();
  await expect(page.getByText('It does not track scores. It does not connect phones. Everyone uses the same device at the table.')).toBeVisible();
  await expect(page.getByRole('button', { name: /score/i })).toHaveCount(0);
});

test('@claim:no-cross-phone keeps room and sync controls out of the timer', async ({ page }) => {
  await openDemoSetup(page);
  await expect(page.getByText('Runs on one shared phone. Cross-phone sync is not included.')).toBeVisible();
  await expect(page.getByText('It does not track scores. It does not connect phones. Everyone uses the same device at the table.')).toBeVisible();
  await expect(page.getByRole('button', { name: /sync|room/i })).toHaveCount(0);
});

test('@claim:turn-flow ends a turn with the active field', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('.active-clock').click();
  await expect(page.locator('.active-clock')).toContainText('Sora');
  await expect(page.locator('.turn-meta')).toContainText('Turn 4');
});

test('@claim:pause-resume stops and restarts the active clock', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const paused = await page.locator('[data-clock]').textContent();
  await page.waitForTimeout(350);
  await expect(page.locator('[data-clock]')).toHaveText(paused ?? '');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect.poll(() => page.locator('[data-clock]').textContent()).not.toBe(paused);
});

test('@claim:reverse-order changes who plays next', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /reverse/i }).click();
  await expect(page.locator('[data-toast]')).toContainText('Turn order is now reversed.');
  await page.locator('.active-clock').click();
  await expect(page.locator('.active-clock')).toContainText('Lionel');
});

test('@claim:player-status skips an out player and restores them', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /options/i }).click();
  await page.getByRole('button', { name: 'Sora · Mark out' }).click();
  await expect(page.locator('.mini-player').nth(3)).toHaveClass(/is-out/);
  await page.locator('.active-clock').click();
  await expect(page.locator('.active-clock')).toContainText('Maya');
  await page.getByRole('button', { name: /options/i }).click();
  await page.getByRole('button', { name: 'Sora · Bring back' }).click();
  await expect(page.locator('.mini-player').nth(3)).not.toHaveClass(/is-out/);
});

test('@claim:local-sound makes a local tone without a data request', async ({ page }) => {
  await page.addInitScript(() => {
    const record = { starts: 0 };
    Object.defineProperty(window, '__tableclockAudio', { value: record });
    class TestAudioContext {
      currentTime = 0;
      destination = {};
      createOscillator() {
        return { type: 'square', frequency: { value: 0 }, connect: (node: unknown) => node, start: () => { record.starts += 1; }, stop: () => undefined };
      }
      createGain() {
        return { gain: { setValueAtTime: () => undefined, exponentialRampToValueAtTime: () => undefined }, connect: (node: unknown) => node };
      }
    }
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: TestAudioContext });
  });
  const dataRequests: string[] = [];
  page.on('request', (request) => { if (['xhr', 'fetch'].includes(request.resourceType())) dataRequests.push(request.url()); });
  await page.goto('/demo');
  await page.locator('.active-clock').click();
  await expect.poll(() => page.evaluate(() => (window as Window & { __tableclockAudio: { starts: number } }).__tableclockAudio.starts)).toBe(1);
  expect(dataRequests).toEqual([]);
});

test('@claim:turn-vibration uses the turn pattern after a pointer tap', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, '__tableclockVibration', { configurable: true, writable: true, value: null });
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: (pattern: VibratePattern) => { (window as Window & { __tableclockVibration: VibratePattern | null }).__tableclockVibration = pattern; return true; } });
  });
  await page.goto('/demo');
  await page.locator('.active-clock').click();
  expect(await page.evaluate(() => (window as Window & { __tableclockVibration: VibratePattern | null }).__tableclockVibration)).toBe(35);
});

test('@claim:pwa-install exposes an installable manifest and controlling service worker', async ({ page }) => {
  await page.goto('/demo');
  const manifest = await page.evaluate(async () => fetch('/manifest.webmanifest').then((response) => response.json()));
  expect(manifest).toMatchObject({ display: 'standalone', start_url: '/?v=2' });
  expect(manifest.icons.some((icon: { sizes: string; purpose?: string }) => icon.sizes === '512x512' && icon.purpose === 'maskable')).toBe(true);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
});

test('route titles, metadata, focus, scroll restoration, legal links, and the styled 404 work', async ({ page }) => {
  await page.goto('/?new=1');
  await expect(page).toHaveTitle('Tableclock — turn timer for board-game groups');
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  const previousScroll = await page.evaluate(() => window.scrollY);
  await page.locator('.site-footer').getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page).toHaveTitle('Privacy — Tableclock');
  await expect(page.locator('main h1')).toBeFocused();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/privacy$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /tableclock-social\.png$/);
  await page.goBack();
  await expect(page.locator('main h1')).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(previousScroll - 5);
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Tableclock');
  const demoCanonical = `${new URL(page.url()).origin}/demo`;
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', demoCanonical);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', demoCanonical);
  await page.goto('/terms');
  await expect(page).toHaveTitle('Terms — Tableclock');
  await expect(page.getByRole('link', { name: /back to the clock/i })).toHaveAttribute('href', '/');
  await page.goto('/not-a-real-route');
  await expect(page).toHaveTitle('Page not found — Tableclock');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This table has no page');
  await expect(page.getByRole('link', { name: /return to tableclock/i })).toHaveAttribute('href', '/');
});

test('390px first screen and running state fit, expose touch targets, and pass Axe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?new=1');
  const actionBox = await page.getByRole('button', { name: /try it with sample data/i }).boundingBox();
  expect(actionBox).not.toBeNull();
  expect(actionBox!.y + actionBox!.height).toBeLessThan(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  for (const target of await page.locator('.site-header a, .site-footer a, button:not([disabled])').all()) {
    if (!(await target.isVisible())) continue;
    const box = await target.boundingBox();
    expect(Math.min(box?.width ?? 0, box?.height ?? 0)).toBeGreaterThanOrEqual(44);
  }
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  await page.goto('/demo');
  for (const control of [page.getByRole('button', { name: 'Pause', exact: true }), page.getByRole('button', { name: /options/i })]) {
    const box = await control.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  }
  await page.getByRole('button', { name: /options/i }).click();
  await page.getByRole('button', { name: /mark out/i }).last().click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('keyboard controls, dialog focus, reduced motion, and console stay clean', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/demo');
  const options = page.getByRole('button', { name: /options/i });
  await options.focus();
  await options.press('Enter');
  await page.getByRole('button', { name: /close/i }).click();
  await expect(options).toBeFocused();
  await page.locator('.active-clock').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.active-clock')).toContainText('Sora');
  await page.keyboard.press('p');
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeVisible();
  const duration = await page.locator('.active-clock').evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(['0.00001s', '1e-05s']).toContain(duration);
  expect(errors).toEqual([]);
});

test('setup errors explain what happened and preserve a recoverable form', async ({ page }) => {
  await page.goto('/?new=1');
  await page.locator('[data-player-name]').first().fill('');
  await page.getByRole('button', { name: /start the clock/i }).click();
  await expect(page.locator('.form-message')).toContainText('Use two to eight player names, each up to 24 characters.');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Time every player’s turn');
  await page.locator('[data-import-file]').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{"broken":true}') });
  await expect(page.locator('.form-message')).toContainText('That file is not a valid Tableclock setup. Choose a JSON file exported by Tableclock.');
  await expect(page.locator('[data-player-name]')).toHaveCount(3);
});
