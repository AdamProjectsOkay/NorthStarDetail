/* crm-app.jsx — NorthStar CRM main app */

// Capture JS errors and unhandled promise rejections into localStorage for the Debug page
(function() {
  const save = (entry) => {
    try {
      const list = JSON.parse(localStorage.getItem('ns_debug_errors') || '[]');
      list.push(entry);
      if (list.length > 300) list.splice(0, list.length - 300);
      localStorage.setItem('ns_debug_errors', JSON.stringify(list));
    } catch(e) {}
  };
  window.addEventListener('error', (e) => {
    save({ ts: Date.now(), type: 'error', message: e.message || String(e.error || e), source: e.filename || '', lineno: e.lineno, colno: e.colno, stack: e.error ? e.error.stack : '' });
  });
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason;
    save({ ts: Date.now(), type: 'rejection', message: r instanceof Error ? r.message : String(r), source: '', stack: r instanceof Error ? r.stack : '' });
  });
})();

const COLUMNS = [
  { key: 'name',    label: 'Lead',          sortable: true,  acc: (l) => l.name.toLowerCase() },
  { key: 'contact', label: 'Contact',       sortable: false },
  { key: 'vehicle', label: 'Vehicle',       sortable: true,  acc: (l) => l.vehicle.toLowerCase() },
  { key: 'package', label: 'Package',       sortable: true,  acc: (l) => l.package.toLowerCase() },
  { key: 'date',    label: 'Preferred date',sortable: true,  acc: (l) => l.preferredDate.toLowerCase() },
  { key: 'stage',   label: 'Stage',         sortable: true,  acc: (l) => STAGES.findIndex((s) => s.key === l.stage) },
  { key: 'source',  label: 'Source',        sortable: true,  acc: (l) => l.source.toLowerCase() },
  { key: 'lastAtt', label: 'Last attempt',  sortable: false },
  { key: 'lastRes', label: 'Last response', sortable: false },
];

const FEED_ICONS = { msg: <IconMsg />, spark: <IconSpark />, check: <IconCheck />, note: <IconNote />, call: <IconPhone />, truck: <IconTruck /> };

// Float due/overdue follow-up reminders to the top of any list (stable otherwise)
const FU_BUMP = { overdue: 0, today: 1 };
function bumpFollowUps(list) {
  const rank = (l) => { const s = followUpStatus(l); return s in FU_BUMP ? FU_BUMP[s] : 2; };
  return [...list].sort((a, b) => rank(a) - rank(b));
}

