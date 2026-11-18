/**
 * Theme switch. Dark is the default; the choice is remembered per browser.
 * The initial theme is applied by an inline script in <head> before paint,
 * so this only wires up the button, the hop hint and the cross-fade.
 */
type Theme = 'dark' | 'light';
const KEY = 'theme';
const colors: Record<Theme, string> = { dark: '#0e1830', light: '#e8ede0' };

function current(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function apply(theme: Theme, btn: HTMLButtonElement): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* storage unavailable: the choice lasts for this page view */
  }
  btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors[theme]);
}

export function initTheme(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!btn) return;
  btn.hidden = false;
  apply(current(), btn);

  const motion = document.documentElement.classList.contains('motion');
  if (motion) {
    // A small hop once the page has settled: "there's another theme".
    window.setTimeout(() => btn.classList.add('is-hopping'), 1300);
    btn.addEventListener('animationend', () => btn.classList.remove('is-hopping'));
  }

  btn.addEventListener('click', () => {
    btn.classList.remove('is-hopping');
    const next: Theme = current() === 'dark' ? 'light' : 'dark';
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (motion && doc.startViewTransition) doc.startViewTransition(() => apply(next, btn));
    else apply(next, btn);
  });
}
