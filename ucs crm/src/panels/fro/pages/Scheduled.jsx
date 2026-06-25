import { useState, useEffect } from 'react';
import { getScheduled } from '../api/donors';

const statusStyles = {
  pending: { bg:'#fef3c7', color:'#92400e' },
  completed: { bg:'#dcfce7', color:'#166534' },
  missed: { bg:'#fef2f2', color:'#991b1b' },
};

export default function Scheduled() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getScheduled()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading scheduled…</div>;

  if (list.length === 0) {
    return (
      <div className="bento-grid">
        <div className="bento-col-12">
          <div className="bento-card" style={{ alignItems:'center', padding:40 }}>
            <span className="material-symbols-outlined" style={{ fontSize:32, marginBottom:8, opacity:.3 }}>schedule</span>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>No scheduled contacts</div>
            <div style={{ fontSize:11, color:'var(--ink-soft)' }}>Scheduled callbacks and follow-ups will appear here.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bento-grid">
      <div className="bento-col-12">
        <div className="bento-card" style={{ padding:0 }}>
          <table className="bento-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Mobile</th>
                <th>Scheduled At</th>
                <th>Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, i) => {
                const st = statusStyles[item.status] || statusStyles.pending;
                return (
                  <tr key={item.id || i}>
                    <td style={{ fontWeight:600 }}>{item.donor_name || '—'}</td>
                    <td>{item.donor_mobile || '—'}</td>
                    <td>{item.scheduled_at ? new Date(item.scheduled_at).toLocaleString('en-GB') : '—'}</td>
                    <td style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--ink-soft)' }}>{item.notes || '—'}</td>
                    <td>
                      <span style={{ display:'inline-block', padding:'1px 8px', borderRadius:10, fontSize:9, fontWeight:600, background:st.bg, color:st.color, textTransform:'capitalize' }}>{item.status || 'pending'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
