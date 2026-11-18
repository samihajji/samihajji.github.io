/**
 * Diagram callouts. Hovering, focusing or tapping a balloon or a callout
 * list item highlights the matching part of the drawing, the balloon and the
 * list item. A tap or click pins the highlight; Escape clears it. The list is
 * always visible, so this only adds emphasis, never hides content.
 */
/** Make diagram frames focusable only when they actually scroll (narrow screens). */
function syncScrollFocus(): void {
  document.querySelectorAll<HTMLElement>('.diagram__scroll').forEach((el) => {
    if (el.scrollWidth > el.clientWidth + 1) el.tabIndex = 0;
    else el.removeAttribute('tabindex');
  });
}

export function initCallouts(): void {
  syncScrollFocus();
  window.addEventListener('resize', syncScrollFocus, { passive: true });

  document.querySelectorAll<HTMLElement>('[data-callouts]').forEach((fig) => {
    let pinned: string | null = null;
    const nodes = (id: string) => fig.querySelectorAll<Element>(`[data-callout="${id}"], [data-part="${id}"]`);
    const all = fig.querySelectorAll<Element>('[data-callout], [data-part]');

    const show = (id: string | null) => {
      all.forEach((n) => n.classList.remove('is-active'));
      if (id) nodes(id).forEach((n) => n.classList.add('is-active'));
      fig.querySelectorAll<HTMLButtonElement>('button.balloon').forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.callout === pinned));
      });
    };

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

    fig.querySelectorAll<HTMLElement>('[data-callout]').forEach((el) => {
      const id = el.dataset.callout!;
      el.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse' && fine.matches) show(id);
      });
      el.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse' && fine.matches) show(pinned);
      });
      if (el instanceof HTMLButtonElement) {
        el.setAttribute('aria-pressed', 'false');
        el.addEventListener('focus', () => show(id));
        el.addEventListener('blur', () => show(pinned));
        el.addEventListener('click', () => {
          pinned = pinned === id ? null : id;
          show(pinned ?? id);
          if (!fine.matches) {
            const note = fig.querySelector<HTMLElement>(`li[data-callout="${id}"]`);
            const r = note?.getBoundingClientRect();
            if (note && r && (r.top < 0 || r.bottom > window.innerHeight)) {
              note.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }
        });
      }
    });

    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        pinned = null;
        show(null);
      }
    });
  });
}
