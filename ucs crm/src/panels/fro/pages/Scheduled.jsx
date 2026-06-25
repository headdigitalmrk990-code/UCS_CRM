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
      <div style={{ textAlign:'center', padding:40, fontSize:12, color:'var(--ink-soft)' }}>
        {emptyMsg || 'No entries found.'}
      </div>
    );
  }

  return (
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
      <thead>
        <tr style={{ borderBottom:'1px solid var(--line)' }}>
          <th style={{ textAlign:'left', padding:'8px 10px', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--ink-soft)' }}>Donor</th>
          <th style={{ textAlign:'left', padding:'8px 10px', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--ink-soft)' }}>Mobile</th>
          <th style={{ textAlign:'left', padding:'8px 10px', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--ink-soft)' }}>Date & Time</th>
          <th style={{ textAlign:'left', padding:'8px 10px', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--ink-soft)' }}>Notes</th>
          <th style={{ textAlign:'left', padding:'8px 10px', fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--ink-soft)' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {list.map((item, i) => {
          const st = statusStyles[item.status] || statusStyles.pending;
          return (
            <tr key={item.id || i} style={{ borderBottom:'1px solid var(--line)' }}>
              <td style={{ padding:'8px 10px', fontWeight:600 }}>{item.donor_name || '—'}</td>
              <td style={{ padding:'8px 10px' }}>{item.donor_mobile || '—'}</td>
              <td style={{ padding:'8px 10px' }}>{item.scheduled_at ? new Date(item.scheduled_at).toLocaleString('en-GB') : '—'}</td>
              <td style={{ padding:'8px 10px', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--ink-soft)' }}>{item.notes || '—'}</td>
              <td style={{ padding:'8px 10px' }}>
                <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:10, fontSize:10, fontWeight:600, background:st.bg, color:st.color, textTransform:'capitalize' }}>{item.status || 'pending'}</span>
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
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--line)', flexShrink:0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:'10px 20px', border:'none', borderBottom: tab === t.id ? '2px solid var(--sage)' : '2px solid transparent', background:'transparent', fontSize:12, fontWeight:700, fontFamily:'inherit', cursor:'pointer', color: tab === t.id ? 'var(--sage)' : 'var(--ink-soft)', transition:'all .12s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {tab === 'scheduled' ? (
          <ListTable list={scheduledList} emptyMsg="No scheduled contacts." />
        ) : (
          <ListTable list={callbackList} emptyMsg="No callbacks." />
        )}
      </div>
    </div>
  );
}
