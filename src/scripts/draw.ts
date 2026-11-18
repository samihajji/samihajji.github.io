/**
 * Draw-on-view. Elements marked [data-draw] start with their .draw strokes
 * undrawn (CSS, only under html.motion) and get .is-drawn the first time they
 * scroll into view. Without JS, or with reduced motion, everything is drawn.
 */
export function initDraw(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-draw]');
  if (!document.documentElement.classList.contains('motion') || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-drawn'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-drawn');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.18 },
  );
  els.forEach((el) => io.observe(el));
}
