/* crm-leaddetail.jsx — shared UI atoms + the lead detail drawer */

function Avatar({ user, size = 28 }) {
  if (!user) return (
    <div className="av" style={{ width: size, height: size, fontSize: size * 0.42, background: 'var(--panel-2)', color: 'var(--fg-3)' }}>?</div>
  );
  return (
    <div className="av" style={{ width: size, height: size, fontSize: size * 0.4, background: user.color }}>{user.initials}</div>
  );
}

function StagePill({ stage }) {
  const s = STAGE_MAP[stage];
  return (
    <span className="badge stage-pill" style={{ color: s.color, background: 'color-mix(in srgb, ' + s.color + ' 16%, transparent)', borderColor: 'color-mix(in srgb, ' + s.color + ' 32%, transparent)' }}>
      <span className="bd" style={{ background: s.color }}></span>{s.label}
    </span>
  );
}

function PackageChip({ package: pkg }) {
  if (!pkg || pkg === '—') return <span className="muted">—</span>;
  return <span className="pkg-chip">{pkg}</span>;
}

function ChannelTag({ ch }) {
  return ch === 'email'
    ? <span className="ch-tag"><IconMail /> Email</span>
    : <span className="ch-tag"><IconMsg /> Text</span>;
}

/* ---- Follow-up reminder helpers (shared with crm-app.jsx) ---- */
const FU_COLOR = { overdue: 'var(--red)', today: 'var(--amber)', upcoming: 'var(--blue)' };

function todayStr() { return new Date().toLocaleDateString('en-CA'); }   // YYYY-MM-DD, local

// null | 'overdue' | 'today' | 'upcoming'
function followUpStatus(lead) {
  const fu = lead && lead.followUp;
  if (!fu || !fu.date) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(fu.date + 'T00:00:00');
  const days = Math.round((due - today) / 86400000);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  return 'upcoming';
}

function fmtFollowUp(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}
function fmtFollowUpLong(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
}
function followUpLabel(lead) {
  const fu = lead && lead.followUp;
  if (!fu || !fu.date) return '';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(fu.date + 'T00:00:00');
  const days = Math.round((due - today) / 86400000);
  if (days < -1) return 'Overdue · ' + fmtFollowUp(fu.date);
  if (days === -1) return 'Overdue · yesterday';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return 'Due ' + fmtFollowUp(fu.date);
}

// Small bell pill shown on cards/rows when a reminder is set
function FollowUpBadge({ lead }) {
  const st = followUpStatus(lead);
  if (!st) return null;
  const col = FU_COLOR[st];
  return (
    <span className={'fu-badge fu-' + st}
          title={lead.followUp.note ? 'Follow-up: ' + lead.followUp.note : 'Follow-up reminder'}
          style={{ color: col, background: 'color-mix(in srgb, ' + col + ' 14%, transparent)', borderColor: 'color-mix(in srgb, ' + col + ' 30%, transparent)' }}>
      <IconBell sw={2} />{followUpLabel(lead)}
    </span>
  );
}

