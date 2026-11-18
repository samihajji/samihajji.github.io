# Sami Hajji: engineering portfolio

A single-page portfolio designed as an engineer's **computation pad**: a 5 mm grid, a title block on every sheet, torn-off sheet edges between chapters, and a margin line that links them. It opens in a moonlit night-sky theme. The sun in the header switches to the pale green paper of a daytime pad, and the moon switches back. Static [Astro](https://astro.build) with TypeScript, hand-written CSS, hand-drawn SVG generated at build time, and about 4 KB of client JavaScript. No UI framework, no analytics, no third-party requests at runtime. Fonts are self-hosted.

**The drawing rule used everywhere:** ink means done, pencil means in progress, dotted pencil means planned. Red pencil is used once, for a real correction.

## Run it locally

Requires Node.js **22.12 or newer**.

```sh
npm install
npm run dev          # http://localhost:4321
```

Astro 7 runs the dev server in the background. Stop it with `npx astro dev stop`, and see its logs with `npx astro dev logs`.

```sh
npm run check        # TypeScript and Astro diagnostics
npm run build        # static output in dist/
npm test             # Playwright end-to-end suite (builds and serves dist/ itself)
npm run verify       # all three
npm run assets       # re-render public/og.png and the PNG favicons
```

First-time test setup: `npx playwright install chromium`. On WSL or a bare Linux machine, Chromium also needs system libraries: `sudo npx playwright install-deps chromium`.

## Update the CV

The site serves whatever PDF is at:

```
public/cv/sami-hajji-cv.pdf
```

Visitors download it as `Sami-Hajji-CV.pdf`. To replace it on GitHub: open `public/cv/`, choose **Add file → Upload files**, drop in the new PDF named `sami-hajji-cv.pdf`, and commit to `main`. The deploy workflow publishes it in about 2–3 minutes. The link carries a fingerprint of the file (`?v=…`), so nobody is served a cached old copy.

Until the file exists, the build prints a warning and both CV buttons say the CV hasn't been added yet. `reference/` holds the private source CV. It's git-ignored and never copied into the build, and a test checks that.

## Edit the content

Content is separate from presentation. Most edits never touch a component.

| What | Where |
|---|---|
| Name, links, email, availability, hero text | `src/data/profile.ts` |
| Projects (one YAML file each) | `src/content/projects/*.yaml` (schema in `src/content.config.ts`) |
| Skills (the bill of materials) | `src/data/skills.ts` |
| Trajectory milestones and chapters | `src/data/growth.ts` |
| Experience, education, courses | `src/data/experience.ts` |

A local, git-ignored `EDITING.md` maps every paragraph on the page to its file and field.

Project files set `status: complete | in-progress | planned`, which drives how the project is drawn. Diagram callouts in a YAML file must use ids that the matching diagram component defines, and the build fails with a clear error if one is missing.

## Structure

```
src/
  content.config.ts         project schema (Zod)
  content/projects/         one YAML file per project
  data/                     profile, capabilities, growth, experience
  lib/sketch.ts             seeded "hand-drawn" SVG geometry (lines, boxes, loops, hatching)
  lib/paths.ts              base-path helper and the CV check
  components/
    sheet/                  Sheet, TitleBlock, ChapterLine, SiteHeader, ThemeToggle, SheetBreak, DraftBreak
    sketch/                 Eyes, Correction (the red-pencil moment)
    diagrams/               DiagramFigure + one component per project diagram
    sections/               Hero, Projects, ProjectEntry, Skills, Growth, Experience, Contact
  scripts/                  theme, draw-on-view, eyes, callouts, copy-email (vanilla TS)
  styles/                   tokens, base (paper and type), layout, sketch
scripts/                    test server for dist/, OG card source and renderer
tests/e2e/                  Playwright and axe-core suite
.github/workflows/deploy.yml
```

## Themes, motion and accessibility

- **Two themes:** dark (default) and light. The choice is stored in `localStorage` and applied before first paint, so there's no flash of the wrong theme. Without JavaScript the page stays dark. Colour tokens for both are in `src/styles/tokens.css`, and the test suite runs axe, including colour contrast, against both themes at all three widths.
- **The theme switch** hops once shortly after the page opens, and again on hover.
- **Dividers:** a torn-off sheet edge (with scissors that snip once in view) between main sheets, and the draftsman's break-line symbol between projects.

- **One choreographed moment:** the hero sketch draws itself, then the eyes open. After that they blink at random intervals and follow the pointer only while it's inside the hero, within about 3 px.
- **The margin line** is revealed with CSS scroll-driven animation where supported. Elsewhere it's simply drawn in full.
- **Diagrams:** numbered balloons and the callout list cross-highlight on hover, focus or tap. The list is always visible, so nothing is hover-only. Escape clears a pinned callout.
- **The trajectory** draws once when it comes into view. The red-pencil strike-through draws once too.
- **Reduced motion:** every stroke is drawn complete, the eyes are open and still, and nothing tracks the pointer. Without JavaScript, the page is complete and static.
- **Keyboard:** a skip link, visible focus, native buttons and `<details>`, and diagram frames that become focusable when they scroll sideways on narrow screens.

## Deploy to GitHub Pages

The repository is `samihajji/samihajji.github.io`, so the site is served at the root: https://samihajji.github.io/. Pages is set to deploy from **GitHub Actions**. Every push to `main` type-checks, runs the Playwright suite, builds with the Pages origin and base path, and deploys `dist/`. Pull requests run the checks without deploying.

Run `gitleaks git --pre-commit --staged` before each commit, and `gitleaks git` over the full history before pushing.

`SITE_URL` and `BASE_PATH` can also be set by hand for a custom domain, for example `SITE_URL=https://example.com BASE_PATH=/ npm run build`.
