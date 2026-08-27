import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('desktop 1440px preserves the running timer keyboard flow and non-scrolling player grid', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: /start the clock/i }).click();
  await page.locator('[data-action="toggle-run"]').click();

  const activeClock = page.locator('.active-clock');
  await activeClock.focus();
  await page.keyboard.press('Space');
  await expect(activeClock).toContainText('Player 2');
  expect(await page.locator('.player-strip').evaluate((strip) => strip.scrollWidth <= strip.clientWidth)).toBe(true);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('390px running strip scrolls by keyboard and has no serious Axe finding', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /add player/i }).click();
  await page.getByRole('button', { name: /start the clock/i }).click();
  await page.locator('[data-action="toggle-run"]').click();

  const strip = page.locator('.player-strip');
  expect(await strip.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await strip.focus();
  await page.keyboard.press('ArrowRight');
  expect(await strip.evaluate((element) => element.scrollLeft > 0)).toBe(true);

  await page.locator('[data-action="game-menu"]').first().click();
  await page.getByRole('button', { name: /player 4.*mark out/i }).click();
  await expect(page.locator('.mini-player.is-out')).toContainText('Out');

  const activeClock = page.locator('.active-clock');
  await activeClock.focus();
  await page.keyboard.press('Space');
  await expect(activeClock).toContainText('Player 2');

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('the installed app shell reloads offline after service-worker control', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Take turns');
});
