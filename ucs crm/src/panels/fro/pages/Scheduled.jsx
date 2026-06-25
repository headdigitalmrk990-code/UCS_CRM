import { useState, useEffect } from 'react';
import { getScheduled, getCallbacks } from '../api/donors';

const TABS = [
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'callback', label: 'Callback' },
];

const statusStyles = {
  pending: { bg:'#fef3c7', color:'#92400e' },
  completed: { bg:'#dcfce7', color:'#166534' },
  missed: { bg:'#fef2f2', color:'#991b1b' },
};

function ListTable({ list, emptyMsg }) {
  if (list.length === 0) {
    return (
      <div style={{ textAlign:'center', padding:32, fontSize:11, color:'var(--ink-soft)' }}>
        {emptyMsg || 'No entries found.'}
      </div>
    );
  }

  return (
    <table className="bento-table">
      <thead>
        <tr>
          <th>Donor</th>
          <th>Mobile</th>
          <th>Date & Time</th>
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
  );
}

export default function Scheduled() {
  const [tab, setTab] = useState('scheduled');
  const [scheduledList, setScheduledList] = useState([]);
  const [callbackList, setCallbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getScheduled().catch(() => []),
      getCallbacks().catch(() => []),
    ]).then(([s, c]) => {
      setScheduledList(s);
      setCallbackList(c);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div className="bento-grid">
      <div className="bento-col-12">
        <div className="bento-card" style={{ padding:0 }}>
          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid var(--line)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex:1, padding:'10px 16px', border:'none', borderBottom: tab === t.id ? '2px solid var(--sage)' : '2px solid transparent', background:'transparent', fontSize:11, fontWeight:700, fontFamily:'inherit', cursor:'pointer', color: tab === t.id ? 'var(--sage)' : 'var(--ink-soft)', transition:'all .12s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ overflowX:'auto' }}>
            {tab === 'scheduled' ? (
              <ListTable list={scheduledList} emptyMsg="No scheduled contacts." />
            ) : (
              <ListTable list={callbackList} emptyMsg="No callbacks." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
