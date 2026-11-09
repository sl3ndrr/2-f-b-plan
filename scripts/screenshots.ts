import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Page } from 'playwright';
import { preview } from 'vite';

const viewports = [
  [390, 844],
  [1280, 800],
  [1920, 1080],
  [2560, 1440],
  [3440, 1440],
  [3840, 2160],
] as const;
const sample = [
  'p1301',
  'p2610',
  'p2101',
  'p2102',
  'p2571',
  'p2701',
  'i1101',
  'i1102',
  'i1601a',
  'i1605',
  'B.Inf.1131',
  'b1',
  'b20',
  'o713',
];

async function checkLayout(page: Page, width: number) {
  const dimensions = await page.evaluate(() => {
    const bounds = (selector: string) => {
      const rect = document.querySelector(selector)!.getBoundingClientRect();
      return { left: rect.left, top: rect.top, width: rect.width };
    };
    return {
      body: document.documentElement.scrollWidth,
      page: bounds('.w'),
      summary: bounds('.dashboard-summary'),
      physics: bounds('[data-category="phy"]'),
      computing: bounds('[data-category="inf"]'),
      didactics: bounds('[data-category="did"]'),
    };
  });
  assert.ok(dimensions.body <= width, `Horizontaler Überlauf bei ${width}px: ${dimensions.body}px`);
  if (width < 1440) {
    assert.ok(dimensions.physics.top > dimensions.summary.top);
  } else {
    assert.ok(dimensions.physics.left > dimensions.summary.left + dimensions.summary.width - 4);
    assert.equal(dimensions.physics.top, dimensions.computing.top);
  }
  if (width >= 2560) {
    assert.equal(dimensions.physics.top, dimensions.didactics.top);
    assert.ok(dimensions.didactics.left > dimensions.computing.left);
    assert.ok(dimensions.page.width <= 2401);
  }
}

const server = await preview({ preview: { host: '127.0.0.1', port: 4173, strictPort: true } });
const url = server.resolvedUrls?.local[0];
assert.ok(url);
const output = 'docs/screenshots';
await mkdir(output, { recursive: true });
try {
  const browser = await chromium.launch();
  try {
    for (const [width, height] of viewports) {
      for (const colorScheme of ['light', 'dark'] as const) {
        const context = await browser.newContext({ viewport: { width, height }, colorScheme });
        await context.addInitScript((done) => {
          localStorage.setItem('zfb2_done_v2', JSON.stringify(done));
          localStorage.setItem('zfb2_mode', 'plan');
        }, sample);
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(url);
        await page.locator('[data-category="phy"]').waitFor();
        await page.evaluate(() => document.fonts.ready);
        await checkLayout(page, width);
        await page.screenshot({
          path: `${output}/${width}x${height}-${colorScheme}.png`,
          animations: 'disabled',
        });
        assert.deepEqual(errors, []);
        await context.close();
      }
    }

    const offline = await browser.newContext({ offline: true, reducedMotion: 'reduce' });
    const page = await offline.newPage();
    await page.goto(pathToFileURL(resolve('dist-single/index.html')).href);
    await page.getByRole('button', { name: 'Plan abhaken' }).click();
    await page.locator('.big').getByText('180', { exact: true }).waitFor();
    await offline.close();
  } finally {
    await browser.close();
  }
} finally {
  await new Promise<void>((done) => server.httpServer.close(() => done()));
}
