/**
 * The eyes: they blink at random intervals and, depending on data-track,
 * look toward the pointer inside their own section ("pointer") or toward the
 * link you hover or focus ("focus"). Nothing runs with reduced motion, while
 * the eyes are off-screen, or while the tab is hidden.
 */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');

interface Vec {
  x: number;
  y: number;
}

const REST: Vec = { x: 0.6, y: 2.2 };

function setup(svg: SVGSVGElement): void {
  const eyes = Array.from(svg.querySelectorAll<SVGGElement>('.eye'));
  const pupils = Array.from(svg.querySelectorAll<SVGGElement>('.pupil'));
  if (!eyes.length || !pupils.length) return;

  const mode = svg.dataset.track;
  const scope = svg.closest('section') ?? document.body;
  const max = 3.4;
  let visible = false;
  let target: Vec = { ...REST };
  let current: Vec = { ...REST };
  let raf = 0;
  let blinkTimer = 0;

  const render = () => {
    const t = `translate(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px)`;
    pupils.forEach((p) => (p.style.transform = t));
  };

  const step = () => {
    current.x += (target.x - current.x) * 0.16;
    current.y += (target.y - current.y) * 0.16;
    render();
    if (Math.abs(target.x - current.x) > 0.02 || Math.abs(target.y - current.y) > 0.02) {
      raf = requestAnimationFrame(step);
    } else {
      raf = 0;
    }
  };

  const move = () => {
    if (!raf) raf = requestAnimationFrame(step);
  };

  const lookAt = (clientX: number, clientY: number) => {
    const box = eyes[0]!.getBoundingClientRect();
    const box2 = eyes[eyes.length - 1]!.getBoundingClientRect();
    const cx = (box.left + box2.right) / 2;
    const cy = (box.top + box.bottom) / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const m = Math.min(max, dist / 60);
    target = { x: (dx / dist) * m, y: (dy / dist) * m * 0.85 };
    move();
  };

  const rest = () => {
    target = { ...REST };
    move();
  };

  const blink = () => {
    if (!visible || document.hidden || reduce.matches) return;
    eyes.forEach((eye) =>
      eye.animate(
        [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.08)', offset: 0.45 }, { transform: 'scaleY(1)' }],
        { duration: 190, easing: 'ease-in-out' },
      ),
    );
  };

  const scheduleBlink = () => {
    window.clearTimeout(blinkTimer);
    blinkTimer = window.setTimeout(() => {
      blink();
      if (Math.random() < 0.18) window.setTimeout(blink, 280);
      if (visible) scheduleBlink();
    }, 3200 + Math.random() * 5400);
  };

  new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (visible) scheduleBlink();
    else window.clearTimeout(blinkTimer);
  }).observe(svg);

  if (mode === 'pointer') {
    scope.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || !finePointer.matches || reduce.matches) return;
      lookAt(e.clientX, e.clientY);
    });
    scope.addEventListener('pointerleave', rest);
  }

  if (mode === 'focus') {
    scope.querySelectorAll<HTMLElement>('[data-look]').forEach((el) => {
      const toward = () => {
        if (reduce.matches) return;
        const r = el.getBoundingClientRect();
        lookAt(r.left + Math.min(r.width / 2, 120), r.top + r.height / 2);
      };
      el.addEventListener('pointerenter', toward);
      el.addEventListener('focus', toward);
      el.addEventListener('pointerleave', rest);
      el.addEventListener('blur', rest);
    });
  }
}

export function initEyes(): void {
  if (reduce.matches) return;
  document.querySelectorAll<SVGSVGElement>('svg[data-eyes]').forEach(setup);
}
