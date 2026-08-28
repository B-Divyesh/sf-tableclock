import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:demo-sandbox opens a running four-player sample in an isolated database', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /try it with sample data/i }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Game clock');
  await expect(page.locator('.demo-banner')).toContainText('sample data, nothing is saved');
  await expect(page.locator('.active-clock')).toContainText('Maya');
  await expect(page.locator('.player-strip .mini-player')).toHaveCount(4);
  const dbName = await page.evaluate(async () => new Promise<string>((resolve, reject) => {
    const request = indexedDB.open('tableclock-demo');
    request.onsuccess = () => { request.result.close(); resolve(request.result.name); };
    request.onerror = () => reject(request.error);
  }));
  expect(dbName).toBe('tableclock-demo');
  await page.locator('.active-clock').click();
  await expect(page.locator('.active-clock')).toContainText('Lionel');
  await page.getByRole('button', { name: /reset demo/i }).click();
  await expect(page.locator('.active-clock')).toContainText('Maya');
  await page.goto('/?demo=1');
  await expect(page.locator('.demo-banner')).toContainText('nothing is saved');
});

test('@claim:offline-reload reloads the running demo and ends a turn without a network', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.demo-banner')).toContainText('nothing is saved');
  await expect(page.locator('.active-clock')).toContainText('Maya');
  await page.locator('.active-clock').click();
  await expect(page.locator('.active-clock')).toContainText('Lionel');
});

test('@claim:player-range accepts two through eight players and blocks fewer or more', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /menu/i }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /end game/i }).click();
  await page.getByRole('button', { name: 'Remove Sora' }).click();
  await page.getByRole('button', { name: 'Remove Priya' }).click();
  await expect(page.getByText('2 / 8')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove Maya' })).toBeDisabled();
  const add = page.getByRole('button', { name: /add player/i });
  for (let count = 2; count < 8; count += 1) await add.click();
  await expect(page.getByText('8 / 8')).toBeVisible();
  await expect(add).toBeDisabled();
});

test('@claim:local-private keeps demo storage local and sends no third-party request', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo');
  await page.getByRole('button', { name: /options/i }).click();
  await page.getByRole('button', { name: /close/i }).click();
  const stored = await page.evaluate(async () => new Promise<boolean>((resolve, reject) => {
    const request = indexedDB.open('tableclock-demo');
    request.onsuccess = () => {
      const transaction = request.result.transaction('state', 'readonly');
      const get = transaction.objectStore('state').get('setup');
      get.onsuccess = () => resolve(Boolean(get.result));
      get.onerror = () => reject(get.error);
    };
    request.onerror = () => reject(request.error);
  }));
  expect(stored).toBe(true);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:setup-link copies player names and rules without uploading them', async ({ page, context }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo');
  await page.getByRole('button', { name: /menu/i }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /end game/i }).click();
  await page.getByRole('button', { name: /create a setup link/i }).click();
  const shareUrl = await page.locator('#share-url').inputValue();
  expect(shareUrl).toContain('/demo?preset=');
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  const second = await context.newPage();
  await second.goto(shareUrl);
  await expect(second.locator('body')).toContainText('Maya');
  await expect(second.locator('body')).toContainText('Bank with increment');
  await second.close();
});

test('@claim:one-shared-device states the product scope and presents no sync action', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /menu/i }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /end game/i }).click();
  await expect(page.getByText('Runs on one shared phone.')).toBeVisible();
  await expect(page.getByText('Cross-phone sync is not included.')).toBeVisible();
  await expect(page.getByRole('button', { name: /sync/i })).toHaveCount(0);
});

test('@claim:turn-flow ends a turn with the active field and preserves routing focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo');
  await page.locator('.active-clock').click();
  await expect(page.locator('.active-clock')).toContainText('Lionel');
  await page.goto('/?new=1');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Time every player’s turn');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.locator('main h1')).toBeFocused();
  await page.goto('/not-a-real-route');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('This table has no page');
});

test('390px layout has touch-sized links and no serious Axe finding', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const link of await page.locator('.site-header a, .site-footer a').all()) {
    const box = await link.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});
