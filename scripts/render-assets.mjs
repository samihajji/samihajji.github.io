// Renders public/og.png, public/favicon-32.png and public/apple-touch-icon.png
// from their sources with Playwright. Run: npm run assets
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(path.join(root, 'scripts/og-card.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, 'public/og.png') });

for (const [size, name] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png']]) {
  await page.setViewportSize({ width: size, height: size });
  await page.goto(pathToFileURL(path.join(root, 'public/favicon.svg')).href);
  await page.screenshot({ path: path.join(root, 'public', name), omitBackground: true });
}
await browser.close();
console.log('Rendered og.png, favicon-32.png, apple-touch-icon.png');
