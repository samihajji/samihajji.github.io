// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages: SITE_URL and BASE_PATH are injected by the deploy workflow
// (actions/configure-pages). Locally they default to a user site at the root.
const site = process.env.SITE_URL ?? 'https://samimassoud.github.io';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
