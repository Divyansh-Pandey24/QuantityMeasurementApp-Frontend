import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { historyByOperation, historyByType } from '../api/client';
import { useToast } from '../context/ToastContext';

function OpBadge({ op }) {
  if (!op) return <span>—</span>;
  return <span className={`op-badge ${op.toLowerCase()}`}>{op.toLowerCase()}</span>;
}

function formatDetails(row) {
  const from = `${row.thisValue ?? ''} ${row.thisUnit ?? ''}`.trim();
  const to   = `${row.thatValue ?? ''} ${row.thatUnit ?? ''}`.trim();
  if (row.error) {
    return <span style={{ color: 'var(--error)', fontSize: '.85rem' }}>{row.errorMessage || 'Error'}</span>;
  }
  if (row.operation === 'compare') {
    return <><strong>{from}</strong> vs <strong>{to}</strong> → <strong>{row.resultString}</strong></>;
  }
  if (row.operation === 'convert') {
    const result = `${row.resultValue ?? ''} ${row.resultUnit ?? ''}`.trim();
    return <><strong>{from}</strong> → <strong>{result}</strong></>;
  }
  const opSym = { add: '+', subtract: '−', divide: '÷' }[row.operation] || '?';
  const result = `${row.resultValue ?? ''} ${row.resultUnit ?? ''}`.trim();
  return <><strong>{from}</strong> {opSym} <strong>{to}</strong> = <strong>{result}</strong></>;
}

export default function HistoryPage() {
  const [filterOp, setFilterOp] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setRows(null);
    try {
      let data;
      if (filterOp !== 'all') {
        data = await historyByOperation(filterOp);
      } else if (filterType !== 'all') {
        data = await historyByType(filterType);
      } else {
        const [compare, convert, add, subtract, divide] = await Promise.all([
          historyByOperation('compare').catch(() => []),
          historyByOperation('convert').catch(() => []),
          historyByOperation('add').catch(() => []),
          historyByOperation('subtract').catch(() => []),
          historyByOperation('divide').catch(() => []),
        ]);
        data = [...compare, ...convert, ...add, ...subtract, ...divide];
      }
      if (filterOp !== 'all' && filterType !== 'all') {
        data = data.filter(r => r.thisMeasurementType === filterType);
      }
      setRows(data);
    } catch (err) {
      toast.show(err.message, 'error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filterOp, filterType, toast]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  return (
    <>
      <Navbar />
      <main className="history-page">
        <div className="page-header">
          <h1>Measurement History</h1>
          <p>Review your past calculations — filter by operation type or measurement category.</p>
        </div>

        <div className="filter-panel">
          <div className="filter-group">
            <label className="filter-label">Operation</label>
            <select className="filter-select" value={filterOp} onChange={e => setFilterOp(e.target.value)}>
              <option value="all">All Operations</option>
              <option value="compare">Compare</option>
              <option value="convert">Convert</option>
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
              <option value="divide">Divide</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Measurement Type</label>
            <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="LengthUnit">Length</option>
              <option value="WeightUnit">Weight</option>
              <option value="TemperatureUnit">Temperature</option>
              <option value="VolumeUnit">Volume</option>
            </select>
          </div>
          <button className="btn-refresh" onClick={loadHistory} disabled={loading}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="table-card">
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Operation</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading || rows === null ? (
                <tr className="empty-row"><td colSpan="4">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr className="empty-row"><td colSpan="4">No records found.</td></tr>
              ) : rows.map((row, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>#{i + 1}</td>
                  <td><span className="type-tag">{(row.thisMeasurementType || '').replace('Unit', '')}</span></td>
                  <td><OpBadge op={row.operation} /></td>
                  <td>{formatDetails(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
