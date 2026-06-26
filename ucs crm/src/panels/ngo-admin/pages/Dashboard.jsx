import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { apiGet } from '../api/auth';

const DISPOSITION_LABELS = {
  pending: 'Pending', contacted: 'Contacted', follow_up: 'Follow Up', scheduled: 'Scheduled',
  busy: 'Busy', ringing: 'Ringing', unreachable: 'Unreachable', switched_off: 'Switched Off',
  wrong_number: 'Wrong Number', invalid_number: 'Invalid', rejected: 'Rejected',
  lead_done: 'Lead Done', visit_donate: 'Visit & Donate', promise_to_pay: 'Promise to Pay',
  payment_pending: 'Payment Pending', already_donated: 'Already Donated',
  not_interested: 'Not Interested', not_interested_now: 'Not Interested Now',
  language_barrier: 'Language Barrier', transferred_senior: 'Transferred to Senior',
  query_complaint: 'Query/Complaint', receipt_request: 'Receipt Request',
  donation_collected: 'Donation Collected',
};

const DISPOSITION_GROUPS = [
  { label: 'Converted', color: '#16a34a', bg: '#f0fdf4', light: '#bbf7d0', statuses: ['donation_collected', 'promise_to_pay', 'lead_done', 'visit_donate', 'payment_pending', 'already_donated'] },
  { label: 'In Progress', color: '#d97706', bg: '#fffbeb', light: '#fde68a', statuses: ['pending', 'contacted', 'follow_up', 'scheduled'] },
  { label: 'Negative', color: '#dc2626', bg: '#fef2f2', light: '#fca5a5', statuses: ['not_interested', 'not_interested_now', 'rejected', 'busy', 'ringing', 'unreachable', 'switched_off', 'wrong_number', 'invalid_number', 'language_barrier'] },
  { label: 'Other', color: '#5B6B4E', bg: '#f0f2ee', light: '#a8b59a', statuses: ['transferred_senior', 'query_complaint', 'receipt_request'] },
];

const getStatusColor = (status) => {
  for (const g of DISPOSITION_GROUPS) {
    if (g.statuses.includes(status)) return g.color;
  }
  return '#dc2626';
};

