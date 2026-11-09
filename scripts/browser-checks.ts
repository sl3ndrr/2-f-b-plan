import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import type { Browser, Page } from 'playwright';

type RGB = [number, number, number];

function luminance(color: RGB) {
  const weights = [0.2126, 0.7152, 0.0722];
  return color.reduce((sum, channel, index) => {
    const unit = channel / 255;
    const linear = unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
    return sum + linear * weights[index];
  }, 0);
}

export async function checkContrast(page: Page, theme: string) {
  const pairs = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d')!;
    const color = (token: string) => styles.getPropertyValue(`--${token}`).trim();
    function sample(foreground: string, background?: string): [number, number, number] {
      context.clearRect(0, 0, 1, 1);
      if (background) {
        context.fillStyle = background;
        context.fillRect(0, 0, 1, 1);
      }
      context.fillStyle = foreground;
      context.fillRect(0, 0, 1, 1);
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      return [red, green, blue];
    }

    const categories = ['phy', 'inf', 'did', 'bw', 'opt', 'th'];
    const checks = ['tx', 'mut', 'ac', ...categories].flatMap((text) =>
      ['bg', 'card', 'grid'].map((surface) => ({
        label: `${text} auf ${surface}`,
        foreground: sample(color(text)),
        background: sample(color(surface)),
      })),
    );
    for (const category of categories) {
      const badge = sample(
        `color-mix(in srgb, ${color(category)} 13%, transparent)`,
        color('card'),
      );
      checks.push(
        {
          label: `${category} auf Credit-Badge`,
          foreground: sample(color(category)),
          background: badge,
        },
        {
          label: `Teilcredits auf ${category}-Badge`,
          foreground: sample(color('mut')),
          background: badge,
        },
      );
    }
    return checks;
  });

  for (const { label, foreground, background } of pairs) {
    const first = luminance(foreground);
    const second = luminance(background);
    const ratio = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    assert.ok(ratio >= 4.5, `Kontrast ${theme}: ${label}, ${ratio.toFixed(2)}:1`);
  }
}

export async function checkInteractions(browser: Browser, url: string) {
  const context = await browser.newContext({
    colorScheme: 'light',
    viewport: { width: 1280, height: 800 },
  });
  try {
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url);
    const stored = (key: string) => page.evaluate((key) => localStorage.getItem(key), key);
    const row = (id: string) => page.locator(`[data-id="${id}"] input`);
    await page.evaluate(() => localStorage.setItem('zfb2_done_v2', '["p1301","i1605","xyz"]'));
    await page.reload();
    await page.locator('#toast').filter({ hasText: '1 unbekannte ID verworfen' }).waitFor();
    assert.deepEqual(JSON.parse((await stored('zfb2_done_v2'))!), ['p1301', 'i1605']);

    assert.equal(await row('p1301').getAttribute('type'), 'checkbox');
    await row('p1301').press('Space');
    assert.equal(await row('p1301').isChecked(), false);
    await page.getByRole('button', { name: 'Alle Optionen' }).click();
    assert.equal(await row('i1605').getAttribute('type'), 'radio');
    assert.equal(await row('i1605').isChecked(), true);
    await row('i1605').press('ArrowDown');
    assert.equal(await row('i1206').isChecked(), true);
    assert.deepEqual(JSON.parse((await stored('zfb2_done_v2'))!), ['i1206']);
    await page
      .locator('[data-category="inf"] .group-count')
      .filter({ hasText: /0 \/ 14 C/ })
      .waitFor();
    await page.getByRole('button', { name: /Auswahl aufheben: Datenbanken/ }).click();
    assert.equal(await row('i1206').isChecked(), false);

    await page.locator('#bTheme').click();
    await page.locator('#motion').selectOption('normal');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await page.locator('html').getAttribute('data-motion'), 'normal');
    await page.locator('#bDemo').click();
    await page.locator('.hero.complete').waitFor();
    assert.equal(
      await page
        .locator('.stack')
        .evaluate((stack) => getComputedStyle(stack, '::after').animationName),
      'none',
    );

    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Sichern' }).click();
    const backup = JSON.parse(await readFile(await (await downloaded).path(), 'utf8'));
    assert.equal(backup.version, 1);
    assert.equal(backup.done.length, 30);

    await page.locator('#bReset').click();
    await page.locator('#bReset').click();
    assert.equal(await stored('zfb2_done_v2'), '[]');
    assert.equal(await stored('zfb2_mode'), 'all');
    assert.equal(await stored('zfb2_theme'), 'dark');
    assert.equal(await stored('zfb2_motion'), 'normal');

    await page.locator('#backupFile').setInputFiles({
      name: 'fortschritt.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{"version":1,"done":["p1301","xyz"]}'),
    });
    await page
      .locator('#toast')
      .filter({ hasText: /Fortschritt geladen/ })
      .waitFor();
    assert.equal(await row('p1301').isChecked(), true);
    assert.equal(await stored('zfb2_done_v2'), '["p1301"]');

    await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
    await page
      .locator('#printReport')
      .filter({ hasText: /Offene Pflichtmodule des Plans/ })
      .waitFor();
    await page.locator('html[data-motion="off"]').waitFor();
    assert.equal(await stored('zfb2_motion'), 'normal');
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}
