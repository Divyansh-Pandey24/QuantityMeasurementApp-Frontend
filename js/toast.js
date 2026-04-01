/**
 * toast.js — Lightweight notification system
 */
const toast = (() => {
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function iconSvg(type) {
    if (type === 'success') return `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;
    if (type === 'error')   return `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    return `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  }

  function show(message, type = 'info', duration = 4000) {
    const c = getContainer();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${iconSvg(type)}</span>
      <span class="toast-msg">${message}</span>
      <span class="toast-close"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
    `;

    el.querySelector('.toast-close').addEventListener('click', () => dismiss(el));
    c.appendChild(el);

    if (duration > 0) {
      setTimeout(() => dismiss(el), duration);
    }
  }

  function dismiss(el) {
    if (!el.isConnected) return;
    el.classList.add('toast-out');
    setTimeout(() => el.remove(), 220);
  }

  return { show };
})();
