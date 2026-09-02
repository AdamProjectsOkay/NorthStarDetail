// booking.jsx
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\/^]/g, '\\$&') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

function BookingForm() {
  const [pkg, setPkg] = React.useState('Complete Detail');
  const [addons, setAddons] = React.useState({});
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('780-');
  const [vehicle, setVehicle] = React.useState('');
  const [city, setCity] = React.useState('Edmonton');
  const [notes, setNotes] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [submitErr, setSubmitErr] = React.useState('');
  const [click, setClick] = React.useState({ fbp: '', fbc: '' });

  React.useEffect(() => {
    const h = (e) => { if (e.detail) setPkg(e.detail); };
    window.addEventListener('ns-select-package', h);
    return () => window.removeEventListener('ns-select-package', h);
  }, []);

  // Meta's own click-identity cookies, forwarded to lead-submit.php so the
  // server-side CAPI Lead event can match the same click as the browser
  // Pixel. _fbc is normally set by fbevents.js, but an ad/tracker blocker
  // can prevent that script from ever running while leaving the fbclid URL
  // param (which isn't script-dependent) intact — so reconstruct it from
  // fbclid per Meta's documented format as a fallback.
  React.useEffect(() => {
    const fbp = getCookie('_fbp');
    let fbc = getCookie('_fbc');
    if (!fbc) {
      const fbclid = new URLSearchParams(location.search).get('fbclid');
      if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
    }
    setClick({ fbp, fbc });
  }, []);

  const packages = [
    {n:'Basic Wash', p:60},
    {n:'Deluxe Exterior', p:100},
    {n:'Premium Exterior', p:150},
    {n:'Interior Clean', p:100},
    {n:'Complete Detail', p:200},
    {n:'Premium Detail', p:270},
  ];
  const addonList = [
    {n:'Engine Bay Clean', p:40},
    {n:'Pet Hair Removal', p:30},
    {n:'Odor Removal', p:50},
    {n:'Headlight Restoration', p:60},
    {n:'Ceramic Coating', p:300},
  ];
  const pkgPrice = (packages.find(x => x.n === pkg) || {}).p || 0;
  const activeAddons = Object.entries(addons).filter(([,v]) => v).map(([k]) => k);
  const addonsSum = activeAddons.reduce((s, k) => s + (addonList.find(a => a.n === k)?.p || 0), 0);
  const total = pkgPrice + addonsSum;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setSubmitErr('');
    try {
      const attr = window.nsAttribution || {};
      // Shared with the server so the Pixel's browser-side Lead event and the
      // Conversions API's server-side Lead event dedup into a single event
      // in Meta instead of double-counting.
      const eventId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      const want = [notes.trim(), activeAddons.length ? `Add-ons: ${activeAddons.join(', ')}` : '']
        .filter(Boolean).join(' — ');
      const res = await fetch('lead-submit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          name, phone, email: '', want,
          vehicle, package: pkg, address: city,
          source: attr.source || '', event_id: eventId,
          fbp: click.fbp || '', fbc: click.fbc || '',
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        if (window.fbq) { window.fbq('track', 'Lead', {}, { eventID: eventId }); }
        setSubmitted(true);
      } else {
        setSubmitErr(j.error || 'Something went wrong. Please call/text us instead.');
      }
    } catch (err) {
      setSubmitErr('Network error — please check your connection or call/text us instead.');
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <section id="book" style={bookStyles.section}>
        <div style={{...bookStyles.inner, maxWidth:640, textAlign:'center'}}>
          <svg viewBox="0 0 24 24" width="56" height="56" style={{margin:'0 auto',display:'block'}}>
            <circle cx="12" cy="12" r="10" fill="none" stroke="#34D399" strokeWidth="2"/>
            <polyline points="8 12 11 15 16 9" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2 style={{...bookStyles.h2, marginTop:18}}>Booking request received.</h2>
          <p className="ns-p-lg" style={{maxWidth:460, margin:'12px auto 0'}}>
            Thanks, {name || 'friend'}. We'll call {phone} within 2 hours to confirm your {pkg} and pick a time that works.
          </p>
          <div style={{marginTop:26, fontFamily:'var(--ns-font-display)', fontWeight:700, fontSize:20, color:'var(--ns-ice)'}}>Estimated total: ${total}+</div>
        </div>
      </section>
    );
  }

  return (
    <section id="book" style={bookStyles.section}>
      <div style={bookStyles.inner}>
        <div style={{textAlign:'center', marginBottom:36}}>
          <div className="ns-label" style={{color:'var(--ns-ice)'}}>BOOK ONLINE</div>
          <h2 className="big-h2" style={bookStyles.h2}>Build your detail.</h2>
          <p className="ns-p-lg" style={{color:'var(--ns-fg-3)', marginTop:8, maxWidth:540, margin:'8px auto 0'}}>
            Pick a package, add extras, send it over. We'll call you back to lock in a time.
          </p>
        </div>

        <form onSubmit={onSubmit} style={bookStyles.form}>
          {/* Package selector */}
          <div style={bookStyles.field}>
            <label style={bookStyles.label}>1 · Choose a package</label>
            <div className="book-pkg-grid" style={bookStyles.pkgGrid}>
              {packages.map(p => {
                const active = pkg === p.n;
                return (
                  <button type="button" key={p.n} onClick={() => setPkg(p.n)}
                    style={{...bookStyles.pkgCard, ...(active ? bookStyles.pkgCardActive : {})}}>
                    <div style={bookStyles.pkgName}>{p.n}</div>
                    <div style={bookStyles.pkgPrice}>${p.p}+</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add-ons */}
          <div style={bookStyles.field}>
            <label style={bookStyles.label}>2 · Add-ons <span style={bookStyles.optional}>optional</span></label>
            <div className="book-addon-grid" style={bookStyles.addonGrid}>
              {addonList.map(a => {
                const on = !!addons[a.n];
                return (
                  <label key={a.n} style={{...bookStyles.addonRow, ...(on ? bookStyles.addonRowActive : {})}}>
                    <input type="checkbox" checked={on} onChange={e => setAddons({...addons, [a.n]: e.target.checked})} style={{accentColor:'#F7B500'}}/>
                    <span style={{flex:1, fontWeight:500}}>{a.n}</span>
                    <span style={{fontFamily:'var(--ns-font-display)', fontWeight:700, color: on ? 'var(--ns-signal)' : 'var(--ns-fg-3)'}}>+${a.p}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Your info */}
          <div style={bookStyles.field}>
            <label style={bookStyles.label}>3 · Your info</label>
            <div className="book-info-grid" style={bookStyles.infoGrid}>
              <InputRow label="Name" value={name} onChange={setName} placeholder="Full name" required/>
              <InputRow label="Phone" value={phone} onChange={setPhone} placeholder="780-000-0000" required/>
              <InputRow label="Vehicle" value={vehicle} onChange={setVehicle} placeholder="BMW X5, Ford F-150, etc."/>
              <SelectRow label="City" value={city} onChange={setCity} options={['Edmonton','Beaumont','Sherwood Park','Leduc','St. Albert']}/>
            </div>
            <div style={{marginTop:12}}>
              <TextareaRow label="Notes" value={notes} onChange={setNotes} placeholder="Pet hair, mud, specific concerns…"/>
            </div>
          </div>

          {/* Summary bar */}
          <div className="book-summary" style={bookStyles.summary}>
            <div>
              <div className="ns-eyebrow" style={{fontSize:14, color:'var(--ns-ice)'}}>Your detail</div>
              <div style={{fontFamily:'var(--ns-font-display)', fontWeight:700, fontSize:22, color:'#fff', marginTop:2}}>
                {pkg}{activeAddons.length > 0 ? ` + ${activeAddons.length} add-on${activeAddons.length>1?'s':''}` : ''}
              </div>
            </div>
            <div className="book-summary-right" style={{textAlign:'right'}}>
              <div className="ns-caption">Estimated total</div>
              <div style={{fontFamily:'var(--ns-font-display)', fontWeight:800, fontStyle:'italic', fontSize:38, color:'#fff'}}>${total}+</div>
            </div>
          </div>

          <button type="submit" className="ns-btn ns-btn-primary" disabled={sending} style={{width:'100%', justifyContent:'center', fontSize:18, padding:'18px 28px'}}>
            {sending ? 'Sending…' : 'Request Booking →'}
          </button>
          {submitErr && <div style={{color:'#F87171', fontSize:14, textAlign:'center'}}>{submitErr}</div>}
          <p className="ns-caption" style={{textAlign:'center', marginTop:12}}>
            We'll text or call within 2 hours (Mon–Sat) to confirm a time. No payment required now.
          </p>
        </form>
      </div>
    </section>
  );
}

function InputRow({label, value, onChange, placeholder, required}) {
  return (
    <div>
      <div style={bookStyles.sublabel}>{label}{required && <span style={{color:'var(--ns-signal)'}}> *</span>}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} style={bookStyles.input}/>
    </div>
  );
}
function SelectRow({label, value, onChange, options}) {
  return (
    <div>
      <div style={bookStyles.sublabel}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)} style={bookStyles.input}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
function TextareaRow({label, value, onChange, placeholder}) {
  return (
    <div>
      <div style={bookStyles.sublabel}>{label}</div>
      <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{...bookStyles.input, resize:'vertical', fontFamily:'var(--ns-font-body)'}}/>
    </div>
  );
}

const bookStyles = {
  section: { padding:'96px 0 96px', background:'linear-gradient(180deg, var(--ns-cosmic) 0%, var(--ns-midnight) 100%)' },
  inner: { maxWidth:820, margin:'0 auto', padding:'0 28px' },
  h2: { fontFamily:'var(--ns-font-display)', fontWeight:700, fontSize:56, lineHeight:1.05, letterSpacing:'-.02em', color:'#fff', margin:'6px 0 0' },
  form: { background:'rgba(11,29,61,0.6)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid var(--ns-border-strong)', borderRadius:20, padding:'28px 26px 26px', boxShadow:'var(--ns-glow-md)', display:'flex', flexDirection:'column', gap:22 },
  field: { display:'flex', flexDirection:'column', gap:10 },
  label: { fontFamily:'var(--ns-font-body)', fontWeight:700, fontSize:11, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--ns-ice)' },
  optional: { color:'var(--ns-silver-dim)', marginLeft:6, fontWeight:500, letterSpacing:'.08em' },
  sublabel: { fontFamily:'var(--ns-font-body)', fontWeight:600, fontSize:11, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ns-silver)', marginBottom:6 },
  input: { width:'100%', boxSizing:'border-box', background:'rgba(3,11,31,.6)', border:'1px solid var(--ns-border-strong)', borderRadius:8, padding:'12px 14px', fontFamily:'var(--ns-font-body)', color:'#fff', fontSize:15, outline:'none' },
  pkgGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 },
  pkgCard: { background:'rgba(3,11,31,.55)', border:'1px solid var(--ns-border)', borderRadius:10, padding:'14px 12px', color:'#fff', cursor:'pointer', textAlign:'left', transition:'all .18s cubic-bezier(.2,.8,.2,1)' },
  pkgCardActive: { background:'rgba(30,91,184,.2)', border:'1.5px solid var(--ns-signal)', boxShadow:'0 0 0 3px rgba(247,181,0,.15)' },
  pkgName: { fontFamily:'var(--ns-font-display)', fontWeight:700, fontSize:16, lineHeight:1.1 },
  pkgPrice: { fontFamily:'var(--ns-font-body)', fontSize:13, color:'var(--ns-ice)', marginTop:4, fontWeight:600 },
  addonGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 },
  addonRow: { display:'flex', alignItems:'center', gap:10, padding:'12px 14px', background:'rgba(3,11,31,.55)', border:'1px solid var(--ns-border)', borderRadius:10, cursor:'pointer', color:'#fff', fontFamily:'var(--ns-font-body)', fontSize:14, transition:'all .18s' },
  addonRowActive: { background:'rgba(247,181,0,.08)', border:'1px solid rgba(247,181,0,.4)' },
  infoGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  summary: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 20px', background:'rgba(3,11,31,.7)', border:'1px solid var(--ns-border-strong)', borderRadius:12, marginTop:8 },
};

window.BookingForm = BookingForm;
