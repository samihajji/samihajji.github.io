import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { profile } from '../data/profile';

/** Prefix a site-relative path with the configured base (GitHub Pages project sites). */
export function withBase(p: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return `${base}/${p.replace(/^\/+/, '')}`;
}

let warned = false;

/**
 * Whether the public CV exists in public/cv/, and its link. The link carries a
 * short hash of the file's contents (?v=...), so uploading a new PDF produces
 * a new URL and nobody gets a stale cached copy.
 */
export function cvInfo(): { exists: boolean; href: string } {
  const file = path.join(process.cwd(), 'public', profile.cv.file);
  const exists = fs.existsSync(file);
  if (exists) {
    const v = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 10);
    return { exists, href: `${withBase(profile.cv.file)}?v=${v}` };
  }
  if (!exists && !warned) {
    warned = true;
    console.warn(
      `\n[portfolio] public/${profile.cv.file} not found. The "Download CV" buttons will say the CV hasn't been added yet.\n` +
        '            Place the approved public CV there (never the private source CV in reference/).\n',
    );
  }
  return { exists, href: withBase(profile.cv.file) };
}
