/** "Copy address" for the email link. Hidden unless the Clipboard API is available. */
export function initCopy(): void {
  if (!navigator.clipboard?.writeText) return;
  document.querySelectorAll<HTMLButtonElement>('button[data-copy]').forEach((btn) => {
    const status = btn.parentElement?.querySelector<HTMLElement>('[data-copy-status]');
    btn.hidden = false;
    let timer = 0;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy ?? '');
        btn.classList.add('is-copied');
        if (status) status.textContent = 'Email address copied';
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          btn.classList.remove('is-copied');
          if (status) status.textContent = '';
        }, 2200);
      } catch {
        if (status) status.textContent = 'Copying failed. Select the address and copy it instead.';
      }
    });
  });
}