const STAT_CARDS = [
  { label: 'Total Donors', key: 'total_donors', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: 'Assigned Donors', key: 'assigned_donors', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 3.13 19 6.13 22 3.13"/></svg> },
  { label: 'Active FROs', key: 'active_fros', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: 'Month Collection', key: 'month_collection', format: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg> },
];

function StationDetailModal({ station, stats, stationInfo, onClose }) {
  if (!station) return null;
  const total = Object.values(stats || {}).reduce((t, v) => t + v, 0);

  const groupData = DISPOSITION_GROUPS.map(g => ({
    ...g,
    total: g.statuses.reduce((t, s) => t + (stats?.[s] || 0), 0),
  })).filter(g => g.total > 0);

  const allStatuses = DISPOSITION_GROUPS.flatMap(g =>
    g.statuses.filter(s => (stats?.[s] || 0) > 0).map(s => ({ status: s, count: stats[s], group: g }))
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-head">
          <h3>{station}</h3>
          <button className="btn btn-sm btn-outline" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--sage)' }}>{total}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>Total Donors</div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--sage)' }}>{stationInfo?.ngos?.length || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>NGOs</div>
            </div>
          </div>

          {stationInfo?.fro_worker_name && (
            <div style={{ marginBottom: 14, padding: '10px 14px', background: '#f0f2ee', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6B4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{stationInfo.fro_worker_name}</span>
            </div>
          )}

          {groupData.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ height: 8, borderRadius: 4, background: '#e5e7eb', display: 'flex', overflow: 'hidden' }}>
                {groupData.map(g => (
                  <div key={g.label} style={{ width: `${(g.total / total) * 100}%`, height: '100%', background: g.color, opacity: 0.6 }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                {groupData.map(g => (
                  <span key={g.label} style={{ fontSize: 11, fontWeight: 600, color: g.color, background: g.bg, padding: '2px 10px', borderRadius: 10 }}>
                    {g.label}: {g.total}
                  </span>
                ))}
              </div>
            </div>
          )}

          {allStatuses.length > 0 && (
            <div>
              <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--ink-soft)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Disposition Breakdown</div>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {allStatuses.map(({ status, count, group }) => (
                  <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--line)', fontSize: 12 }}>
                    <span style={{ color: 'var(--ink-soft)' }}>{DISPOSITION_LABELS[status] || status}</span>
                    <span style={{ fontWeight: 600, color: group.color }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [stationStats, setStationStats] = useState(null);
  const [stationsData, setStationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    Promise.all([
      apiGet('/ngo-admin/dashboard'),
      apiGet('/ngo-admin/dashboard/station-stats'),
      apiGet('/ngo-admin/stations'),
    ])
      .then(([d, s, st]) => {
        setData(d);
        setStationStats(s);
        setStationsData(Array.isArray(st) ? st : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!data) return <div className="empty-state"><p>Could not load dashboard data.</p></div>;

  const stations = stationStats?.stations || {};
  const summary = stationStats?.summary || {};
  const stationNames = Object.keys(stations).sort((a, b) => {
    const idxA = a.lastIndexOf('-'), idxB = b.lastIndexOf('-');
    const numA = idxA > 0 ? parseInt(a.slice(idxA + 1)) || 0 : 0;
    const numB = idxB > 0 ? parseInt(b.slice(idxB + 1)) || 0 : 0;
    const preA = idxA > 0 ? a.slice(0, idxA) : a;
    const preB = idxB > 0 ? b.slice(0, idxB) : b;
    if (preA !== preB) return preA.localeCompare(preB);
    return numA - numB;
  });

  const getCell = (station, status) => stations[station]?.[status] || 0;
  const getStationTotal = (station) => Object.values(stations[station] || {}).reduce((t, v) => t + v, 0);
  const grandTotal = stationNames.reduce((t, s) => t + getStationTotal(s), 0);

  const stationInfoMap = {};
  for (const st of stationsData) {
    stationInfoMap[st.station] = st;
  }

  const pieData = DISPOSITION_GROUPS.map(g => ({
    name: g.label,
    value: g.statuses.reduce((t, s) => t + (summary[s] || 0), 0),
    color: g.color,
  })).filter(d => d.value > 0);

  const barData = stationNames.map(s => ({
    name: s,
    total: getStationTotal(s),
    ...Object.fromEntries(DISPOSITION_GROUPS.map(g => [g.label, g.statuses.reduce((t, st) => t + getCell(s, st), 0)])),
  }));

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14, marginBottom: 20,
      }}>
        {STAT_CARDS.map((card, i) => {
          const val = card.format ? card.format(data[card.key]) : data[card.key];
          return (
            <div key={i} className="card" style={{ marginBottom: 0, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--sage)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0,
                }}>
                  {card.icon}
                </div>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500 }}>{card.label}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.15 }}>{val}</div>
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14, marginBottom: 20,
      }}>
        {pieData.length > 0 && (
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-head">
              <h3>Disposition Overview</h3>
              <span className="count">{grandTotal} total</span>
            </div>
            <div className="card-pad" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={60} dataKey="value" paddingAngle={2}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, 'Donors']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--ink-soft)', flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {barData.length > 0 && (
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-head">
              <h3>Station-wise Totals</h3>
              <span className="count">{barData.length} stations</span>
            </div>
            <div className="card-pad" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  {DISPOSITION_GROUPS.map(g => (
                    <Bar key={g.label} dataKey={g.label} stackId="a" fill={g.color} opacity={0.65} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {stationNames.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              <h3>Station Details</h3>
            </div>
            <span className="count" style={{ background: '#5B6B4E12', color: 'var(--sage)', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
              {stationNames.length} stations
            </span>
          </div>
          <div className="card-pad">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 10,
            }}>
              {stationNames.map(st => {
                const total = getStationTotal(st);
                const info = stationInfoMap[st];
                const hasFro = info?.fro_worker_name;

                const groupCounts = DISPOSITION_GROUPS.map(g => ({
                  ...g, count: g.statuses.reduce((t, s) => t + getCell(st, s), 0),
                }));
                const visibleGroups = groupCounts.filter(g => g.count > 0);

                return (
                  <div key={st} style={{
                    background: 'var(--card-bg)', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--line)', cursor: 'pointer',
                    transition: 'box-shadow .2s, border-color .2s, transform .2s',
                    overflow: 'hidden',
                  }}
                    onClick={() => setSelectedStation(st)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sage)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
                    <div style={{ padding: '14px 14px 10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{st}</span>
                        <span style={{
                          background: 'var(--sage)', color: '#fff', borderRadius: 20,
                          padding: '0 10px', fontSize: 12, fontWeight: 700, lineHeight: '22px',
                        }}>{total}</span>
                      </div>

                      <div style={{ height: 4, borderRadius: 2, background: '#e5e7eb', display: 'flex', overflow: 'hidden', marginBottom: 8 }}>
                        {visibleGroups.map((g, i) => (
                          <div key={g.label} style={{
                            width: `${(g.count / total) * 100}%`, height: '100%',
                            background: g.color, opacity: 0.5,
                            borderRight: i < visibleGroups.length - 1 ? '1px solid #fff' : 'none',
                          }} />
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 0 }}>
                        {visibleGroups.slice(0, 3).map(g => (
                          <span key={g.label} style={{ fontSize: 10, color: g.color, fontWeight: 600, padding: '1px 7px', borderRadius: 8, background: g.bg }}>
                            {g.count}
                          </span>
                        ))}
                      </div>
                    </div>

                    {hasFro && (
                      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--line)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-soft)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B6B4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {info.fro_worker_name}
                        {info?.ngos?.length > 0 && (
                          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--ink-soft)' }}>
                            {info.ngos.length} NGO{info.ngos.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedStation && (
        <StationDetailModal
          station={selectedStation}
          stats={stations[selectedStation]}
          stationInfo={stationInfoMap[selectedStation]}
          onClose={() => setSelectedStation(null)}
        />
      )}
    </div>
  );
}
