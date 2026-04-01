/**
 * history.js — Loads and renders measurement history
 */
document.addEventListener('DOMContentLoaded', () => {
  const filterOp   = document.getElementById('filter-op');
  const filterType = document.getElementById('filter-type');
  const tbody      = document.getElementById('history-tbody');
  const refreshBtn = document.getElementById('btn-refresh');

  function formatOp(op) {
    if (!op) return '—';
    return `<span class="op-badge ${op.toLowerCase()}">${op.toLowerCase()}</span>`;
  }

  function formatDetails(row) {
    const from = `${row.thisValue ?? ''} ${row.thisUnit ?? ''}`.trim();
    const to   = `${row.thatValue ?? ''} ${row.thatUnit ?? ''}`.trim();
    if (row.error) {
      return `<span style="color:var(--error); font-size:.85rem;">${row.errorMessage || 'Error'}</span>`;
    }
    if (row.operation === 'compare') {
      return `<strong>${from}</strong> vs <strong>${to}</strong> → <strong>${row.resultString}</strong>`;
    }
    if (row.operation === 'convert') {
      const result = `${row.resultValue ?? ''} ${row.resultUnit ?? ''}`.trim();
      return `<strong>${from}</strong> → <strong>${result}</strong>`;
    }
    // arithmetic
    const opSym = { add: '+', subtract: '−', divide: '÷' }[row.operation] || '?';
    const result = `${row.resultValue ?? ''} ${row.resultUnit ?? ''}`.trim();
    return `<strong>${from}</strong> ${opSym} <strong>${to}</strong> = <strong>${result}</strong>`;
  }

  function renderRows(data) {
    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="4">No records found.</td></tr>`;
      return;
    }
    tbody.innerHTML = data.map((row, i) => `
      <tr>
        <td style="color:var(--text-muted); font-size:.8rem;">#${i + 1}</td>
        <td><span class="type-tag">${(row.thisMeasurementType || '').replace('Unit', '')}</span></td>
        <td>${formatOp(row.operation)}</td>
        <td>${formatDetails(row)}</td>
      </tr>
    `).join('');
  }

  async function loadHistory() {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="4">Loading…</td></tr>`;
    refreshBtn.disabled = true;

    try {
      const op   = filterOp.value;
      const type = filterType.value;

      let data;
      if (op !== 'all') {
        data = await api.historyByOperation(op);
      } else if (type !== 'all') {
        data = await api.historyByType(type);
      } else {
        // Fetch all operations and merge
        const [compare, convert, add, subtract, divide] = await Promise.all([
          api.historyByOperation('compare').catch(() => []),
          api.historyByOperation('convert').catch(() => []),
          api.historyByOperation('add').catch(() => []),
          api.historyByOperation('subtract').catch(() => []),
          api.historyByOperation('divide').catch(() => []),
        ]);
        data = [...compare, ...convert, ...add, ...subtract, ...divide];
      }

      // Apply type filter client-side if both filters set
      if (op !== 'all' && type !== 'all') {
        data = data.filter(r => r.thisMeasurementType === type);
      }

      renderRows(data);
    } catch (err) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="4" style="color:var(--error);">${err.message}</td></tr>`;
    } finally {
      refreshBtn.disabled = false;
    }
  }

  filterOp.addEventListener('change', loadHistory);
  filterType.addEventListener('change', loadHistory);
  refreshBtn.addEventListener('click', loadHistory);

  loadHistory();
});
