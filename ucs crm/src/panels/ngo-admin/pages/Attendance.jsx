import { useState, useEffect } from 'react';
import { apiGet } from '../api/auth';

function fmtTime(t) {
  if (!t) return '—';
  const d = new Date(t);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const STATUS_COLORS = {
  present: '#10b981',
  late: '#f59e0b',
  absent: '#ef4444',
  'half-day': '#8b5cf6',
  leave: '#3b82f6',
};

export default function NgoAttendance() {
  const [records, setRecords] = useState([]);
  const [froWorkers, setFroWorkers] = useState([]);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [err, setErr] = useState('');

  useEffect(() => {
    apiGet('/attendance/all').then(setRecords).catch(e => setErr(e.message));
    apiGet('/ngo-admin/fro-workers').then(setFroWorkers).catch(() => {});
  }, []);

  const froIds = new Set(froWorkers.map(w => w.id));

  const [year, m] = month.split('-');
  let filtered = records.filter(r => {
    const d = r.date || '';
    return d.startsWith(`${year}-${m}`) && froIds.has(r.worker_id);
  });

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(r => (r.workers?.name || '').toLowerCase().includes(s));
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head"><h3>FRO Attendance</h3></div>
        <div className="card-pad">
          {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#991b1b' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)}
              style={{ fontSize: 13, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--line, #e5e7eb)' }} />
            <input placeholder="Search worker…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ fontSize: 13, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--line, #e5e7eb)', flex: 1, maxWidth: 240 }} />
            <span style={{ fontSize: 13, color: '#6b7280' }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ fontSize: 13, borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--line, #e5e7eb)', whiteSpace: 'nowrap' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--line, #e5e7eb)' }}>Worker</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--line, #e5e7eb)' }}>Punch In</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--line, #e5e7eb)' }}>Punch Out</th>
                  <th style={{ textAlign: 'center', padding: '8px 10px', borderBottom: '2px solid var(--line, #e5e7eb)' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', borderBottom: '2px solid var(--line, #e5e7eb)' }}>Late (min)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line, #e5e7eb)', whiteSpace: 'nowrap', color: '#6b7280' }}>{r.date}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line, #e5e7eb)', fontWeight: 500 }}>{r.workers?.name || 'Unknown'}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line, #e5e7eb)' }}>{fmtTime(r.punch_in_time)}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line, #e5e7eb)' }}>{fmtTime(r.punch_out_time)}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line, #e5e7eb)', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                        background: STATUS_COLORS[r.status] ? `${STATUS_COLORS[r.status]}18` : '#f3f4f6',
                        color: STATUS_COLORS[r.status] || '#6b7280',
                      }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid var(--line, #e5e7eb)', textAlign: 'right', color: r.late_minutes > 0 ? '#f59e0b' : '#d1d5db' }}>{r.late_minutes || 0}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>No attendance records for this month</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}