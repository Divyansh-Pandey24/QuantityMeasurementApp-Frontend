/**
 * dashboard.js — Loads stat counts from the backend
 */
document.addEventListener('DOMContentLoaded', async () => {
  async function loadCount(operation, elId) {
    try {
      const count = await api.operationCount(operation);
      const el = document.getElementById(elId);
      if (el) el.textContent = count ?? 0;
    } catch (_) {
      const el = document.getElementById(elId);
      if (el) el.textContent = '—';
    }
  }

  // Load all stats in parallel
  await Promise.all([
    loadCount('CONVERT',   'stat-convert'),
    loadCount('COMPARE',   'stat-compare'),
    loadCount('ADD',       'stat-add'),
    loadCount('SUBTRACT',  'stat-subtract'),
    loadCount('DIVIDE',    'stat-divide'),
  ]);

  // Sum arithmetic operations
  const addEl  = document.getElementById('stat-add');
  const subEl  = document.getElementById('stat-subtract');
  const divEl  = document.getElementById('stat-divide');
  const arithEl = document.getElementById('stat-arithmetic');
  if (arithEl && addEl && subEl && divEl) {
    const total = (parseInt(addEl.textContent) || 0)
                + (parseInt(subEl.textContent) || 0)
                + (parseInt(divEl.textContent) || 0);
    arithEl.textContent = total;
    addEl.closest('.stat-card')?.classList.add('hidden');
    subEl.closest('.stat-card')?.classList.add('hidden');
    divEl.closest('.stat-card')?.classList.add('hidden');
  }
});
