// gallery.jsx
function ResultsGallery() {
  return (
    <section style={gStyles.section}>
      <div style={gStyles.inner}>
        <div style={{textAlign:'center', marginBottom:36}}>
          <div className="ns-label" style={{color:'var(--ns-ice)'}}>RESULTS</div>
          <h2 className="ns-h1" style={{fontSize:52, marginTop:6}}>Gloss that holds.</h2>
        </div>
        <div className="results-grid" style={gStyles.grid}>
          <figure style={gStyles.fig}>
            <img src="images/gallery-bmw-x5-exterior.jpg" style={gStyles.img}/>
            <div style={gStyles.duo}/>
            <figcaption style={gStyles.cap}>
              <div className="ns-eyebrow" style={{fontSize:13, color:'var(--ns-ice)'}}>Premium Exterior</div>
              <div style={{fontFamily:'var(--ns-font-display)', fontWeight:700, fontSize:22, color:'#fff'}}>BMW X5 · Full wash + clay bar</div>
            </figcaption>
          </figure>
          <figure style={gStyles.fig}>
            <img src="images/gallery-interior-clean.jpg" style={gStyles.img}/>
            <figcaption style={gStyles.cap}>
              <div className="ns-eyebrow" style={{fontSize:13, color:'var(--ns-ice)'}}>Interior Clean</div>
              <div style={{fontFamily:'var(--ns-font-display)', fontWeight:700, fontSize:22, color:'#fff'}}>Deep vacuum · surface wipe-down</div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

const gStyles = {
  section: { padding:'72px 0', background:'linear-gradient(180deg, var(--ns-midnight), var(--ns-cosmic))' },
  inner: { maxWidth:1160, margin:'0 auto', padding:'0 28px' },
  grid: { display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:18 },
  fig: { position:'relative', margin:0, borderRadius:16, overflow:'hidden', aspectRatio:'4/3', border:'1px solid var(--ns-border-strong)' },
  img: { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  duo: { position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(10,37,87,.25), rgba(30,91,184,.15))', mixBlendMode:'multiply' },
  cap: { position:'absolute', left:0, right:0, bottom:0, padding:'18px 22px', background:'linear-gradient(180deg, transparent, rgba(3,11,31,.85))' },
};

window.ResultsGallery = ResultsGallery;
