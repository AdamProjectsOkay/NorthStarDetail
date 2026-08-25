/* app.jsx — header, hero + lead form, mount */

const PHONE = { pretty: "(780) 555-0100", raw: "+17805550100" };
const HEADLINE = "Professional detailing.\nWe come to you.";

// Read a cookie by name (used for Meta's _fbp/_fbc click-tracking cookies).
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\/^]/g, '\\$&') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

function Field({ id, label, type, value, placeholder, onChange, error, ...rest }) {
  return (
    <div className={`field ${error ? 'invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type || 'text'} value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)} {...rest} />
      {error && <div className="err">{error}</div>}
    </div>
  );
}

function LeadForm() {
  const [data, setData] = React.useState({ name: '', phone: '', email: '', want: '' });
  const [errors, setErrors] = React.useState({});
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [submitErr, setSubmitErr] = React.useState('');
  const [click, setClick] = React.useState({ fbp: '', fbc: '' });
  const set = (k) => (v) => { setData((d) => ({ ...d, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); setSubmitErr(''); };

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

  const validate = () => {
    const e = {};
    if (!data.name.trim()) e.name = "Tell us your name";
    const digits = data.phone.replace(/\D/g, '');
    if (digits.length < 10) e.phone = "Enter a valid phone number";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);
    setSubmitErr('');
    try {
      const attr = window.nsAttribution || {};
      // Shared with the server so the Pixel's browser-side Lead event and the
      // Conversions API's server-side Lead event dedup into a single event
      // in Meta instead of double-counting.
      const eventId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      const res = await fetch('lead-submit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          name: data.name, phone: data.phone, email: data.email, want: data.want,
          source: attr.source || '', event_id: eventId,
          fbp: click.fbp || '', fbc: click.fbc || '',
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        if (window.fbq) { window.fbq('track', 'Lead', {}, { eventID: eventId }); }   // Meta conversion event
        setSent(true);
      } else {
        setSubmitErr(j.error || 'Something went wrong. Please text us instead.');
      }
    } catch (err) {
      setSubmitErr('Network error — please check your connection or text us instead.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="composer" id="lead">
        <div className="sent">
          <div className="check"><IconCheck sw={3} /></div>
          <h3>You're all set, {data.name.split(' ')[0]}!</h3>
          <p>We'll text you at <span className="num">{data.phone}</span></p>
          <p>usually within a few minutes. Keep an eye on your messages 👀</p>
          <button className="btn btn-ghost reset" onClick={() => { setSent(false); setData({ name: '', phone: '', email: '', want: '' }); }}>Start another</button>
        </div>
      </div>
    );
  }

  return (
    <form className="composer" id="lead" onSubmit={submit} noValidate>
      <div className="composer-head">
        <div className="ico"><IconMsg /></div>
        <div>
          <h3>Get a text back</h3>
          <p>No calls. No pressure. Real answers.</p>
        </div>
      </div>
      <Field id="name" label="Your name" value={data.name} placeholder="Your Name" onChange={set('name')} error={errors.name} autoComplete="name" />
      <div className="field-row">
        <Field id="phone" label="Mobile number" type="tel" value={data.phone} placeholder="(780) 000-0000" onChange={set('phone')} error={errors.phone} autoComplete="tel" />
        <Field id="email" label="Email" type="email" value={data.email} placeholder="you@email.com" onChange={set('email')} error={errors.email} autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="want">What do you need? <span style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>(optional)</span></label>
        <textarea id="want" value={data.want} placeholder="e.g. Full detail on my 2020 Civic, ASAP if possible" onChange={(e) => set('want')(e.target.value)}></textarea>
      </div>
      <input type="hidden" name="fbp" value={click.fbp} readOnly />
      <input type="hidden" name="fbc" value={click.fbc} readOnly />
      <button type="submit" className="btn btn-primary" disabled={sending}><IconSend sw={2.2} /> {sending ? 'Sending…' : 'Text me back'}</button>
      {submitErr && <div className="err" style={{ marginTop: 10 }}>{submitErr}</div>}
      <p className="fineprint">By texting you agree to receive messages from NorthStar Auto Detailing. Msg rates may apply.</p>
    </form>
  );
}

function Hero() {
  const lines = HEADLINE.split('\n');
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <div className="eyebrow"><span className="pulse"></span> Edmonton & Beaumont · Mobile Detailing</div>
          <h1 className="hero-h">
            {lines.map((ln, i) => {
              const m = ln.match(/^(.*?)(We come to you\.?)(.*)$/i);
              return (
                <React.Fragment key={i}>
                  {m
                    ? <span>{m[1]}<span className="hl">{m[2]}</span>{m[3]}</span>
                    : ln}
                  {i < lines.length - 1 && <br />}
                </React.Fragment>
              );
            })}
          </h1>
          <p className="hero-sub">Book your interior, exterior, or full detail entirely by <strong>text or email</strong>. We bring the equipment to your driveway — <strong>ceramic coating and paint correction</strong> available too.</p>
          <LeadForm />
          <div className="chips">
            <span className="chip"><IconTruck sw={2} /> We come to you</span>
            <span className="chip"><IconShield sw={2} /> Fully insured</span>
            <span className="chip"><IconCheck sw={2} /> Satisfaction guaranteed</span>
          </div>
        </div>
        <PhoneChat show={true} />
      </div>
    </section>
  );
}

function Header({ onJump }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', f, { passive: true }); f();
    return () => window.removeEventListener('scroll', f);
  }, []);
  return (
    <header className={`hdr ${scrolled ? 'scrolled' : ''}`}>
      <div className="wrap hdr-in">
        <div className="brand"><span className="mark"><IconSpark sw={2} style={{ width: 18, height: 18 }} /></span>NorthStar<span className="brand-accent"> Detailing</span></div>
        <div className="hdr-cta">
          <a className="hdr-phone" href={`sms:${PHONE.raw}`}><IconMsg sw={2} /> {PHONE.pretty}</a>
          <button className="btn btn-primary btn-sm" onClick={onJump}><IconSend sw={2.2} /> Text me back</button>
        </div>
      </div>
    </header>
  );
}

function App() {
  useReveal();

  // Fade out the branded boot splash once the app has mounted.
  React.useEffect(() => {
    const s = document.getElementById('boot');
    if (s) { s.classList.add('boot-hide'); setTimeout(() => s.remove(), 450); }
  }, []);

  const jump = () => {
    const el = document.getElementById('lead');
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
      const inp = el.querySelector('input');
      if (inp) setTimeout(() => inp.focus({ preventScroll: true }), 500);
    }
  };

  return (
    <React.Fragment>
      <Header onJump={jump} />
      <main>
        <Hero />
        <BeforeAfterGallery onJump={jump} />
        <HowItWorks />
        <TrustStrip />
        <FinalCTA onJump={jump} phoneDisplay={PHONE} />
      </main>
      <Footer phoneDisplay={PHONE} />
      <StickyBar phoneDisplay={PHONE} onJump={jump} />
      <AdminGate />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
