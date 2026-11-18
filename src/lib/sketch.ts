/**
 * Deterministic "hand-drawn" SVG geometry.
 *
 * Every stroke on the site is generated at build time from a seed, so the
 * drawings look sketched but are identical on every build (no layout shift,
 * no runtime cost). Lines bow slightly and overshoot their corners the way a
 * pencil does when you draw a box quickly.
 */

export type Pt = readonly [number, number];

/** mulberry32: tiny seeded PRNG returning floats in [0, 1). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const fmt = (p: Pt) => `${r1(p[0])} ${r1(p[1])}`;

export interface LineOpts {
  /** Maximum sideways bow, in user units. */
  bow?: number;
  /** How far the stroke may run past its end points. */
  overshoot?: number;
}

/** A single slightly bowed stroke from a to b, as a path `d` fragment. */
export function line(a: Pt, b: Pt, seed = 1, opts: LineOpts = {}): string {
  const { bow = 1.4, overshoot = 0 } = opts;
  const r = rng(seed);
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const scale = Math.min(1, len / 90);
  const s0 = overshoot * (0.3 + r() * 0.7);
  const s1 = overshoot * (0.3 + r() * 0.7);
  const start: Pt = [a[0] - ux * s0, a[1] - uy * s0];
  const end: Pt = [b[0] + ux * s1, b[1] + uy * s1];
  const b1 = (r() - 0.5) * 2 * bow * scale;
  const b2 = (r() - 0.5) * 2 * bow * scale;
  const c1: Pt = [a[0] + dx / 3 + nx * b1, a[1] + dy / 3 + ny * b1];
  const c2: Pt = [a[0] + (2 * dx) / 3 + nx * b2, a[1] + (2 * dy) / 3 + ny * b2];
  return `M${fmt(start)} C${fmt(c1)} ${fmt(c2)} ${fmt(end)}`;
}

/** A polyline drawn as connected bowed strokes. */
export function polyline(points: readonly Pt[], seed = 1, opts: LineOpts = {}): string {
  const o = { ...opts, overshoot: 0 };
  return points
    .slice(1)
    .map((p, i) => {
      const seg = line(points[i]!, p, seed + i * 7, o);
      return i === 0 ? seg : seg.replace(/^M[^C]+/, '');
    })
    .join(' ');
}

/** A box drawn as four separate strokes that overshoot at the corners. */
export function box(x: number, y: number, w: number, h: number, seed = 1, opts: LineOpts = {}): string {
  const o = { bow: 1.2, overshoot: 3, ...opts };
  return [
    line([x, y], [x + w, y], seed, o),
    line([x + w, y], [x + w, y + h], seed + 1, o),
    line([x + w, y + h], [x, y + h], seed + 2, o),
    line([x, y + h], [x, y], seed + 3, o),
  ].join(' ');
}

/** A smooth curve through points (Catmull-Rom converted to cubic Béziers). */
export function curve(points: readonly Pt[], tension = 0.5): string {
  if (points.length < 2) return '';
  const p = points;
  let d = `M${fmt(p[0]!)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i]!;
    const p1 = p[i]!;
    const p2 = p[i + 1]!;
    const p3 = p[i + 2] ?? p2;
    const t = tension / 3;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C${fmt(c1)} ${fmt(c2)} ${fmt(p2)}`;
  }
  return d;
}

/**
 * A hand-drawn loop: slightly irregular and overlapping where it started,
 * the way a quickly drawn circle never quite closes cleanly.
 */
export function loop(cx: number, cy: number, rx: number, ry = rx, seed = 1): string {
  const r = rng(seed);
  const start = r() * Math.PI * 2;
  const sweep = Math.PI * 2 + 0.35 + r() * 0.25;
  const steps = 14;
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = start + (sweep * i) / steps;
    const k = 1 + (r() - 0.5) * 0.07 + (i / steps) * 0.05;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return curve(pts, 0.9);
}

/** Two short strokes forming an open arrowhead at `tip`, pointing along `angle` (radians). */
export function arrowHead(tip: Pt, angle: number, size = 9, seed = 1): string {
  const r = rng(seed);
  const spread = 0.48 + r() * 0.08;
  const back = angle + Math.PI;
  const a: Pt = [tip[0] + Math.cos(back - spread) * size, tip[1] + Math.sin(back - spread) * size];
  const b: Pt = [tip[0] + Math.cos(back + spread) * size * 0.92, tip[1] + Math.sin(back + spread) * size * 0.92];
  return `${line(a, tip, seed, { bow: 0.4 })} ${line(tip, b, seed + 3, { bow: 0.4 })}`;
}

/** A gently bowed arrow from a to b with an open head at b. */
export function arrow(a: Pt, b: Pt, seed = 1, opts: LineOpts & { head?: number } = {}): string {
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return `${line(a, b, seed, { bow: 2.2, ...opts })} ${arrowHead(b, angle, opts.head ?? 9, seed + 11)}`;
}

/** A curved arrow from a to b that bends through `via`. */
export function curvedArrow(a: Pt, via: Pt, b: Pt, seed = 1, head = 9): string {
  const angle = Math.atan2(b[1] - via[1], b[0] - via[0]);
  return `M${fmt(a)} Q${fmt(via)} ${fmt(b)} ${arrowHead(b, angle, head, seed)}`;
}

/** Diagonal section hatching clipped to a rectangle (engineering-drawing convention for cut material). */
export function hatch(x: number, y: number, w: number, h: number, gap = 9, seed = 1): string {
  const out: string[] = [];
  let i = 0;
  for (let k = -h; k < w; k += gap) {
    const x0 = Math.max(x, x + k);
    const y0 = x + k < x ? y + (x - (x + k)) : y;
    const x1 = Math.min(x + w, x + k + h);
    const y1 = x + k + h > x + w ? y + h - (x + k + h - (x + w)) : y + h;
    if (x1 - x0 > 2) out.push(line([x0, y0], [x1, y1], seed + i++, { bow: 0.6 }));
  }
  return out.join(' ');
}

/** A wavy vertical rule, used for the margin line that links the chapters. */
export function wavyVertical(x: number, y0: number, y1: number, amp = 1.6, seed = 1): string {
  const r = rng(seed);
  const pts: Pt[] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    pts.push([x + (r() - 0.5) * 2 * amp, y0 + ((y1 - y0) * i) / steps]);
  }
  return curve(pts, 0.6);
}

/** A rough rectangle path for frames drawn behind HTML content (viewBox 0 0 100 100, non-uniformly scaled). */
export function frame(seed = 1, inset = 0.6): string {
  const o = { bow: 0.5, overshoot: 0.9 };
  const a = inset;
  const b = 100 - inset;
  return [
    line([a, a], [b, a], seed, o),
    line([b, a], [b, b], seed + 1, o),
    line([b, b], [a, b], seed + 2, o),
    line([a, b], [a, a], seed + 3, o),
  ].join(' ');
}
