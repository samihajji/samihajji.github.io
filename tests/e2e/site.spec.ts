import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const widths = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const sections = ['top', 'projects', 'skills', 'trajectory', 'log', 'contact'];
const cvFile = path.join(process.cwd(), 'public', 'cv', 'sami-hajji-cv.pdf');

async function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => {
    if (r.url().startsWith('http://127.0.0.1') && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}

for (const vp of widths) {
  test.describe(`${vp.name} ${vp.width}px`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('renders every sheet with no overflow, console errors or failed requests', async ({ page }) => {
      const errors = await collectErrors(page);
      await page.goto('/', { waitUntil: 'networkidle' });
      for (const id of sections) await expect(page.locator(`#${id}`)).toBeVisible();
      // walk the page so lazy behaviour runs
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += 700) await page.evaluate((y) => window.scrollTo(0, y), y);
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(sw, 'horizontal overflow').toBeLessThanOrEqual(cw);
      expect(errors).toEqual([]);
      fs.mkdirSync('tests/screenshots', { recursive: true });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `tests/screenshots/${vp.name}.png`, fullPage: true });
    });

    for (const theme of ['dark', 'light'] as const) {
      test(`has no detectable accessibility violations (${theme} theme)`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
        await page.goto('/', { waitUntil: 'networkidle' });
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`);
        expect(summary).toEqual([]);
      });
    }
  });
}

test('every in-page link points at an element that exists', async ({ page }) => {
  await page.goto('/');
  const missing = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
      .map((a) => a.getAttribute('href')!.slice(1))
      .filter((id) => id && !document.getElementById(id)),
  );
  expect(missing).toEqual([]);
});

test('header navigation scrolls to each sheet', async ({ page }) => {
  await page.goto('/');
  for (const label of ['Projects', 'Skills', 'Trajectory', 'Log', 'Contact']) {
    await page.getByRole('navigation', { name: 'Sheets' }).getByRole('link', { name: label }).click();
    const id = label === 'Projects' ? 'projects' : label.toLowerCase();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
});

test('external links are HTTPS and only go where expected', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]')).map((a) => a.href),
  );
  expect(hrefs.length).toBeGreaterThan(5);
  for (const h of hrefs) {
    const u = new URL(h);
    expect(u.protocol, h).toBe('https:');
    expect(['github.com', 'www.linkedin.com'], h).toContain(u.hostname);
  }
  console.log('External links to verify by hand:\n' + [...new Set(hrefs)].join('\n'));
});

test('CV download behaves correctly for the current state of public/cv/', async ({ page, request }) => {
  await page.goto('/');
  const heroCv = page.locator('#top .hero__actions .btn').first();
  if (fs.existsSync(cvFile)) {
    const href = await heroCv.getAttribute('href');
    expect(href).toMatch(/cv\/sami-hajji-cv\.pdf\?v=[0-9a-f]{10}$/);
    await expect(heroCv).toHaveAttribute('download', 'Sami-Hajji-CV.pdf');
    const res = await request.get(href!);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
  } else {
    await expect(heroCv).toHaveAttribute('aria-disabled', 'true');
    await expect(heroCv).not.toHaveAttribute('href', /.+/);
    await expect(page.locator('#contact [data-cv-missing]')).toBeVisible();
  }
});

test('keyboard: skip link first, visible focus, balloons operable', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);

  // focus style is a real outline, not removed
  await page.getByRole('link', { name: 'Contact me' }).focus();
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(outline).not.toBe('none');

  // callout balloons: focus highlights, click pins, Escape clears
  const balloon = page.locator('#project-cilium-aks button.balloon[data-callout="vxlan"]');
  await balloon.focus();
  await expect(page.locator('#project-cilium-aks li[data-callout="vxlan"]')).toHaveClass(/is-active/);
  await expect(page.locator('#project-cilium-aks [data-part="vxlan"]')).toHaveClass(/is-active/);
  await page.keyboard.press('Enter');
  await expect(balloon).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(balloon).toHaveAttribute('aria-pressed', 'false');

  // details disclosure works from the keyboard
  const summary = page.locator('#project-cilium-aks summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#project-cilium-aks details')).toHaveAttribute('open', '');
});

test('motion: strokes draw in, eyes open and follow the pointer inside the hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/motion/);
  await expect(page.locator('#top .hero__figure')).toHaveClass(/is-drawn/);
  await page.waitForTimeout(1800);
  const eye = page.locator('#top .eye').first();
  const scale = await eye.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform === 'none' ? undefined : getComputedStyle(el).transform).d);
  expect(scale).toBeGreaterThan(0.95);
  const box = (await page.locator('#top .hero__figure').boundingBox())!;
  await page.mouse.move(box.x + 5, box.y + 5);
  await page.mouse.move(box.x + 10, box.y + 10, { steps: 5 });
  await page.waitForTimeout(400);
  const t = await page.locator('#top .pupil').first().evaluate((el) => (el as SVGElement).style.transform);
  expect(t).toMatch(/translate\(-/);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('everything is drawn immediately and nothing tracks the pointer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/motion/);
    const undrawn = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.draw')).filter((el) => parseFloat(getComputedStyle(el).strokeDashoffset) > 0.001).length,
    );
    expect(undrawn).toBe(0);
    const hidden = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.appear')).filter((el) => getComputedStyle(el).opacity === '0').length,
    );
    expect(hidden).toBe(0);
    const box = (await page.locator('#top .hero__figure').boundingBox())!;
    await page.mouse.move(box.x + 10, box.y + 10, { steps: 5 });
    await page.waitForTimeout(300);
    const t = await page.locator('#top .pupil').first().evaluate((el) => (el as SVGElement).style.transform);
    expect(t).toBe('');
  });
});

test('metadata: title, description, canonical, Open Graph and structured data', async ({ page, request }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Sami Hajji, DevOps and Cloud Engineer');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Kubernetes/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\//);
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toMatch(/og\.png$/);
  expect((await request.get('/og.png')).status()).toBe(200);
  expect((await request.get('/favicon.svg')).status()).toBe(200);
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(ld['@type']).toBe('Person');
  expect(ld.sameAs).toContain('https://github.com/samihajji');
});

test('unknown paths get the 404 sheet', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This page doesn’t exist.' })).toBeVisible();
});

test('content guardrails: no claims the sources do not support', async ({ page }) => {
  await page.goto('/');
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/CKA[- ]certified|certified kubernetes administrator(?! \(CKA\) preparation)/i);
  expect(text).toMatch(/haven’t taken the CKA exam yet/);
  expect(text).not.toMatch(/\bCAPZ\b|Azure Service Operator|\bASO\b/);
  expect(text).not.toMatch(/live demo/i);
  expect(text).not.toMatch(/\d+\s?%\s*(proficien|skill)/i);
  // the source CV must never be published
  expect(fs.existsSync(path.join(process.cwd(), 'dist', 'reference'))).toBe(false);
  const res = await page.request.get('/reference/source-cv.pdf');
  expect(res.status()).toBe(404);
});

test('theme: dark by default, toggles to light, remembers the choice', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  const toggle = page.getByRole('button', { name: 'Switch to light theme' });
  await expect(toggle).toBeVisible();
  await expect(page.locator('.theme-toggle__sun')).toBeVisible();
  await expect(page.locator('.theme-toggle__moon')).toBeHidden();
  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  await expect(page.locator('.theme-toggle__moon')).toBeVisible();
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#e8ede0');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');
});

test('theme switch hops once after the page opens', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-theme-toggle]')).toHaveClass(/is-hopping/, { timeout: 4000 });
});

test('diagrams carry no hover tooltips', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('svg title').count()).toBe(0);
  expect(await page.locator('main [title]').count()).toBe(0);
});