function KPIs({ leads }) {
  const weekAgo = Date.now() - 7 * 86400000;
  const active = leads.filter((l) => l.stage !== 'completed' && l.stage !== 'dead').length;
  const needs = leads.filter((l) => l.stage === 'new' || l.lastResponse === 'No reply').length;
  const scheduled = leads.filter((l) => l.stage === 'scheduled').length;
  const completed = leads.filter((l) => l.stage === 'completed').length;
  const newThisWeek = leads.filter((l) => l.ts * 1000 >= weekAgo || l.ts >= weekAgo).length;
  const cards = [
    { val: active,      label: 'Active leads',    ico: <IconUsers />, color: 'var(--blue)' },
    { val: needs,       label: 'Needs response',  ico: <IconBolt />,  color: 'var(--amber)' },
    { val: scheduled,   label: 'Scheduled',       ico: <IconCal />,   color: 'var(--accent)' },
    { val: completed,   label: 'Completed',       ico: <IconCheck />, color: 'var(--teal)' },
    { val: newThisWeek, label: 'New this week',   ico: <IconSpark />, color: 'var(--violet)' },
  ];
  return (
    <div className="kpis">
      {cards.map((c) => (
        <div className="kpi" key={c.label}>
          <div className="k-ico" style={{ background: 'color-mix(in srgb, ' + c.color + ' 16%, transparent)', color: c.color }}>{c.ico}</div>
          <div className="k-val">{c.val}</div>
          <div className="k-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function Funnel({ leads, stageFilter, onPick }) {
  const counts = STAGES.map((s) => leads.filter((l) => l.stage === s.key).length);
  const max = Math.max(1, ...counts);
  return (
    <div className="card">
      <div className="card-head">
        <h3>Stage activity</h3>
        <span className="hint">{stageFilter ? 'Filtering · click to clear' : 'Click a stage to filter'}</span>
      </div>
      <div className="funnel">
        {STAGES.map((s, i) => (
          <div className="fn-row" key={s.key} onClick={() => onPick(stageFilter === s.key ? null : s.key)}
               style={{ opacity: stageFilter && stageFilter !== s.key ? 0.45 : 1 }}>
            <div className="fn-name"><span className="fn-dot" style={{ background: s.color }}></span>{s.label}</div>
            <div className="fn-bar"><span style={{ width: (counts[i] / max * 100) + '%', background: s.color }}></span></div>
            <div className="fn-num">{counts[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Feed() {
  return (
    <div className="card">
      <div className="card-head"><h3>Recent activity</h3><span className="hint">Live</span></div>
      <div className="feed">
        {ACTIVITY.map((a, i) => {
          const u = a.who ? USER_MAP[a.who] : null;
          return (
            <div className="feed-item" key={i}>
              <div className="feed-ico">{FEED_ICONS[a.icon]}</div>
              <div className="feed-txt">
                <span className="who">{u ? u.name : 'System'}</span> <span>{a.text}</span>
                {a.detail && <span className="det"> · {a.detail}</span>}
              </div>
              <div className="feed-time">{a.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PipelineBoard({ leads, onOpen, onUpdate, onToast }) {
  const [dragging, setDragging] = React.useState(null);
  const [over, setOver] = React.useState(null);

  const onDragStart = (e, id) => {
    setDragging(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e, stageKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (over !== stageKey) setOver(stageKey);
  };

  const onDrop = (e, stageKey) => {
    e.preventDefault();
    if (dragging) {
      const lead = leads.find((l) => l.id === dragging);
      if (lead && lead.stage !== stageKey) {
        onUpdate(dragging, { stage: stageKey });
        onToast('Moved to ' + STAGE_MAP[stageKey].label);
      }
    }
    setDragging(null);
    setOver(null);
  };

  const onDragEnd = () => { setDragging(null); setOver(null); };

  return (
    <div className="pipeline">
      {STAGES.map((s) => {
        const colLeads = bumpFollowUps(leads.filter((l) => l.stage === s.key));
        return (
          <div key={s.key}
               className={'pl-col' + (over === s.key ? ' over' : '')}
               onDragOver={(e) => onDragOver(e, s.key)}
               onDrop={(e) => onDrop(e, s.key)}
               onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(null); }}>
            <div className="pl-col-head">
              <div className="pl-col-title">
                <span style={{ width: 10, height: 10, borderRadius: 4, background: s.color, display: 'inline-block', flexShrink: 0 }}></span>
                {s.label}
                <span className="pl-cnt">{colLeads.length}</span>
              </div>
            </div>
            <div className="pl-col-body">
              {colLeads.map((lead) => (
                <div key={lead.id}
                     className={'pl-card' + (dragging === lead.id ? ' dragging' : '')
                       + (followUpStatus(lead) === 'overdue' || followUpStatus(lead) === 'today' ? ' fu-card-due' : '')}
                     draggable
                     onDragStart={(e) => onDragStart(e, lead.id)}
                     onDragEnd={onDragEnd}
                     onClick={() => onOpen(lead.id)}>
                  <div className="pl-card-top">
                    <div className="pl-name">{lead.name}</div>
                    <div className="pl-id">{lead.id}</div>
                  </div>
                  {followUpStatus(lead) && <div className="pl-fu"><FollowUpBadge lead={lead} /></div>}
                  <div className="pl-vehicle">{lead.vehicle}</div>
                  <div className="pl-meta">
                    <PackageChip package={lead.package} />
                    {lead.preferredDate !== '—' && <span className="mono" style={{ fontSize: 12 }}>{lead.preferredDate}</span>}
                  </div>
                  <div className="pl-card-foot">
                    <span className="pl-time">{lead.lastAttempt === '—' ? lead.createdAt : lead.lastAttempt}</span>
                  </div>
                </div>
              ))}
              {colLeads.length === 0 && <div className="pl-empty">Drop leads here</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeadsTable({ leads, sort, onSort, onOpen }) {
  return (
    <div className="table-wrap">
      <table className="leads">
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <th key={c.key} className={sort.key === c.key ? 'sorted' : ''}
                  style={{ cursor: c.sortable ? 'pointer' : 'default' }}
                  onClick={() => c.sortable && onSort(c.key)}>
                <span className="th-in">{c.label}{c.sortable && <IconSort />}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => {
            return (
              <tr key={l.id} onClick={() => onOpen(l.id)}
                  className={followUpStatus(l) === 'overdue' || followUpStatus(l) === 'today' ? 'fu-row-due' : ''}>
                <td><div className="lead-name">{l.name}</div><div className="lead-id">{l.id}</div>{followUpStatus(l) && <FollowUpBadge lead={l} />}</td>
                <td><div className="cell-contact"><span className="ph">{l.phone}</span><span className="em">{l.email}</span></div></td>
                <td>{l.vehicle}</td>
                <td><PackageChip package={l.package} /></td>
                <td><span className="mono">{l.preferredDate}</span></td>
                <td><StagePill stage={l.stage} /></td>
                <td><span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{l.source}</span></td>
                <td><span className="muted">{l.lastAttempt}</span></td>
                <td><span className={l.lastResponse === 'No reply' ? 'mono' : 'muted'} style={{ fontSize: 12.5 }}>{l.lastResponse}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {leads.length === 0 && <div className="empty"><IconSearch /><div>No leads match this view.</div></div>}
    </div>
  );
}

function UserMenu({ current, onSignOut }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const close = () => setOpen(false);
    if (open) { document.addEventListener('click', close); return () => document.removeEventListener('click', close); }
  }, [open]);
  return (
    <div className="usermenu" onClick={(e) => e.stopPropagation()}>
      <button className="userbtn" onClick={() => setOpen(!open)}>
        <Avatar user={current} size={28} />
        <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
          <div className="nm">{current.name}</div>
          <div className="rl">{current.title}</div>
        </div>
        <IconChevDown />
      </button>
      {open && (
        <div className="dropdown">
          <div className="dd-label">Signed in</div>
          <div className="dd-item" style={{ cursor: 'default' }}>
            <Avatar user={current} size={24} />
            <span>NorthStar staff</span>
          </div>
          <div className="dd-sep"></div>
          <button className="dd-item" onClick={onSignOut}><IconLogout /> Sign out</button>
        </div>
      )}
    </div>
  );
}

function AnalyticsPage() {
  const [range, setRange] = React.useState('today');
  const [visits, setVisits] = React.useState([]);
  const [events, setEvents] = React.useState([]);
  const [spinning, setSpinning] = React.useState(false);
  const [subTab, setSubTab] = React.useState('overview');
  const [trafficGran, setTrafficGran] = React.useState('day');
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const [geoCache, setGeoCache] = React.useState({});
  const geoCacheRef = React.useRef({});
  const [excluded, setExcluded] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ns_excluded_vids') || '[]')); }
    catch(e) { return new Set(); }
  });

  const toggleExclude = (vid) => {
    if (!vid) return;
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(vid)) next.delete(vid); else next.add(vid);
      localStorage.setItem('ns_excluded_vids', JSON.stringify([...next]));
      return next;
    });
  };

  const load = () => {
    fetch('/track-visits.php')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) { setVisits(data); return; }
        try { const raw = JSON.parse(localStorage.getItem('ns_visits') || '[]'); setVisits(Array.isArray(raw) ? raw : []); } catch(e) { setVisits([]); }
      })
      .catch(() => {
        try { const raw = JSON.parse(localStorage.getItem('ns_visits') || '[]'); setVisits(Array.isArray(raw) ? raw : []); } catch(e) { setVisits([]); }
      });
    fetch('/track-events.php')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setEvents(Array.isArray(data) ? data : []); })
      .catch(() => { setEvents([]); });
  };

  React.useEffect(load, []);

  React.useEffect(() => {
    const ips = [...new Set(visits.map((v) => v.ip).filter(Boolean))];
    ips.forEach((ip) => {
      if (ip in geoCacheRef.current) return;
      geoCacheRef.current[ip] = null;
      fetch('/geo-lookup.php?ip=' + encodeURIComponent(ip))
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          const loc = (data && data.status === 'success')
            ? [data.city, data.regionName, data.country].filter(Boolean).join(', ')
            : '—';
          geoCacheRef.current[ip] = loc;
          setGeoCache((prev) => ({ ...prev, [ip]: loc }));
        })
        .catch(() => { geoCacheRef.current[ip] = '—'; setGeoCache((prev) => ({ ...prev, [ip]: '—' })); });
    });
  }, [visits]);

  const cleanVisits = visits.filter((v) => !excluded.has(v.vid) && !v.crm);

  const now = Date.now();
  const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0,0,0,0); return d.getTime(); };
  const cutoff = range === 'today' ? startOfDay(now)
    : range === '7d'  ? now - 7  * 86400000
    : range === '30d' ? now - 30 * 86400000
    : 0;

  const filtered = cleanVisits.filter((v) => v.ts >= cutoff);
  const totalVisits = filtered.length;
  const withDur = filtered.filter((v) => v.duration > 0);
  const avgDur = withDur.length ? Math.round(withDur.reduce((s, v) => s + Math.min(v.duration, 600), 0) / withDur.length) : 0;
  const fmtDur = (s) => s >= 60 ? Math.floor(s / 60) + 'm ' + (s % 60) + 's' : s + 's';

  const srcMap = {};
  filtered.forEach((v) => { const s = v.source || 'Direct'; srcMap[s] = (srcMap[s] || 0) + 1; });
  const sources = Object.entries(srcMap).sort((a, b) => b[1] - a[1]);

  const campMap = {};
  filtered.forEach((v) => { if (v.campaign) campMap[v.campaign] = (campMap[v.campaign] || 0) + 1; });
  const campaigns = Object.entries(campMap).sort((a, b) => b[1] - a[1]);

  // Before/after gallery interaction events — same exclusions + range as visits.
  const cleanEvents = events.filter((e) => !excluded.has(e.vid) && !e.crm);
  const evFiltered = cleanEvents.filter((e) => e.ts >= cutoff);
  const galClicks  = evFiltered.filter((e) => e.kind === 'gallery_click').length;
  const galScrolls = evFiltered.filter((e) => e.kind === 'gallery_scroll').length;
  const galImgMap = {};
  evFiltered.forEach((e) => { if (e.kind === 'gallery_click') { const k = e.meta || '—'; galImgMap[k] = (galImgMap[k] || 0) + 1; } });
  const galImgs = Object.entries(galImgMap).sort((a, b) => b[1] - a[1]);

  const days = range === 'today' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const dayBuckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - (days - 1 - i));
    return {
      ts: d.getTime(), count: 0,
      label: days <= 7
        ? d.toLocaleDateString('en-CA', { weekday: 'short' })
        : d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
    };
  });
  filtered.forEach((v) => {
    const d = new Date(v.ts); d.setHours(0,0,0,0);
    const b = dayBuckets.find((x) => x.ts === d.getTime());
    if (b) b.count++;
  });
  const maxCount = Math.max(1, ...dayBuckets.map((b) => b.count));

  // visitor list grouped by vid (all-time)
  const visitorMap = {};
  visits.forEach((v) => {
    const key = v.vid || v.id;
    if (!visitorMap[key]) {
      visitorMap[key] = { vid: v.vid, ip: v.ip || '', firstTs: v.ts, lastTs: v.ts, count: 0, source: v.source || 'Direct' };
    }
    visitorMap[key].count++;
    if (v.ts < visitorMap[key].firstTs) visitorMap[key].firstTs = v.ts;
    if (v.ts > visitorMap[key].lastTs) {
      visitorMap[key].lastTs = v.ts;
      if (v.ip) visitorMap[key].ip = v.ip;
      if (v.source) visitorMap[key].source = v.source;
    }
  });
  const visitors = Object.values(visitorMap).sort((a, b) => b.lastTs - a.lastTs);

  // Traffic tab: daily visitor counts, bucketed by chosen granularity
  const buildTrafficBuckets = (gran) => {
    const out = [];
    if (gran === 'month') {
      const base = new Date(); base.setHours(0, 0, 0, 0);
      for (let i = 11; i >= 0; i--) {
        const start = new Date(base.getFullYear(), base.getMonth() - i, 1).getTime();
        const end   = new Date(base.getFullYear(), base.getMonth() - i + 1, 1).getTime();
        out.push({ start, end, count: 0, label: new Date(start).toLocaleDateString('en-CA', { month: 'short' }) });
      }
    } else if (gran === 'week') {
      const base = new Date(); base.setHours(0, 0, 0, 0);
      for (let i = 11; i >= 0; i--) {
        const start = base.getTime() - i * 7 * 86400000;
        out.push({ start, end: start + 7 * 86400000, count: 0, label: new Date(start).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) });
      }
    } else {
      const base = new Date(); base.setHours(0, 0, 0, 0);
      for (let i = 29; i >= 0; i--) {
        const start = base.getTime() - i * 86400000;
        out.push({ start, end: start + 86400000, count: 0, label: new Date(start).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) });
      }
    }
    return out;
  };
  const trafficBuckets = buildTrafficBuckets(trafficGran);
  cleanVisits.forEach((v) => {
    const b = trafficBuckets.find((x) => v.ts >= x.start && v.ts < x.end);
    if (b) b.count++;
  });
  const trafficMax = Math.max(1, ...trafficBuckets.map((b) => b.count));
  const trafficTotal = trafficBuckets.reduce((s, b) => s + b.count, 0);

  const TRAFFIC_GRAN = [
    { key: 'day',   label: 'Daily'   },
    { key: 'week',  label: 'Weekly'  },
    { key: 'month', label: 'Monthly' },
  ];

  const fmtTs = (ts) => {
    if (!ts) return '—';
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return new Date(ts).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  };

  const RANGE_OPTS = [
    { key: 'today', label: 'Today' },
    { key: '7d',   label: '7 days' },
    { key: '30d',  label: '30 days' },
    { key: 'all',  label: 'All time' },
  ];

  const barColor = (src) => {
    if (src === 'Facebook' || src === 'Instagram') return 'var(--blue)';
    if (src === 'Google') return 'var(--amber)';
    if (src === 'TikTok') return 'var(--red)';
    if (src === 'Direct') return 'var(--accent)';
    return 'var(--violet)';
  };

  return (
    <React.Fragment>
      <div className="page-head">
        <div>
          <h1>Analytics</h1>
          <div className="sub">Landing page · northstarautodetailing.ca</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            title="Refresh"
            onClick={() => { setSpinning(true); load(); setTimeout(() => setSpinning(false), 600); }}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid var(--line)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--fg)', display: 'flex', alignItems: 'center' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.6s ease', transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)' }}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
          {subTab === 'overview' && (
            <div className="tabs" style={{ marginBottom: 0 }}>
              {RANGE_OPTS.map((o) => (
                <button key={o.key} className={'tab' + (range === o.key ? ' active' : '')} onClick={() => setRange(o.key)}>{o.label}</button>
              ))}
            </div>
          )}
          {subTab === 'traffic' && (
            <div className="tabs" style={{ marginBottom: 0 }}>
              {TRAFFIC_GRAN.map((o) => (
                <button key={o.key} className={'tab' + (trafficGran === o.key ? ' active' : '')} onClick={() => setTrafficGran(o.key)}>{o.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={'tab' + (subTab === 'overview' ? ' active' : '')} onClick={() => setSubTab('overview')}>Overview</button>
        <button className={'tab' + (subTab === 'visitors' ? ' active' : '')} onClick={() => setSubTab('visitors')}>
          Visitors <span className="cnt">{visitors.filter((v) => !excluded.has(v.vid)).length}</span>
          {excluded.size > 0 && <span className="cnt" style={{ background: 'rgba(224,83,61,0.15)', color: 'var(--red)', marginLeft: 3 }}>{excluded.size} excl.</span>}
        </button>
        <button className={'tab' + (subTab === 'traffic' ? ' active' : '')} onClick={() => setSubTab('traffic')}>Traffic</button>
      </div>

      {subTab === 'overview' && (
        <React.Fragment>
          <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 18 }}>
            {[
              { val: totalVisits,                           label: 'Page visits',       ico: <IconUsers />, color: 'var(--blue)'   },
              { val: avgDur ? fmtDur(avgDur) : '—',        label: 'Avg. time on page', ico: <IconBolt />,  color: 'var(--amber)'  },
              { val: sources[0]   ? sources[0][0]   : '—', label: 'Top source',        ico: <IconRepeat />, color: 'var(--accent)' },
              { val: campaigns[0] ? campaigns[0][0] : '—', label: 'Top campaign',      ico: <IconTag />,   color: 'var(--violet)' },
            ].map((c) => (
              <div className="kpi" key={c.label}>
                <div className="k-ico" style={{ background: 'color-mix(in srgb,' + c.color + ' 16%, transparent)', color: c.color }}>{c.ico}</div>
                <div className="k-val" style={{ fontSize: String(c.val).length > 7 ? 16 : undefined, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.val}</div>
                <div className="k-label">{c.label}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-head"><h3>Visits over time</h3><span className="hint">{totalVisits} in range</span></div>
            {cleanVisits.length === 0 ? (
              <div className="empty"><IconSearch /><div>No visits recorded yet — tracker is live on the landing page.</div></div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: days > 30 ? 2 : 5, height: 110, padding: '0 4px 28px' }}>
                {dayBuckets.map((b, i) => {
                  const showLabel = days <= 14 || i % Math.ceil(days / 8) === 0;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 3, height: '100%', position: 'relative' }}>
                      {b.count > 0 && <span style={{ fontSize: 9, color: 'var(--fg-3)' }}>{b.count}</span>}
                      <div style={{ width: '100%', height: Math.max(b.count > 0 ? 3 : 0, Math.round((b.count / maxCount) * 66)) + 'px', background: b.count ? 'var(--accent)' : 'rgba(255,255,255,0.05)', borderRadius: '3px 3px 0 0', transition: 'height .3s' }} />
                      {showLabel && <span style={{ position: 'absolute', bottom: -22, fontSize: 9, color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>{b.label}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="dash-row">
            <div className="card">
              <div className="card-head"><h3>Traffic sources</h3><span className="hint">{sources.length} source{sources.length !== 1 ? 's' : ''}</span></div>
              {sources.length === 0 ? (
                <div className="empty" style={{ padding: '28px 0' }}><IconSearch /><div>No data yet.</div></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 2px' }}>
                  {sources.map(([src, cnt]) => (
                    <div key={src}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                        <span style={{ fontWeight: 600, color: 'var(--fg)' }}>{src}</span>
                        <span style={{ color: 'var(--fg-3)' }}>{cnt} · {totalVisits ? Math.round(cnt / totalVisits * 100) : 0}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'var(--line)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: (totalVisits ? cnt / totalVisits * 100 : 0) + '%', background: barColor(src), borderRadius: 3, transition: 'width .4s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-head"><h3>Campaigns</h3><span className="hint">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</span></div>
              {campaigns.length === 0 ? (
                <div className="empty" style={{ padding: '28px 0' }}><IconSearch /><div>Add <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--panel-2)', padding: '2px 5px', borderRadius: 4 }}>?utm_campaign=name</span> to your ad links.</div></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 2px' }}>
                  {campaigns.map(([camp, cnt]) => (
                    <div key={camp}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                        <span style={{ fontWeight: 600, color: 'var(--fg)' }}>{camp}</span>
                        <span style={{ color: 'var(--fg-3)' }}>{cnt} · {totalVisits ? Math.round(cnt / totalVisits * 100) : 0}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'var(--line)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: (totalVisits ? cnt / totalVisits * 100 : 0) + '%', background: 'var(--violet)', borderRadius: 3, transition: 'width .4s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <div className="card-head">
              <h3>Before/after gallery</h3>
              <span className="hint">Recent-work photos · taps scroll to the lead form</span>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: galImgs.length ? 18 : 0 }}>
              {[
                { val: galClicks,  label: 'Photo taps → book', color: 'var(--accent)' },
                { val: galScrolls, label: 'Scroll interactions',  color: 'var(--blue)'   },
                { val: (galClicks + galScrolls) ? Math.round(galClicks / (galClicks + galScrolls) * 100) + '%' : '—', label: 'Tap-through rate', color: 'var(--violet)' },
              ].map((s) => (
                <div key={s.label} style={{ flex: '1 1 120px', background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.val}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {galImgs.length === 0 ? (
              <div className="empty" style={{ padding: '20px 0' }}><IconSearch /><div>No gallery interactions in this range yet.</div></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 2px' }}>
                {galImgs.map(([img, cnt]) => (
                  <div key={img}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: 'var(--fg)' }}>{img.toUpperCase()}</span>
                      <span style={{ color: 'var(--fg-3)' }}>{cnt} tap{cnt !== 1 ? 's' : ''} · {galClicks ? Math.round(cnt / galClicks * 100) : 0}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--line)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: (galClicks ? cnt / galClicks * 100 : 0) + '%', background: 'var(--accent)', borderRadius: 3, transition: 'width .4s' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </React.Fragment>
      )}

      {subTab === 'visitors' && (
        <div className="table-wrap">
          {visitors.length === 0 ? (
            <div className="empty"><IconSearch /><div>No visitors recorded yet.</div></div>
          ) : (
            <table className="leads">
              <thead>
                <tr>
                  <th style={{ cursor: 'default' }}><span className="th-in">Status</span></th>
                  <th style={{ cursor: 'default' }}><span className="th-in">IP</span></th>
                  <th style={{ cursor: 'default' }}><span className="th-in">Location</span></th>
                  <th style={{ cursor: 'default' }}><span className="th-in">Visits</span></th>
                  <th style={{ cursor: 'default' }}><span className="th-in">Last seen</span></th>
                  <th style={{ cursor: 'default' }}><span className="th-in">First seen</span></th>
                  <th style={{ cursor: 'default' }}><span className="th-in">Source</span></th>
                  <th style={{ cursor: 'default' }}></th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((vis, i) => {
                  const isExcluded = excluded.has(vis.vid);
                  const returning = vis.count > 1;
                  const loc = vis.ip ? (vis.ip in geoCache ? geoCache[vis.ip] || '…' : '…') : '—';
                  return (
                    <tr key={i} style={{ cursor: 'default', opacity: isExcluded ? 0.42 : 1 }}>
                      <td>
                        {isExcluded ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'rgba(224,83,61,0.12)', color: 'var(--red)', whiteSpace: 'nowrap' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
                            Excluded
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: returning ? 'rgba(91,141,239,0.14)' : 'rgba(47,111,237,0.14)', color: returning ? 'var(--blue)' : 'var(--accent)', whiteSpace: 'nowrap' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
                            {returning ? 'Returning' : 'New'}
                          </span>
                        )}
                      </td>
                      <td><span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{vis.ip || '—'}</span></td>
                      <td><span style={{ fontSize: 13, color: loc !== '—' && loc !== '…' ? 'var(--fg)' : 'var(--fg-3)' }}>{loc}</span></td>
                      <td><span className="mono" style={{ fontWeight: 700 }}>{vis.count}</span></td>
                      <td><span className="muted">{fmtTs(vis.lastTs)}</span></td>
                      <td><span className="muted">{fmtTs(vis.firstTs)}</span></td>
                      <td><span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{vis.source || 'Direct'}</span></td>
                      <td>
                        {vis.vid && (
                          <button onClick={() => toggleExclude(vis.vid)} style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 7, border: '1px solid var(--line)', background: 'transparent', color: isExcluded ? 'var(--accent)' : 'var(--fg-3)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {isExcluded ? 'Include' : 'Exclude'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {subTab === 'traffic' && (
        <div className="card">
          <div className="card-head">
            <h3>Daily visitors</h3>
            <span className="hint">{trafficTotal} visit{trafficTotal !== 1 ? 's' : ''} · {TRAFFIC_GRAN.find((g) => g.key === trafficGran).label.toLowerCase()}</span>
          </div>
          {trafficTotal === 0 ? (
            <div className="empty"><IconSearch /><div>No visits in this period yet.</div></div>
          ) : (() => {
            const W = 820, H = 240, padL = 34, padR = 12, padT = 16, padB = 26;
            const n = trafficBuckets.length;
            const xAt = (i) => padL + (n <= 1 ? (W - padL - padR) / 2 : (i / (n - 1)) * (W - padL - padR));
            const yAt = (c) => H - padB - (c / trafficMax) * (H - padT - padB);
            const linePts = trafficBuckets.map((b, i) => xAt(i) + ',' + yAt(b.count)).join(' ');
            const areaPath = 'M ' + xAt(0) + ',' + (H - padB) + ' '
              + trafficBuckets.map((b, i) => 'L ' + xAt(i) + ',' + yAt(b.count)).join(' ')
              + ' L ' + xAt(n - 1) + ',' + (H - padB) + ' Z';
            const gridLines = 4;
            const labelEvery = Math.ceil(n / 12);
            return (
              <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" style={{ display: 'block', overflow: 'visible' }}>
                {Array.from({ length: gridLines + 1 }, (_, g) => {
                  const val = Math.round((trafficMax * (gridLines - g)) / gridLines);
                  const y = yAt(val);
                  return (
                    <g key={g}>
                      <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="var(--line)" strokeWidth="1" />
                      <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="10" fill="var(--fg-3)">{val}</text>
                    </g>
                  );
                })}
                <path d={areaPath} fill="var(--accent)" opacity="0.12" />
                <polyline points={linePts} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {trafficBuckets.map((b, i) => (
                  <g key={i}>
                    <circle cx={xAt(i)} cy={yAt(b.count)} r={b.count > 0 ? 3 : 0} fill="var(--accent)" />
                    {(i % labelEvery === 0 || i === n - 1) && (
                      <text x={xAt(i)} y={H - padB + 16} textAnchor="middle" fontSize="10" fill="var(--fg-3)">{b.label}</text>
                    )}
                  </g>
                ))}
                {hoverIdx !== null && hoverIdx < n && (() => {
                  const b = trafficBuckets[hoverIdx];
                  const cx = xAt(hoverIdx), cy = yAt(b.count);
                  const txt = b.count + ' visit' + (b.count !== 1 ? 's' : '') + ' · ' + b.label;
                  const tw = txt.length * 5.6 + 16;
                  const tx = Math.max(padL, Math.min(W - padR - tw, cx - tw / 2));
                  const ty = Math.max(padT - 10, cy - 34);
                  return (
                    <g style={{ pointerEvents: 'none' }}>
                      <line x1={cx} y1={padT} x2={cx} y2={H - padB} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                      <circle cx={cx} cy={cy} r="4.5" fill="var(--accent)" stroke="var(--panel)" strokeWidth="2" />
                      <rect x={tx} y={ty} width={tw} height="24" rx="6" fill="var(--panel-2)" stroke="var(--line)" strokeWidth="1" />
                      <text x={tx + tw / 2} y={ty + 16} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--fg)">{txt}</text>
                    </g>
                  );
                })()}
                {trafficBuckets.map((b, i) => (
                  <rect key={'h' + i} x={xAt(i) - (W - padL - padR) / (2 * Math.max(1, n - 1))} y={padT} width={(W - padL - padR) / Math.max(1, n - 1)} height={H - padT - padB} fill="transparent" style={{ cursor: 'crosshair' }} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} />
                ))}
              </svg>
            );
          })()}
        </div>
      )}
    </React.Fragment>
  );
}

function DebugPage() {
  const [errors, setErrors] = React.useState([]);
  const [expanded, setExpanded] = React.useState({});

  const load = () => {
    try { setErrors(JSON.parse(localStorage.getItem('ns_debug_errors') || '[]')); }
    catch(e) { setErrors([]); }
  };

  React.useEffect(load, []);

  const clear = () => { localStorage.removeItem('ns_debug_errors'); setErrors([]); };
  const toggle = (ts) => setExpanded((p) => ({ ...p, [ts]: !p[ts] }));
  const fmtTs = (ts) => new Date(ts).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const list = [...errors].reverse();

  return (
    <React.Fragment>
      <div className="page-head">
        <div>
          <h1>Debug</h1>
          <div className="sub">Runtime errors · {errors.length} event{errors.length !== 1 ? 's' : ''} captured</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={load}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
          {errors.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={clear}><IconTrash /> Clear all</button>
          )}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty" style={{ paddingTop: 80 }}>
          <IconBug style={{ width: 38, height: 38, marginBottom: 14, opacity: 0.4 }} />
          <div>No errors captured — all good!</div>
          <div style={{ fontSize: 12, marginTop: 6, color: 'var(--fg-3)' }}>JS runtime errors and unhandled promise rejections will appear here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((err) => {
            const isErr = err.type !== 'rejection';
            const col = isErr ? 'var(--red)' : 'var(--amber)';
            const bg  = isErr ? 'rgba(224,83,61,0.12)' : 'rgba(242,179,61,0.12)';
            const hasStack = !!err.stack;
            return (
              <div key={err.ts} className="card" style={{ padding: '14px 16px', cursor: hasStack ? 'pointer' : 'default' }}
                   onClick={() => hasStack && toggle(err.ts)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: bg, color: col, whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1 }}>
                    {isErr ? 'ERROR' : 'PROMISE'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, marginBottom: 3, wordBreak: 'break-all', color: 'var(--fg)' }}>{err.message || 'Unknown error'}</div>
                    {err.source && (
                      <div style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>
                        {err.source}{err.lineno ? ':' + err.lineno : ''}{err.colno ? ':' + err.colno : ''}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 10.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtTs(err.ts)}</span>
                  {hasStack && <IconChevDown style={{ flexShrink: 0, color: 'var(--fg-3)', width: 14, height: 14, transform: expanded[err.ts] ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}
                </div>
                {expanded[err.ts] && (
                  <pre style={{ margin: '12px 0 0', padding: '12px', background: 'var(--bg)', borderRadius: 8, fontSize: 11, color: 'var(--fg-2)', fontFamily: 'var(--font-mono)', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6 }}>{err.stack}</pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </React.Fragment>
  );
}

function NewLeadModal({ onClose, onSave }) {
  const [f, setF] = React.useState({
    name: '', phone: '', email: '', vehicle: '', package: '',
    preferredDate: '', address: '', source: '', stage: 'new',
  });
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState('');
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (saving) return;
    if (!f.name.trim() && !f.phone.trim() && !f.email.trim()) {
      setErr('Enter a name, phone, or email.');
      return;
    }
    setErr('');
    setSaving(true);
    onSave({ ...f }).catch((ex) => { setErr(ex.message || 'Could not save lead'); setSaving(false); });
  };

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <React.Fragment>
      <div className="drawer-scrim" onClick={onClose}></div>
      <div className="nl-modal" role="dialog" aria-modal="true">
        <div className="nl-head">
          <h2><IconPlus /> New lead</h2>
          <button className="dr-close" onClick={onClose}><IconX /></button>
        </div>
        <form className="nl-body" onSubmit={submit}>
          <div className="nl-grid">
            <div className="nl-field nl-span">
              <label>Name</label>
              <input className="nl-input" value={f.name} onChange={set('name')} placeholder="Customer name" autoFocus />
            </div>
            <div className="nl-field">
              <label>Phone</label>
              <input className="nl-input" value={f.phone} onChange={set('phone')} placeholder="(000) 000-0000" type="tel" />
            </div>
            <div className="nl-field">
              <label>Email</label>
              <input className="nl-input" value={f.email} onChange={set('email')} placeholder="name@email.com" type="email" />
            </div>
            <div className="nl-field">
              <label>Vehicle</label>
              <input className="nl-input" value={f.vehicle} onChange={set('vehicle')} placeholder="e.g. 2020 Civic" />
            </div>
            <div className="nl-field">
              <label>Service package</label>
              <input className="nl-input" value={f.package} onChange={set('package')} placeholder="e.g. Full Detail" />
            </div>
            <div className="nl-field">
              <label>Preferred date</label>
              <input className="nl-input" value={f.preferredDate} onChange={set('preferredDate')} placeholder="e.g. Sept 6 or ASAP" />
            </div>
            <div className="nl-field">
              <label>Service address</label>
              <input className="nl-input" value={f.address} onChange={set('address')} placeholder="Where we'll detail it" />
            </div>
            <div className="nl-field">
              <label>Source</label>
              <input className="nl-input" value={f.source} onChange={set('source')} placeholder="Manual entry" />
            </div>
            <div className="nl-field">
              <label>Stage</label>
              <div className="nl-sel">
                <select value={f.stage} onChange={set('stage')}>
                  {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <IconChevDown />
              </div>
            </div>
          </div>
          {err && <div className="nl-err">{err}</div>}
          <div className="nl-foot">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Add lead'}</button>
          </div>
        </form>
      </div>
    </React.Fragment>
  );
}

function App() {
  const [leads, setLeads] = React.useState([]);
  const [page, setPage] = React.useState('dashboard');
  const [stageFilter, setStageFilter] = React.useState(null);
  const [sort, setSortState] = React.useState({ key: null, dir: 'asc' });
  const [openId, setOpenId] = React.useState(null);
  const [q, setQ] = React.useState('');
  const [showNew, setShowNew] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [seenIds, setSeenIds] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ns_seen_leads') || '[]')); }
    catch(e) { return new Set(); }
  });

  const current = USER_MAP['owner'];

  const fireToast = (msg) => { setToast(msg); clearTimeout(window.__t); window.__t = setTimeout(() => setToast(null), 2400); };

  React.useEffect(() => {
    if (!openId) return;
    setSeenIds((prev) => {
      if (prev.has(openId)) return prev;
      const next = new Set(prev);
      next.add(openId);
      localStorage.setItem('ns_seen_leads', JSON.stringify([...next]));
      return next;
    });
  }, [openId]);

  const newLeadCount = leads.filter((l) => !seenIds.has(l.id)).length;

  const loadLeads = () => {
    fetch('crm-leads.php', { credentials: 'same-origin' })
      .then((r) => { if (r.status === 401) { window.location.href = 'login.php'; return null; } return r.json(); })
      .then((j) => {
        if (!j || !j.ok) return;
        LEADS.splice(0, LEADS.length, ...j.leads);
        ACTIVITY.splice(0, ACTIVITY.length, ...j.activity);
        setLeads([...j.leads]);
      })
      .catch(() => {});
  };

  React.useEffect(() => {
    loadLeads();
    const id = setInterval(loadLeads, 30000);
    const onFocus = () => loadLeads();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(id); window.removeEventListener('focus', onFocus); };
  }, []);

  const updateLead = (id, patch) => {
    setLeads((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const n = { ...l };
      if (patch.stage) n.stage = patch.stage;
      if ('followUp' in patch) n.followUp = patch.followUp;
      if ('assigned' in patch) n.assigned = patch.assigned;
      if (patch.addMsg) { n.thread = [...l.thread, patch.addMsg]; n.lastAttempt = 'Just now'; }
      if (patch.addNote) n.notes = [...l.notes, patch.addNote];
      if (patch.fields) Object.assign(n, patch.fields);
      return n;
    }));

    const params = new URLSearchParams({ id });
    if (patch.stage)        { params.append('action', 'stage');   params.append('stage', patch.stage); }
    else if (patch.addMsg)  { params.append('action', 'message'); params.append('text', patch.addMsg.text); params.append('ch', patch.addMsg.ch); }
    else if (patch.addNote) { params.append('action', 'note');    params.append('text', patch.addNote.text); }
    else if (patch.fields)  { params.append('action', 'fields');  Object.entries(patch.fields).forEach(([k, v]) => params.append(k, String(v))); }
    else if ('followUp' in patch) { params.append('action', 'followup'); params.append('date', patch.followUp ? patch.followUp.date : ''); params.append('note', patch.followUp ? (patch.followUp.note || '') : ''); }
    else return;

    fetch('lead-update.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
      .then((r) => { if (r.status === 401) { window.location.href = 'login.php'; return null; } return r.json(); })
      .then((j) => { if (j && !j.ok) throw new Error(j.error || 'save failed'); })
      .catch(() => { fireToast('Save failed — refreshing'); loadLeads(); });
  };

  const deleteLead = (id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setOpenId(null);
    fireToast('Lead deleted');
    fetch('lead-update.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id, action: 'delete' }),
    })
      .then((r) => { if (r.status === 401) { window.location.href = 'login.php'; return null; } return r.json(); })
      .then((j) => { if (j && !j.ok) throw new Error(j.error || 'delete failed'); })
      .catch(() => { fireToast("Couldn't delete — refreshing"); loadLeads(); });
  };

  const addLead = (fields) => {
    return fetch('lead-add.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fields),
    })
      .then((r) => { if (r.status === 401) { window.location.href = 'login.php'; return null; } return r.json(); })
      .then((j) => {
        if (!j || !j.ok) throw new Error(j && j.error ? j.error : 'Could not save lead');
        if (j.lead) {
          LEADS.unshift(j.lead);
          setLeads((prev) => [j.lead, ...prev]);
        }
        setShowNew(false);
        fireToast('Lead added · ' + (j.lead ? j.lead.name || j.id : j.id));
      });
  };

  const onSort = (key) => setSortState((s) => s.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : { key: null, dir: 'asc' }) : { key, dir: 'asc' });

  // table set: all leads + stage + search + sort
  let rows = leads;
  if (stageFilter) rows = rows.filter((l) => l.stage === stageFilter);
  if (q.trim()) {
    const t = q.toLowerCase();
    rows = rows.filter((l) => (l.name + l.id + l.phone + l.email + l.vehicle).toLowerCase().includes(t));
  }
  if (sort.key) {
    const col = COLUMNS.find((c) => c.key === sort.key);
    rows = [...rows].sort((a, b) => {
      const av = col.acc(a), bv = col.acc(b);
      const r = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === 'asc' ? r : -r;
    });
  }
  // due/overdue follow-ups always float to the top as reminders
  rows = bumpFollowUps(rows);

  const openLead = openId ? leads.find((l) => l.id === openId) : null;
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpenId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sb-brand"><span className="mk"><IconSpark sw={2} /></span>NorthStar<span className="pill">CRM</span></div>
        <nav className="sb-nav">
          <button className={'sb-link ' + (page === 'dashboard' ? 'active' : '')} onClick={() => setPage('dashboard')}><IconGrid /> Dashboard</button>
          <button className={'sb-link ' + (page === 'leads' ? 'active' : '')} onClick={() => setPage('leads')}><IconList /> Leads{newLeadCount > 0 && <span className="sb-badge">{newLeadCount}</span>}</button>
          <button className={'sb-link ' + (page === 'pipeline' ? 'active' : '')} onClick={() => setPage('pipeline')}><IconRepeat /> Pipeline</button>
          <button className={'sb-link ' + (page === 'analytics' ? 'active' : '')} onClick={() => setPage('analytics')}><IconBolt /> Reports</button>
          <button className={'sb-link ' + (page === 'debug' ? 'active' : '')} onClick={() => setPage('debug')}><IconBug /> Debug</button>
        </nav>
        <div className="sb-foot">
          <button className="sb-link" onClick={() => fireToast('Settings — coming soon')}><IconShield /> Settings</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="search">
            <IconSearch />
            <input placeholder="Search leads by name, phone, email, vehicle…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="topbar-right">
            <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}><IconPlus /> New lead</button>
            <UserMenu current={current} onSignOut={() => { window.location.href = '/logout.php'; }} />
          </div>
        </header>

        <div className="content">
          {page === 'dashboard' && (
            <React.Fragment>
              <div className="page-head">
                <div>
                  <h1>Dashboard</h1>
                  <div className="sub">Lead activity · {new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>
              <KPIs leads={leads} />
              <div className="dash-row"><Funnel leads={leads} stageFilter={stageFilter} onPick={setStageFilter} /><Feed /></div>
            </React.Fragment>
          )}
          {page === 'leads' && (
            <div className="page-head">
              <div>
                <h1>Leads</h1>
                <div className="sub">{rows.length} of {leads.length} shown{stageFilter ? ' · ' + STAGE_MAP[stageFilter].label : ''}</div>
              </div>
            </div>
          )}

          {page === 'pipeline' && (
            <React.Fragment>
              <div className="page-head">
                <div>
                  <h1>Pipeline</h1>
                  <div className="sub">{leads.length} leads · drag cards to advance stages</div>
                </div>
              </div>
              <PipelineBoard leads={leads} onOpen={setOpenId} onUpdate={updateLead} onToast={fireToast} />
            </React.Fragment>
          )}

          {page === 'analytics' && <AnalyticsPage />}
          {page === 'debug' && <DebugPage />}

          {page !== 'pipeline' && page !== 'analytics' && page !== 'debug' && (
            <React.Fragment>
              <div className="tabs">
                <button className={'tab ' + (!stageFilter ? 'active' : '')} onClick={() => setStageFilter(null)}>All leads <span className="cnt">{leads.length}</span></button>
                {STAGES.map((s) => (
                  <button key={s.key} className={'tab ' + (stageFilter === s.key ? 'active' : '')} onClick={() => setStageFilter(stageFilter === s.key ? null : s.key)}>
                    <span className="fn-dot" style={{ width: 8, height: 8, borderRadius: 3, background: s.color }}></span> {s.label} <span className="cnt">{leads.filter((l) => l.stage === s.key).length}</span>
                  </button>
                ))}
              </div>
              <LeadsTable leads={rows} sort={sort} onSort={onSort} onOpen={setOpenId} />
            </React.Fragment>
          )}
        </div>
      </div>

      {openLead && <LeadDrawer lead={openLead} currentUser={current} onClose={() => setOpenId(null)} onUpdate={updateLead} onDelete={deleteLead} onToast={fireToast} />}
      {showNew && <NewLeadModal onClose={() => setShowNew(false)} onSave={addLead} />}
      {toast && <div className="toast"><IconCheck sw={2.4} /> {toast}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
