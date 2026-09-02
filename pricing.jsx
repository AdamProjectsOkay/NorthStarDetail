// pricing.jsx
function PricingCard({tier, name, price, prefix, features, popular}) {
  return (
    <div style={{...pricingStyles.card, ...(popular ? pricingStyles.cardPop : {})}}>
      {popular && <div style={pricingStyles.popBadge}>Most Popular</div>}
      <div className="ns-eyebrow" style={{fontSize:15, color:'var(--ns-ice)'}}>{tier}</div>
      <div style={{display:'flex', alignItems:'baseline', gap:10, marginTop:6, flexWrap:'wrap'}}>
        <div style={{fontFamily:'var(--ns-font-display)', fontWeight:700, fontSize:24, color:'#fff', letterSpacing:'-.01em', whiteSpace:'nowrap'}}>{name}</div>
        <div style={{fontFamily:'var(--ns-font-serif)', fontStyle:'italic', fontSize:14, color:'var(--ns-silver)'}}>{prefix}</div>
        <div style={{fontFamily:'var(--ns-font-display)', fontWeight:800, fontStyle:'italic', fontSize:30, color:'#fff'}}>${price}</div>
      </div>
      <ul style={pricingStyles.list}>
        {features.map((f,i) => (
          <li key={i} style={pricingStyles.li}>
            <svg viewBox="0 0 24 24" width="14" height="14" style={{flex:'0 0 14px', marginTop:4}}>
              <polyline points="20 6 9 17 4 12" fill="none" stroke="#7BB6FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button className={"ns-btn " + (popular ? "ns-btn-primary" : "ns-btn-secondary")} style={{width:'100%', marginTop:18, justifyContent:'center'}} onClick={() => { const el = document.getElementById('book'); if (el) { el.scrollIntoView({behavior:'smooth'}); window.dispatchEvent(new CustomEvent('ns-select-package', {detail: name})); } }}>Book Now</button>
    </div>
  );
}

function PricingGrid() {
  return (
    <section id="pricing" style={pricingStyles.section}>
      <div style={pricingStyles.inner}>
        <div style={{textAlign:'center', marginBottom:48}}>
          <div className="ns-label" style={{color:'var(--ns-ice)'}}>PACKAGES</div>
          <h2 className="ns-hero pricing-title" style={{fontSize:88, margin:'8px 0 0'}}>PRICING</h2>
          <p className="ns-p-lg" style={{color:'var(--ns-fg-3)', marginTop:10}}>Flat rates. Mobile service.</p>
        </div>

        <div style={{marginBottom:36}}>
          <div className="ns-eyebrow" style={{fontSize:24, marginBottom:16}}>Exterior Packages</div>
          <div className="pricing-grid" style={pricingStyles.grid}>
            <PricingCard tier="Level 1" name="Basic Wash" prefix="Starting at" price="60" features={["Hand wash & dry","Wheel clean","Tire shine"]}/>
            <PricingCard tier="Level 2" name="Deluxe Exterior" prefix="Starting at" price="100" features={["Everything in Basic","Spray wax protection","Door jamb wipe-down"]}/>
            <PricingCard tier="Level 3" name="Premium Exterior" prefix="at" price="150" features={["Full wash & wax","Clay bar treatment","Deep wheel & tire clean"]}/>
          </div>
        </div>

        <div style={{marginBottom:36}}>
          <div className="ns-eyebrow" style={{fontSize:24, marginBottom:16}}>Interior Clean</div>
          <div style={{...pricingStyles.grid, gridTemplateColumns:'1fr'}}>
            <PricingCard tier="Interior" name="Interior Clean" prefix="Starting at" price="100" features={["Vacuum","Wipe down surfaces","Windows cleaned","Deep dash & console clean"]}/>
          </div>
        </div>

        <div>
          <div className="ns-eyebrow" style={{fontSize:24, marginBottom:16}}>Full Detail Packages</div>
          <div className="pricing-grid" style={{...pricingStyles.grid, gridTemplateColumns:'1fr 1fr'}}>
            <PricingCard tier="Full Detail" name="Complete Detail" prefix="Starting at" price="200" features={["Full interior + exterior","Hand wax","Tire shine"]}/>
            <PricingCard popular tier="Full Detail" name="Premium Detail" prefix="Starting at" price="270" features={["Interior clean","Clay bar + wax","Trim restoration"]}/>
          </div>
        </div>
      </div>
    </section>
  );
}

const pricingStyles = {
  section: { position:'relative', padding:'96px 0', background:'var(--ns-midnight)' },
  inner: { maxWidth:1160, margin:'0 auto', padding:'0 28px' },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18 },
  card: { position:'relative', background:'rgba(11,29,61,0.55)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', border:'1px solid var(--ns-border-strong)', borderRadius:'var(--ns-radius-lg)', padding:'22px 20px 20px', boxShadow:'var(--ns-glow-sm)' },
  cardPop: { border:'1px solid rgba(247,181,0,0.5)', boxShadow:'0 0 0 1px rgba(247,181,0,0.4), 0 20px 60px rgba(247,181,0,0.15), 0 0 60px rgba(30,91,184,0.25)' },
  popBadge: { position:'absolute', top:-11, right:18, background:'var(--ns-gradient-signal)', color:'#0B1326', fontFamily:'var(--ns-font-body)', fontWeight:700, fontSize:11, letterSpacing:'.12em', textTransform:'uppercase', padding:'4px 12px', borderRadius:999 },
  list: { listStyle:'none', padding:0, margin:'16px 0 0', display:'flex', flexDirection:'column', gap:8 },
  li: { display:'flex', gap:10, fontFamily:'var(--ns-font-body)', fontSize:14, color:'var(--ns-fg-2)', lineHeight:1.45 },
};

window.PricingCard = PricingCard;
window.PricingGrid = PricingGrid;
