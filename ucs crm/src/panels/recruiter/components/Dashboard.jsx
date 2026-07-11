import { useState, useEffect } from 'react';
import { useRec, LEAD_STATUSES } from '../store';
import { Who, Score } from './ui';
import { Users, Brief, Funnel, Star } from '../icons';
import RecentNotices from '../../../components/RecentNotices';

function useCountUp(target, dur = 600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const num = Number(target);
    if (!num || isNaN(num)) { setV(0); return; }
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setV(Math.round(num * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

function Count({ value }) {
  const str = String(value);
  const num = parseInt(str, 10);
  const suffix = str.replace(/[0-9]/g, '');
  const n = useCountUp(num);
  return <>{n}{suffix}</>;
}

export default function Dashboard() {
  const { leads, leadsLoading, leadStats, candidates, jobs, feed } = useRec();
  const total = leadStats?.total || leads.length;
  const newToday = leadStats?.newToday || 0;
  const byStatus = leadStats?.byStatus || {};
  const conversion = leadStats?.conversionRate || 0;
  const loading = leadsLoading && leads.length === 0;

  const cards = [
    { label:'Total leads',    icon:<Users width={12}/>,  num:total,    foot:'all time', c:'#5B6B4E' },
    { label:'New today',      icon:<Star width={12}/>,   num:newToday, foot:'added today', c:'#4F6472' },
    { label:'On hold',        icon:<Funnel width={12}/>, num:byStatus?.hold||0, foot:'waiting', c:'#C08A2E' },
    { label:'Conversion',     icon:<Brief width={12}/>,  num:conversion+'%', foot:'selected vs rejected', c:'#B5603A' },
  ];

  const [leadPage, setLeadPage] = useState(1);
  const PER_PAGE = 10;
  const totalLeadPages = Math.max(1, Math.ceil(leads.length / PER_PAGE));
  const paginatedLeads = [...leads].slice((leadPage - 1) * PER_PAGE, leadPage * PER_PAGE);

  const stageCounts = {};
  candidates.forEach(c => { stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1; });
  const stageOrder = ['Contacted','Screening','Interview Scheduled','Selected','Offer Sent','Rejected'];
  const stagePalette = ['#5B6B4E','#4F6472','#7A5C7E','#B5603A','#C08A2E','#88693D'];

  const topCandidates = [...candidates].sort((a,b)=>b.score-a.score).slice(0, 5);

  const totalOpenings = jobs.reduce((s, j) => s + (j.status === 'Open' ? (Number(j.openings) || 1) : 0), 0);
  const openRoles = jobs.filter(j => j.status === 'Open').length;

  const upcomingInterviews = candidates.filter(c => c.stage === 'Interview Scheduled');

  const sourceCounts = {};
  candidates.forEach(c => { sourceCounts[c.source] = (sourceCounts[c.source] || 0) + 1; });
  const sourceOrder = ['LinkedIn','Referral','Job Portal','Walk-in','Other'];
  const sourceColors = ['#5B6B4E','#4F6472','#7A5C7E','#B5603A','#C08A2E'];

  const funnelSteps = [
    { label:'Leads',         count:total,    color:'#5B6B4E' },
    { label:'Contacted',     count:stageCounts['Contacted']||0,           color:'#4F6472' },
    { label:'Screening',     count:stageCounts['Screening']||0,           color:'#7A5C7E' },
    { label:'Interview',     count:stageCounts['Interview Scheduled']||0, color:'#B5603A' },
    { label:'Selected/Offer',count:(stageCounts['Selected']||0)+(stageCounts['Offer Sent']||0), color:'#C08A2E' },
    { label:'Rejected',      count:stageCounts['Rejected']||0,            color:'#88693D' },
  ];
  const funnelMax = Math.max(...funnelSteps.map(s => s.count), 1);

  const statusLabel = {};
  LEAD_STATUSES.forEach(s => { statusLabel[s.value] = s.label; });
  const leadStatusEntries = Object.entries(byStatus).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]);
  const statusPalette = ['#5B6B4E','#4F6472','#7A5C7E','#B5603A','#C08A2E','#88693D','#9E3B2E','#6F6857','#5B6B4E','#4F6472','#7A5C7E','#B5603A'];

  const s = { g:14, m:14, p:'var(--card-pad, 10px 14px)', ps:'var(--card-pad-s, 6px 14px)' };
  const cardHead = { padding:s.ps, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--line)' };
  const cardH3 = { fontSize:13, fontWeight:600, margin:0 };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:s.g}}>
      {/* ── METRICS ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10}}>
        {cards.map(c => (
          <div key={c.label} style={{background:'var(--paper)',border:'1px solid var(--line)',borderRadius:'var(--radius-sm)',padding:'10px 14px'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'var(--ink-soft)'}}><span className="dot" style={{background:c.c}} />{c.label}</div>
            {loading ? <><div className="skeleton" style={{height:18,width:60,marginTop:4}}/><div className="skeleton" style={{height:10,width:80,marginTop:2}}/></>
              : <><div style={{fontFamily:'Fraunces,serif',fontSize:22,fontWeight:500,marginTop:2,lineHeight:1.2}}><Count value={c.num} /></div><div style={{fontSize:10,color:'var(--ink-soft)'}}>{c.foot}</div></>}
          </div>
        ))}
      </div>

      {/* ── GRID-2: Upcoming interviews + Recent leads ── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:s.g}}>
        <div className="card" style={{fontSize:12}}>
          <div style={cardHead}><h3 style={cardH3}>Upcoming interviews</h3><span className="sub" style={{fontSize:11}}>{upcomingInterviews.length} scheduled</span></div>
          <div style={{maxHeight:130,overflowY:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead>
              <tr style={{fontSize:10,color:'var(--ink-soft)',textTransform:'uppercase',letterSpacing:'0.05em'}}>
                <th style={{padding:'6px 8px',textAlign:'left',fontWeight:500}}>Candidate</th>
                <th style={{padding:'6px 0',textAlign:'left',fontWeight:500}}>Exp</th>
                <th style={{padding:'6px 8px',textAlign:'left',fontWeight:500}}>Skills</th>
              </tr>
            </thead>
            <tbody>
              {upcomingInterviews.length === 0 ? (
                <tr><td colSpan={3} style={{padding:'14px 12px',textAlign:'center',color:'var(--ink-soft)'}}>No interviews scheduled.</td></tr>
              ) : (
                upcomingInterviews.map(c => (
                  <tr key={c.id}>
                    <td style={{padding:'5px 8px'}}><Who name={c.name} role={c.role} /></td>
                    <td style={{padding:'5px 0',color:'var(--ink-soft)',whiteSpace:'nowrap'}}>{c.exp}</td>
                    <td style={{padding:'5px 8px'}}><div className="tags" style={{display:'flex',gap:4,flexWrap:'wrap'}}>{c.skills.slice(0,2).map(s => <span className="tag" key={s} style={{fontSize:10,padding:'1px 6px'}}>{s}</span>)}</div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
        <div className="card" style={{fontSize:12}}>
          <div style={cardHead}><h3 style={cardH3}>Recent leads</h3><span className="sub" style={{fontSize:11}}>latest entries</span></div>
          <div style={{maxHeight:130,overflowY:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <tbody>
              {loading ? (
                Array.from({length:4}).map((_,i) => (
                  <tr key={i}>
                    <td style={{padding:'6px 12px'}}><div className="skeleton" style={{height:12,width:120}}/></td>
                    <td style={{padding:'6px 0'}}><div className="skeleton" style={{height:12,width:50}}/></td>
                    <td style={{padding:'6px 12px',textAlign:'right'}}><div className="skeleton" style={{height:12,width:60,marginLeft:'auto'}}/></td>
                  </tr>
                ))
              ) : paginatedLeads.length === 0 ? (
                <tr><td colSpan={3} style={{padding:'14px 12px',textAlign:'center',color:'var(--ink-soft)'}}>No leads yet.</td></tr>
              ) : (
                paginatedLeads.map(l => (
                  <tr key={l.id}>
                    <td style={{padding:'5px 12px'}}><Who name={l.name} role={l.source} /></td>
                    <td style={{padding:'5px 0',color:'var(--ink-soft)'}}>{l.status}</td>
                    <td style={{padding:'5px 12px',textAlign:'right',color:'var(--ink-soft)'}}>{l.phone || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* ── GRID-2: Activity + Lead status ── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:s.g}}>
        <div className="card">
          <div style={cardHead}><h3 style={cardH3}>Activity</h3></div>
          <div style={{padding:'4px 14px'}}>
            {feed.map(f => (
              <div key={f.id} className="feed-item" style={{fontSize:12}}><span className="tdot" /><div>{f.msg}<div className="ft" style={{fontSize:10}}>{f.time}</div></div></div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={cardHead}><h3 style={cardH3}>Lead status</h3><span className="sub" style={{fontSize:11}}>{leadStatusEntries.reduce((s,e)=>s+e[1],0)} total</span></div>
          <div style={{padding:'4px 14px'}}>
            {leadStatusEntries.length === 0 ? (
              <div style={{padding:'14px 0',textAlign:'center',color:'var(--ink-soft)',fontSize:12}}>No status data.</div>
            ) : (
              leadStatusEntries.map(([key, count], i) => {
                const pct = total ? Math.round(count/total*100) : 0;
                return (
                  <div key={key} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',borderBottom:'1px solid var(--line)'}}>
                    <span className="dot" style={{background:statusPalette[i%statusPalette.length]}} />
                    <span style={{flex:1,fontSize:11}}>{statusLabel[key] || key}</span>
                    <span style={{fontWeight:600,fontSize:13,width:22,textAlign:'right'}}>{count}</span>
                    <div style={{width:60,height:4,background:'var(--line)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{width:pct+'%',height:'100%',background:statusPalette[i%statusPalette.length],borderRadius:2}} />
                    </div>
                    <span style={{fontSize:10,color:'var(--ink-soft)',width:30,textAlign:'right'}}>{pct}%</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── QUICK STATS ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:10}}>
        {[
          { l:'Total candidates', n:candidates.length, f:'pipeline', c:'#5B6B4E' },
          { l:'Open roles', n:openRoles, f:totalOpenings+' openings', c:'#B5603A' },
          { l:'Interviews', n:stageCounts['Interview Scheduled']||0, f:'scheduled', c:'#C08A2E' },
          { l:'Selected/Offered', n:(stageCounts['Selected']||0)+(stageCounts['Offer Sent']||0), f:'offered', c:'#7A5C7E' },
        ].map(x => (
          <div key={x.l} style={{background:'var(--paper)',border:'1px solid var(--line)',borderRadius:'var(--radius-sm)',padding:'8px 12px'}}>
            <div style={{fontSize:10,color:'var(--ink-soft)'}}>{x.l}</div>
            <div style={{fontFamily:'Fraunces,serif',fontSize:20,fontWeight:500,lineHeight:1.2}}><Count value={x.n} /></div>
            <div style={{fontSize:10,color:'var(--ink-soft)'}}>{x.f}</div>
          </div>
        ))}
      </div>

      {/* ── GRID-2: Top candidates + Pipeline stages ── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:s.g}}>
        <div className="card">
          <div style={cardHead}><h3 style={cardH3}>Top candidates</h3></div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <tbody>
              {topCandidates.length === 0 ? (
                <tr><td style={{padding:'14px 12px',textAlign:'center',color:'var(--ink-soft)'}}>No candidates yet.</td></tr>
              ) : (
                topCandidates.map(c => (
                  <tr key={c.id}>
                    <td style={{padding:'5px 12px'}}><Who name={c.name} role={c.role} /></td>
                    <td style={{padding:'5px 0',color:'var(--ink-soft)'}}>{c.stage}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div style={cardHead}><h3 style={cardH3}>Pipeline stages</h3><span className="sub" style={{fontSize:11}}>distribution</span></div>
          <div style={{padding:'4px 14px'}}>
            {stageOrder.map((s, i) => {
              const count = stageCounts[s] || 0;
              const pct = candidates.length ? Math.round(count/candidates.length*100) : 0;
              return (
                <div key={s} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',borderBottom:'1px solid var(--line)'}}>
                  <span className="dot" style={{background:stagePalette[i]}} />
                  <span style={{flex:1,fontSize:11}}>{s}</span>
                  <span style={{fontWeight:600,fontSize:13,width:22,textAlign:'right'}}>{count}</span>
                  <div style={{width:60,height:4,background:'var(--line)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{width:pct+'%',height:'100%',background:stagePalette[i],borderRadius:2}} />
                  </div>
                  <span style={{fontSize:10,color:'var(--ink-soft)',width:30,textAlign:'right'}}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── GRID-2: Lead sources + Conversion funnel ── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:s.g}}>
        <div className="card">
          <div style={cardHead}><h3 style={cardH3}>Lead sources</h3><span className="sub" style={{fontSize:11}}>origin</span></div>
          <div style={{padding:'4px 14px'}}>
            {sourceOrder.map((s, i) => {
              const count = sourceCounts[s] || 0;
              const pct = candidates.length ? Math.round(count/candidates.length*100) : 0;
              return (
                <div key={s} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',borderBottom:'1px solid var(--line)'}}>
                  <span className="dot" style={{background:sourceColors[i]}} />
                  <span style={{flex:1,fontSize:11}}>{s}</span>
                  <span style={{fontWeight:600,fontSize:13,width:22,textAlign:'right'}}>{count}</span>
                  <div style={{width:60,height:4,background:'var(--line)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{width:pct+'%',height:'100%',background:sourceColors[i],borderRadius:2}} />
                  </div>
                  <span style={{fontSize:10,color:'var(--ink-soft)',width:30,textAlign:'right'}}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div style={cardHead}><h3 style={cardH3}>Conversion funnel</h3><span className="sub" style={{fontSize:11}}>health</span></div>
          <div style={{padding:'6px 14px'}}>
            {funnelSteps.map(s => {
              const pct = Math.round(s.count / funnelMax * 100);
              return (
                <div key={s.label} style={{display:'flex',alignItems:'center',gap:8,padding:'3px 0'}}>
                  <span style={{width:90,fontSize:11,color:'var(--ink-soft)'}}>{s.label}</span>
                  <div style={{flex:1,height:14,background:'var(--line)',borderRadius:3,overflow:'hidden'}}>
                    <div style={{width:pct+'%',height:'100%',background:s.color,borderRadius:3,opacity:0.8}} />
                  </div>
                  <span style={{width:28,fontWeight:600,fontSize:12,textAlign:'right'}}>{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <RecentNotices limit={3} />
    </div>
  );
}