function LeadDrawer({ lead, currentUser, onClose, onUpdate, onDelete, onToast }) {
  const [tab, setTab] = React.useState('conversation');
  const [channel, setChannel] = React.useState('sms');
  const [draft, setDraft] = React.useState('');
  const [note, setNote] = React.useState('');
  const [confirmDel, setConfirmDel] = React.useState(false);
  const [fuDate, setFuDate] = React.useState('');
  const [fuNote, setFuNote] = React.useState('');
  const bodyRef = React.useRef(null);

  React.useEffect(() => {
    setTab('conversation'); setDraft(''); setNote(''); setConfirmDel(false);
    setFuDate(lead.followUp ? lead.followUp.date : '');
    setFuNote(lead.followUp ? (lead.followUp.note || '') : '');
  }, [lead.id]);
  React.useEffect(() => {
    if (bodyRef.current && tab === 'conversation') bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lead.thread.length, tab]);

  const send = () => {
    if (!draft.trim()) return;
    onUpdate(lead.id, { addMsg: { dir: 'out', ch: channel, time: 'Just now', text: draft.trim() } });
    setDraft('');
    onToast((channel === 'email' ? 'Email' : 'Text') + ' sent to ' + lead.name.split(' ')[0]);
  };
  const addNote = () => {
    if (!note.trim()) return;
    onUpdate(lead.id, { addNote: { by: currentUser.id, time: 'Just now', text: note.trim() } });
    setNote('');
    onToast('Note added');
  };
  const logCall = (outcome) => {
    onUpdate(lead.id, { addNote: { by: currentUser.id, time: 'Just now', text: '📞 Logged call — ' + outcome } });
    onToast('Call logged: ' + outcome);
  };

  const saveFollowUp = () => {
    if (!fuDate) return;
    onUpdate(lead.id, { followUp: { date: fuDate, note: fuNote.trim() } });
    onToast('Reminder set for ' + fmtFollowUp(fuDate));
  };
  const clearFollowUp = () => {
    onUpdate(lead.id, { followUp: null });
    setFuDate(''); setFuNote('');
    onToast('Reminder cleared');
  };

  const saveField = (field, value) => {
    if (String(value) === String(lead[field])) return;
    onUpdate(lead.id, { fields: { [field]: value } });
    onToast('Saved');
  };

  const initials = lead.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const leadAvatar = { initials, color: STAGE_MAP[lead.stage].color.startsWith('var') ? '#2A2E36' : STAGE_MAP[lead.stage].color };

  return (
    <React.Fragment>
      <div className="drawer-scrim" onClick={onClose}></div>
      <aside className="drawer">
        <div className="dr-head">
          <div className="dr-top">
            <Avatar user={leadAvatar} size={42} />
            <div>
              <div className="dr-id">{lead.id} · {lead.source}</div>
              <h2>{lead.name}</h2>
            </div>
            {confirmDel ? (
              <div className="dr-del-row">
                <span>Delete lead?</span>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(lead.id)}>Delete</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(false)}>Cancel</button>
              </div>
            ) : (
              <React.Fragment>
                <button className={'dr-bell' + (followUpStatus(lead) ? ' on fu-' + followUpStatus(lead) : '')}
                        onClick={() => setTab('followup')} title="Follow-up reminder"><IconBell /></button>
                <button className="dr-del" onClick={() => setConfirmDel(true)} title="Delete lead"><IconTrash /></button>
              </React.Fragment>
            )}
            <button className="dr-close" onClick={onClose}><IconX /></button>
          </div>
          <div className="dr-contacts">
            <a href={'sms:' + lead.phone}><IconMsg /> {lead.phone}</a>
            <a href={'tel:' + lead.phone}><IconPhone /> Call</a>
            <a href={'mailto:' + lead.email}><IconMail /> {lead.email}</a>
          </div>
        </div>

        <div className="dr-controls" style={{ gridTemplateColumns: '1fr' }}>
          <div className="ctrl">
            <label>Stage</label>
            <div className="sel">
              <select value={lead.stage} onChange={(e) => { onUpdate(lead.id, { stage: e.target.value }); onToast('Moved to ' + STAGE_MAP[e.target.value].label); }}>
                {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <IconChevDown />
            </div>
          </div>
        </div>

        <div className="dr-facts">
          <div className="fact">
            <div className="fl">Vehicle</div>
            <input key={lead.id + 'v'} className="fv fv-edit" defaultValue={lead.vehicle}
                   onBlur={(e) => saveField('vehicle', e.target.value.trim())} />
          </div>
          <div className="fact">
            <div className="fl">Service package</div>
            <input key={lead.id + 'p'} className="fv fv-edit" defaultValue={lead.package}
                   onBlur={(e) => saveField('package', e.target.value.trim())} />
          </div>
          <div className="fact">
            <div className="fl">Preferred date</div>
            <input key={lead.id + 'd'} className="fv fv-edit mono" defaultValue={lead.preferredDate}
                   onBlur={(e) => saveField('preferredDate', e.target.value.trim())} />
          </div>
          <div className="fact">
            <div className="fl">Service address</div>
            <input key={lead.id + 'a'} className="fv fv-edit" defaultValue={lead.address}
                   onBlur={(e) => saveField('address', e.target.value.trim())} />
          </div>
          <div className="fact fact-span">
            <div className="fl">Source</div>
            <input key={lead.id + 's'} className="fv fv-edit" defaultValue={lead.source}
                   onBlur={(e) => saveField('source', e.target.value.trim())} />
          </div>
        </div>

        <div className="dr-tabs">
          <button className={'dr-tab ' + (tab === 'conversation' ? 'active' : '')} onClick={() => setTab('conversation')}>Conversation</button>
          <button className={'dr-tab ' + (tab === 'notes' ? 'active' : '')} onClick={() => setTab('notes')}>Notes {lead.notes.length > 0 && <span className="mono" style={{ opacity: .6 }}>{lead.notes.length}</span>}</button>
          <button className={'dr-tab ' + (tab === 'followup' ? 'active' : '')} onClick={() => setTab('followup')}>
            Follow-up {followUpStatus(lead) && <span className="fu-dot" style={{ background: FU_COLOR[followUpStatus(lead)] }}></span>}
          </button>
        </div>

        {tab === 'conversation' && (
          <React.Fragment>
            <div className="dr-body" ref={bodyRef}>
              <div className="thread">
                {lead.thread.map((m, i) => (
                  <div className={'msg ' + m.dir} key={i}>
                    <div className="bub">{m.text}</div>
                    <div className="mt"><ChannelTag ch={m.ch} /> · {m.time}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="composer2">
              <div className="ch-toggle">
                <button className={channel === 'sms' ? 'on' : ''} onClick={() => setChannel('sms')}><IconMsg /> Text</button>
                <button className={channel === 'email' ? 'on' : ''} onClick={() => setChannel('email')}><IconMail /> Email</button>
              </div>
              <div className="comp-input">
                <textarea value={draft} placeholder={channel === 'email' ? 'Write an email to ' + lead.name.split(' ')[0] + '…' : 'Text ' + lead.name.split(' ')[0] + '…'}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
                <button className="comp-send" onClick={send} disabled={!draft.trim()}><IconSend /></button>
              </div>
            </div>
          </React.Fragment>
        )}

        {tab === 'notes' && (
          <div className="dr-body">
            <div className="logrow">
              <button className="btn btn-ghost btn-sm" onClick={() => logCall('Connected')}><IconPhone /> Call: connected</button>
              <button className="btn btn-ghost btn-sm" onClick={() => logCall('No answer')}><IconPhone /> No answer</button>
              <button className="btn btn-ghost btn-sm" onClick={() => logCall('Appointment booked')}><IconCal /> Booked appt</button>
            </div>
            {lead.notes.length === 0 && <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>No notes yet. Add the first one below.</div>}
            {lead.notes.slice().reverse().map((n, i) => {
              const u = USER_MAP[n.by];
              return (
                <div className="note" key={i}>
                  <div className="nh">
                    <Avatar user={u} size={20} />
                    <span className="nm">{u ? u.name : 'Staff'}</span>
                    <span className="nt">{n.time}</span>
                  </div>
                  <p>{n.text}</p>
                </div>
              );
            })}
            <div className="note-add">
              <input value={note} placeholder="Add an internal note…" onChange={(e) => setNote(e.target.value)}
                     onKeyDown={(e) => { if (e.key === 'Enter') addNote(); }} />
              <button className="btn btn-primary btn-sm" onClick={addNote}><IconPlus /> Add</button>
            </div>
          </div>
        )}

        {tab === 'followup' && (
          <div className="dr-body">
            {followUpStatus(lead) ? (
              <div className={'fu-status fu-' + followUpStatus(lead)}>
                <IconBell sw={2} />
                <div>
                  <div className="fu-status-main">{followUpLabel(lead)}</div>
                  <div className="fu-status-sub">Reminder set for {fmtFollowUpLong(lead.followUp.date)}</div>
                </div>
              </div>
            ) : (
              <div className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
                No follow-up reminder yet. Pick a date and this lead jumps to the top of your list with a bell so you don’t forget to circle back.
              </div>
            )}

            <label className="fu-field-lbl">Remind me on</label>
            <input type="date" className="fu-date" value={fuDate} min={todayStr()} onChange={(e) => setFuDate(e.target.value)} />

            <label className="fu-field-lbl" style={{ marginTop: 14 }}>Why are you following up?</label>
            <textarea className="fu-note" value={fuNote} onChange={(e) => setFuNote(e.target.value)}
                      placeholder="e.g. Waiting to confirm a time — call back about the ceramic coating add-on, or checking if they still want Saturday…" />

            <div className="fu-actions">
              <button className="btn btn-primary btn-sm" onClick={saveFollowUp} disabled={!fuDate}>
                <IconBell sw={2} /> {lead.followUp ? 'Update reminder' : 'Set reminder'}
              </button>
              {lead.followUp && <button className="btn btn-ghost btn-sm" onClick={clearFollowUp}>Clear reminder</button>}
            </div>
          </div>
        )}
      </aside>
    </React.Fragment>
  );
}

Object.assign(window, { Avatar, StagePill, PackageChip, ChannelTag, LeadDrawer });
