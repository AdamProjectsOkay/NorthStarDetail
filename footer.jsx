// footer.jsx
function Footer() {
  return (
    <footer style={footerStyles.root}>
      <div className="footer-inner" style={footerStyles.inner}>
        <div style={footerStyles.brand}>
          <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgMTUwIiBmaWxsPSJub25lIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iaGNocm9tZSIgeDE9IjAiIHkxPSIwIiB4Mj0iMCIgeTI9IjEiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIj48L3N0b3A+CiAgICAgIDxzdG9wIG9mZnNldD0iMjglIiBzdG9wLWNvbG9yPSIjRThFQ0YyIj48L3N0b3A+CiAgICAgIDxzdG9wIG9mZnNldD0iNTUlIiBzdG9wLWNvbG9yPSIjOUFBM0IyIj48L3N0b3A+CiAgICAgIDxzdG9wIG9mZnNldD0iODAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIj48L3N0b3A+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0M5RDFERCI+PC9zdG9wPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iaGdsb3ciIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjUwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMSI+PC9zdG9wPgogICAgICA8c3RvcCBvZmZzZXQ9IjQ1JSIgc3RvcC1jb2xvcj0iIzdCQjZGRiIgc3RvcC1vcGFjaXR5PSIwLjU1Ij48L3N0b3A+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzFFNUJCOCIgc3RvcC1vcGFjaXR5PSIwIj48L3N0b3A+CiAgICA8L3JhZGlhbEdyYWRpZW50PgogIDwvZGVmcz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2MiA3NSkiPgogICAgPGNpcmNsZSByPSI1MiIgZmlsbD0idXJsKCNoZ2xvdykiPjwvY2lyY2xlPgogICAgPHBhdGggZD0iTTAgLTQ0IEw1IC01IEw0NCAwIEw1IDUgTDAgNDQgTC01IDUgTC00NCAwIEwtNSAtNSBaIiBmaWxsPSJ1cmwoI2hjaHJvbWUpIj48L3BhdGg+CiAgICA8Y2lyY2xlIHI9IjUiIGZpbGw9IiNGRkZGRkYiPjwvY2lyY2xlPgogIDwvZz4KICA8dGV4dCB4PSIxMzgiIHk9Ijc1IiBzdHlsZT0iZm9udC1mYW1pbHk6ICYjMzk7U2FpcmEgQ29uZGVuc2VkJiMzOTssICYjMzk7T3N3YWxkJiMzOTssIEltcGFjdCwgc2Fucy1zZXJpZjsgZm9udC13ZWlnaHQ6IDgwMDsgZm9udC1zaXplOiA2MnB4OyBsZXR0ZXItc3BhY2luZzogMC4wMWVtOyIgZmlsbD0idXJsKCNoY2hyb21lKSI+Tk9SVEhTVEFSPC90ZXh0PgogIDx0ZXh0IHg9IjE0MCIgeT0iMTA4IiBzdHlsZT0iZm9udC1mYW1pbHk6ICYjMzk7SW50ZXImIzM5OywgJiMzOTtIZWx2ZXRpY2EmIzM5Oywgc2Fucy1zZXJpZjsgZm9udC13ZWlnaHQ6IDcwMDsgZm9udC1zaXplOiAxOXB4OyBsZXR0ZXItc3BhY2luZzogMC4zMmVtOyIgZmlsbD0iI0M5RDFERCI+QVVUTyBERVRBSUxJTkc8L3RleHQ+Cjwvc3ZnPg==" style={{height:44,display:'block'}} alt="NorthStar Auto Detailing"/>
        </div>
        <div className="footer-cols" style={footerStyles.cols}>
          <div>
            <div style={footerStyles.colH}>Service area</div>
            <div style={footerStyles.colP}>Edmonton · Beaumont<br/>Sherwood Park · Leduc</div>
          </div>
          <div>
            <div style={footerStyles.colH}>Book</div>
            <div style={footerStyles.colP}><a href="tel:7807815615" style={footerStyles.a}>780-781-5615</a><br/><span style={{color:'var(--ns-silver-dim)',fontSize:12}}>Online booking · calendar coming soon</span></div>
          </div>
          <div>
            <div style={footerStyles.colH}>Find us</div>
            <div style={footerStyles.colP}>Facebook<br/>Instagram</div>
          </div>
        </div>
      </div>
      <div style={footerStyles.base}>© {new Date().getFullYear()} NorthStar Auto Detailing · Edmonton, AB</div>
    </footer>
  );
}

const footerStyles = {
  root: { background:'var(--ns-midnight)', borderTop:'1px solid var(--ns-border)', paddingTop:56 },
  inner: { maxWidth:1160, margin:'0 auto', padding:'0 28px 32px', display:'grid', gridTemplateColumns:'1fr 2fr', gap:40 },
  brand: { display:'flex', alignItems:'center', gap:10 },
  cols: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 },
  colH: { fontFamily:'var(--ns-font-body)', fontWeight:700, fontSize:11, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--ns-ice)', marginBottom:10 },
  colP: { fontFamily:'var(--ns-font-body)', fontSize:14, color:'var(--ns-fg-2)', lineHeight:1.6 },
  a: { color:'#fff', textDecoration:'none', fontWeight:600 },
  base: { borderTop:'1px solid var(--ns-border)', padding:'18px 28px', textAlign:'center', fontFamily:'var(--ns-font-body)', fontSize:12, color:'var(--ns-silver-dim)' },
};

window.Footer = Footer;
