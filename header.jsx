// header.jsx
function Header() {
  return (
    <header style={headerStyles.root}>
      <div className="hdr-inner" style={headerStyles.inner}>
        <div style={headerStyles.brand}>
          <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgMTUwIiBmaWxsPSJub25lIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iaGNocm9tZSIgeDE9IjAiIHkxPSIwIiB4Mj0iMCIgeTI9IjEiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIj48L3N0b3A+CiAgICAgIDxzdG9wIG9mZnNldD0iMjglIiBzdG9wLWNvbG9yPSIjRThFQ0YyIj48L3N0b3A+CiAgICAgIDxzdG9wIG9mZnNldD0iNTUlIiBzdG9wLWNvbG9yPSIjOUFBM0IyIj48L3N0b3A+CiAgICAgIDxzdG9wIG9mZnNldD0iODAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIj48L3N0b3A+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0M5RDFERCI+PC9zdG9wPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iaGdsb3ciIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjUwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMSI+PC9zdG9wPgogICAgICA8c3RvcCBvZmZzZXQ9IjQ1JSIgc3RvcC1jb2xvcj0iIzdCQjZGRiIgc3RvcC1vcGFjaXR5PSIwLjU1Ij48L3N0b3A+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzFFNUJCOCIgc3RvcC1vcGFjaXR5PSIwIj48L3N0b3A+CiAgICA8L3JhZGlhbEdyYWRpZW50PgogIDwvZGVmcz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2MiA3NSkiPgogICAgPGNpcmNsZSByPSI1MiIgZmlsbD0idXJsKCNoZ2xvdykiPjwvY2lyY2xlPgogICAgPHBhdGggZD0iTTAgLTQ0IEw1IC01IEw0NCAwIEw1IDUgTDAgNDQgTC01IDUgTC00NCAwIEwtNSAtNSBaIiBmaWxsPSJ1cmwoI2hjaHJvbWUpIj48L3BhdGg+CiAgICA8Y2lyY2xlIHI9IjUiIGZpbGw9IiNGRkZGRkYiPjwvY2lyY2xlPgogIDwvZz4KICA8dGV4dCB4PSIxMzgiIHk9Ijc1IiBzdHlsZT0iZm9udC1mYW1pbHk6ICYjMzk7U2FpcmEgQ29uZGVuc2VkJiMzOTssICYjMzk7T3N3YWxkJiMzOTssIEltcGFjdCwgc2Fucy1zZXJpZjsgZm9udC13ZWlnaHQ6IDgwMDsgZm9udC1zaXplOiA2MnB4OyBsZXR0ZXItc3BhY2luZzogMC4wMWVtOyIgZmlsbD0idXJsKCNoY2hyb21lKSI+Tk9SVEhTVEFSPC90ZXh0PgogIDx0ZXh0IHg9IjE0MCIgeT0iMTA4IiBzdHlsZT0iZm9udC1mYW1pbHk6ICYjMzk7SW50ZXImIzM5OywgJiMzOTtIZWx2ZXRpY2EmIzM5Oywgc2Fucy1zZXJpZjsgZm9udC13ZWlnaHQ6IDcwMDsgZm9udC1zaXplOiAxOXB4OyBsZXR0ZXItc3BhY2luZzogMC4zMmVtOyIgZmlsbD0iI0M5RDFERCI+QVVUTyBERVRBSUxJTkc8L3RleHQ+Cjwvc3ZnPg==" className="hdr-logo" style={{height:52,display:'block'}} alt="NorthStar Auto Detailing"/>
        </div>
        <nav style={headerStyles.nav}>
          <a href="#pricing" className="hdr-navlink" style={headerStyles.link}>Packages</a>
          <a href="#addons" className="hdr-navlink" style={headerStyles.link}>Add-Ons</a>
          <a href="#area" className="hdr-navlink" style={headerStyles.link}>Service Area</a>
          <a href="tel:7807815615" className="ns-btn ns-btn-primary ns-btn-pill" style={{fontSize:13, padding:'10px 16px', whiteSpace:'nowrap', textDecoration:'none'}}>
            <span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#0B1326'}}/>
            Call 780-781-5615
          </a>
        </nav>
      </div>
    </header>
  );
}

const headerStyles = {
  root: { position:'sticky', top:0, zIndex:50, background:'rgba(3,11,31,0.8)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', borderBottom:'1px solid var(--ns-border)' },
  inner: { maxWidth:1240, margin:'0 auto', padding:'14px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24 },
  brand: { display:'flex', alignItems:'center', gap:12 },
  wordmark: { fontFamily:'var(--ns-font-display)', fontWeight:800, fontSize:20, letterSpacing:'.02em', background:'var(--ns-gradient-chrome)', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent', lineHeight:1 },
  tag: { fontFamily:'var(--ns-font-body)', fontWeight:700, fontSize:9, letterSpacing:'.28em', color:'var(--ns-silver)', marginTop:2 },
  nav: { display:'flex', alignItems:'center', gap:22 },
  link: { fontFamily:'var(--ns-font-body)', fontSize:14, fontWeight:500, color:'var(--ns-chrome)', textDecoration:'none', opacity:.85 },
};

window.Header = Header;
