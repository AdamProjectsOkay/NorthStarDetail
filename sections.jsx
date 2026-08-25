/* sections.jsx — how-it-works, before/after gallery, trust strip, final CTA, footer, sticky bar */

function useReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.14 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

function HowItWorks() {
  const steps = [
    { n: "01", Ico: IconMsg,   h: "Tell us what you need", p: "Send your name and number — or just text us. Tell us your vehicle and what you're after. No forms-from-hell, no waiting on hold.", tag: "60-second start", },
    { n: "02", Ico: IconCal,   h: "We quote & schedule you", p: "All packages available, all vehicles. We confirm your package — plus ceramic coating or paint correction add-ons — and lock in a time that works.", tag: "Fast quotes", },
    { n: "03", Ico: IconTruck, h: "We detail it at your door", p: "We bring the water, power, and gear and come to you — driveway, garage, or parking lot. Sit back while we make it shine.", tag: "Mobile service", },
  ];
  return (
    <section className="section" id="how">
      <div className="wrap">
        <div className="reveal">
          <div className="sec-label">How it works</div>
          <h2 className="sec-h">Three texts from “it needs work” to “it's spotless.”</h2>
          <p className="sec-intro">No drop-off, no waiting room. The whole thing happens in the one app you already check 100 times a day.</p>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <div className="step reveal" style={{ transitionDelay: `${i * 90}ms` }} key={s.n}>
              <div className="step-ico"><s.Ico /></div>
              <div className="num">{s.n}</div>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
              <div className="tag"><IconCheck sw={2.4} style={{ width: 14, height: 14 }} /> {s.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeforeAfterGallery({ onJump }) {
  const railRef = React.useRef(null);
  const scrollTimer = React.useRef(null);
  const items = [
    { id: 'g1', caption: 'Full Detail — Sedan', from: '#B8BCC4', to: '#6D7280' },
    { id: 'g2', caption: 'Ceramic Coating — SUV', from: '#A9B1BD', to: '#5B6270' },
    { id: 'g3', caption: 'Interior Detail — Truck', from: '#BEC2C9', to: '#71767F' },
    { id: 'g4', caption: 'Paint Correction — Hatchback', from: '#B3B8C0', to: '#646B78' },
  ];
  const ev = (kind, meta) => { if (window.nsTrackEvent) window.nsTrackEvent(kind, meta); };

  // Count a "scroll" interaction once per gesture (debounced) so a single
  // swipe/drag isn't logged as dozens of scroll events.
  const onScroll = () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => { ev('gallery_scroll', 'swipe'); scrollTimer.current = null; }, 500);
  };

  const nudge = (dir) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: 'smooth' });
    ev('gallery_scroll', 'arrow');
  };

  return (
    <section className="section gallery-sec" id="gallery">
      <div className="wrap">
        <div className="reveal">
          <div className="sec-label">Recent work</div>
          <h2 className="sec-h">See the difference, before and after.</h2>
          <p className="sec-intro">A few recent transformations. Tap any one to book your own — all vehicle types welcome.</p>
        </div>
        <div className="carousel reveal">
          <button className="carousel-arrow left" type="button" aria-label="Scroll left" onClick={() => nudge(-1)}><IconArrow /></button>
          <div className="carousel-rail" ref={railRef} onScroll={onScroll}>
            {items.map((it) => (
              <button className="gallery-card" key={it.id} type="button"
                      onClick={() => { ev('gallery_click', it.id); onJump(); }}>
                <div className="ba-split">
                  <div className="ba-half ba-before" style={{ background: `linear-gradient(135deg, ${it.from}, ${it.to})` }}>
                    <span className="ba-tag">Before</span>
                  </div>
                  <div className="ba-half ba-after">
                    <span className="ba-tag ba-tag-after">After</span>
                  </div>
                </div>
                <div className="gallery-caption">{it.caption}</div>
                <span className="gallery-cta"><IconCal sw={2} /> Book this</span>
              </button>
            ))}
          </div>
          <button className="carousel-arrow right" type="button" aria-label="Scroll right" onClick={() => nudge(1)}><IconArrow /></button>
        </div>
        <p className="gallery-note">Photos above are placeholders — swap in real before/after shots once you have them.</p>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { Ico: IconTruck,  b: "Mobile & fully equipped", s: "We bring water, power, and all the gear right to your driveway." },
    { Ico: IconCar,    b: "All vehicle types",        s: "Cars, trucks, SUVs, vans — we detail them all." },
    { Ico: IconSpark,  b: "Ceramic coating available",s: "Long-lasting shine and protection, done on-site." },
    { Ico: IconRepeat, b: "Paint correction",         s: "Swirl marks and light scratches buffed out by hand." },
    { Ico: IconCheck,  b: "Satisfaction guaranteed",  s: "Not happy? We'll make it right." },
    { Ico: IconClock,  b: "Flexible scheduling",      s: "Evenings and weekends available, usually booked within days." },
  ];
  return (
    <section className="section" style={{ paddingTop: 8 }}>
      <div className="wrap">
        <div className="trust reveal">
          <div className="trust-grid">
            <div>
              <h2>Built for busy people, <span className="hl">not showroom visits.</span></h2>
              <p>We've detailed vehicles for people who don't have time to sit in a waiting room. Tell us what you need by text — straight answers, real scheduling.</p>
            </div>
            <div className="trust-list">
              {items.map((it) => (
                <div className="trust-item" key={it.b}>
                  <div className="tcheck"><it.Ico /></div>
                  <div><b>{it.b}</b><span>{it.s}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onJump, phoneDisplay }) {
  return (
    <section className="finalcta">
      <div className="wrap reveal">
        <h2>Skip the drop-off.<br/>Just text us.</h2>
        <p>Tell us your vehicle and we'll text you back with a quote in minutes.</p>
        <div className="actions">
          <button className="btn btn-primary" onClick={onJump}><IconMsg sw={2} /> Get my text back</button>
          <a className="btn btn-ghost" href={`sms:${phoneDisplay.raw}`}><IconSend sw={2} /> Text <span style={{ fontFamily: 'var(--font-mono)' }}>{phoneDisplay.pretty}</span></a>
        </div>
      </div>
    </section>
  );
}

function Footer({ phoneDisplay }) {
  // Mobile equivalent of the Ctrl+4 4 4 staff shortcut: tap the footer
  // logo 5 times within ~1.6s to open the CRM login.
  const tapRef = React.useRef({ n: 0, t: null });
  const secretTap = () => {
    const s = tapRef.current;
    s.n += 1;
    clearTimeout(s.t);
    s.t = setTimeout(() => { s.n = 0; }, 1600);
    if (s.n >= 5) { s.n = 0; window.location.href = 'login.php'; }
  };
  return (
    <footer className="ftr">
      <div className="wrap ftr-in">
        <div className="brand" onClick={secretTap} style={{ WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}><span className="mark"><IconSpark sw={2} style={{ width: 18, height: 18 }} /></span>NorthStar<span className="brand-accent"> Detailing</span></div>
        <div>Serving Edmonton & Beaumont, AB · <span style={{ fontFamily: 'var(--font-mono)' }}>{phoneDisplay.pretty}</span></div>
        <div>© 2026 NorthStar Auto Detailing · Mobile service, by appointment.</div>
      </div>
    </footer>
  );
}

function StickyBar({ phoneDisplay, onJump }) {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className={`sticky-bar ${show ? 'show' : ''}`}>
      <div className="sticky-in">
        <div className="txt"><b>Skip the drop-off — text us</b><span className="num">{phoneDisplay.pretty}</span></div>
        <button className="btn btn-primary btn-sm" onClick={onJump}><IconMsg sw={2.2} style={{ width: 16, height: 16 }} /> Get my text back</button>
      </div>
    </div>
  );
}

Object.assign(window, { useReveal, HowItWorks, BeforeAfterGallery, TrustStrip, FinalCTA, Footer, StickyBar });
