// service-area.jsx
function MobileServiceBand() {
  // Hidden CRM entry: tap "We come to you." 4 times in a row (mobile-friendly
  // alternative to the Ctrl+4,4,4 desktop shortcut in admin.jsx).
  const tapRef = React.useRef({ n: 0, timer: null });
  const onHeadlineTap = () => {
    const s = tapRef.current;
    s.n += 1;
    clearTimeout(s.timer);
    s.timer = setTimeout(() => { s.n = 0; }, 1400);
    if (s.n >= 4) { s.n = 0; window.location.href = 'login.php'; }
  };
  return (
    <section id="area" style={msStyles.section}>
      <div className="ms-inner" style={msStyles.inner}>
        <div>
          <div className="ns-label" style={{color:'var(--ns-ice)'}}>
            <svg viewBox="0 0 24 24" width="12" height="12" style={{verticalAlign:'middle', marginRight:8}}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
            MOBILE SERVICE AVAILABLE
          </div>
          <h2 className="big-h2" onClick={onHeadlineTap} style={{fontFamily:'var(--ns-font-display)',fontWeight:700,fontSize:54,lineHeight:1.05,color:'#fff',margin:'12px 0 8px',letterSpacing:'-.02em'}}>
            We come to you.
          </h2>
          <p className="ns-p-lg" style={{maxWidth:480}}>
            Anywhere in Edmonton or the Beaumont area. Driveway, parkade, office lot — if we can reach water, we can detail.
          </p>
        </div>
        <a href="tel:7807815615" className="ms-phone" style={msStyles.phone}>
          <span style={msStyles.phoneLabel}>CALL TO BOOK</span>
          <span style={msStyles.phoneNumber}>780-781-5615</span>
        </a>
      </div>
    </section>
  );
}

const msStyles = {
  section: { position:'relative', padding:'72px 0', background:'var(--ns-cosmic)', overflow:'hidden' },
  inner: { maxWidth:1160, margin:'0 auto', padding:'0 28px', display:'grid', gridTemplateColumns:'1fr auto', gap:32, alignItems:'center' },
  phone: { display:'flex', flexDirection:'column', alignItems:'flex-end', textDecoration:'none', padding:'20px 28px', border:'1px solid var(--ns-border-strong)', borderRadius:16, background:'rgba(3,11,31,.6)', boxShadow:'var(--ns-glow-md)' },
  phoneLabel: { fontFamily:'var(--ns-font-body)', fontWeight:700, fontSize:11, letterSpacing:'.2em', color:'var(--ns-ice)' },
  phoneNumber: { fontFamily:'var(--ns-font-display)', fontWeight:700, fontSize:34, color:'#fff', marginTop:4, letterSpacing:'.04em', whiteSpace:'nowrap' },
};

window.MobileServiceBand = MobileServiceBand;
