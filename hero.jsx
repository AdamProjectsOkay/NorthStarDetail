// hero.jsx
function Hero() {
  return (
    <section style={heroStyles.root}>
      <Starfield/>
      <MountainRange/>
      <div className="hero-inner" style={heroStyles.inner}>
        <div style={heroStyles.left}>
          <div className="ns-label" style={{color:'var(--ns-ice)'}}>
            <span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:'var(--ns-signal)',boxShadow:'0 0 10px var(--ns-signal)',marginRight:10,verticalAlign:'middle'}}/>
            MOBILE SERVICE · EDMONTON &amp; BEAUMONT
          </div>
          <h1 className="hero-headline" style={heroStyles.headline}>
            Follow the<br/>
            <span style={heroStyles.chrome}>North Star</span><br/>
            to a flawless finish.
          </h1>
          <p className="ns-p-lg" style={{maxWidth:480, marginTop:22}}>
            Professional auto detailing, delivered to your driveway. Hand wash, clay bar, ceramic coating — we handle it, you get your weekend back.
          </p>
          <div style={{display:'flex', gap:12, marginTop:32, flexWrap:'wrap'}}>
            <a href="#book" className="ns-btn ns-btn-primary">Book Now</a>
            <a href="#pricing" className="ns-btn ns-btn-secondary">See Packages</a>
          </div>
          <div style={{display:'flex', gap:28, marginTop:32, flexWrap:'wrap'}}>
            <Stat big="Starting at $60" small="mobile detailing"/>
            <Stat big="Mobile" small="we come to you"/>
            <Stat big="Local" small="Edmonton owned"/>
          </div>
        </div>
        <div className="hero-right" style={heroStyles.right}>
          <ShieldMark/>
        </div>
      </div>
    </section>
  );
}

function Stat({big, small}) {
  return (
    <div>
      <div style={{fontFamily:'var(--ns-font-display)',fontWeight:800,fontSize:32,lineHeight:1,color:'#fff'}}>{big}</div>
      <div style={{fontFamily:'var(--ns-font-body)',fontSize:12,color:'var(--ns-silver)',marginTop:4,letterSpacing:'.04em'}}>{small}</div>
    </div>
  );
}

function Starfield() {
  const stars = React.useMemo(() => {
    return Array.from({length:80}, (_,i) => ({
      x: Math.random()*100, y: Math.random()*100,
      s: Math.random()*2 + 0.5, d: Math.random()*3, dur: 2+Math.random()*3,
      sparkle: Math.random() > 0.92
    }));
  }, []);
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
      {stars.map((st,i) => st.sparkle ? (
        <svg key={i} viewBox="0 0 24 24" style={{position:'absolute',left:st.x+'%',top:st.y+'%',width:10+st.s*3,height:10+st.s*3,filter:'drop-shadow(0 0 6px #7BB6FF)',animation:`twinkle ${st.dur}s ease-in-out ${st.d}s infinite alternate`}}>
          <path d="M12 2 L13 11 L22 12 L13 13 L12 22 L11 13 L2 12 L11 11 Z" fill="#fff"/>
        </svg>
      ) : (
        <div key={i} style={{position:'absolute',left:st.x+'%',top:st.y+'%',width:st.s,height:st.s,borderRadius:'50%',background:'#fff',boxShadow:'0 0 4px rgba(255,255,255,.8)',animation:`twinkle ${st.dur}s ease-in-out ${st.d}s infinite alternate`}}/>
      ))}
    </div>
  );
}

function MountainRange() {
  return (
    <svg viewBox="0 0 1200 260" preserveAspectRatio="none" style={{position:'absolute',bottom:0,left:0,right:0,width:'100%',height:260,pointerEvents:'none'}}>
      <defs>
        <linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E5BB8" stopOpacity=".9"/>
          <stop offset="100%" stopColor="#030B1F" stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff"/>
          <stop offset="100%" stopColor="#7BB6FF"/>
        </linearGradient>
      </defs>
      <path d="M0,260 L0,180 L100,120 L160,150 L230,90 L300,140 L380,70 L450,120 L540,60 L620,130 L700,80 L790,150 L860,90 L940,140 L1030,70 L1110,130 L1200,100 L1200,260 Z" fill="url(#mtn)"/>
      <path d="M100,120 L130,135 L160,150 L145,142 L130,135 Z M230,90 L265,115 L300,140 L280,125 L260,108 Z M380,70 L415,95 L450,120 L430,104 L410,88 Z M540,60 L580,95 L620,130 L595,110 L570,85 Z M700,80 L745,115 L790,150 L765,130 L740,108 Z M860,90 L900,115 L940,140 L918,122 L895,104 Z M1030,70 L1070,100 L1110,130 L1085,110 L1058,88 Z" fill="url(#snow)" opacity=".9"/>
    </svg>
  );
}

function ShieldMark() {
  return (
    <div style={{position:'relative', width:360, height:440, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{position:'absolute',inset:-40, background:'radial-gradient(circle, rgba(30,91,184,.5), transparent 65%)', filter:'blur(20px)'}}/>
      <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MjAgNTIwIiBmaWxsPSJub25lIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ic2t5IiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxRTVCQjgiPjwvc3RvcD4KICAgICAgPHN0b3Agb2Zmc2V0PSI1NSUiIHN0b3AtY29sb3I9IiMwQTI1NTciPjwvc3RvcD4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDMwQjFGIj48L3N0b3A+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJjaHJvbWUiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiI+PC9zdG9wPgogICAgICA8c3RvcCBvZmZzZXQ9IjI4JSIgc3RvcC1jb2xvcj0iI0U4RUNGMiI+PC9zdG9wPgogICAgICA8c3RvcCBvZmZzZXQ9IjU1JSIgc3RvcC1jb2xvcj0iIzlBQTNCMiI+PC9zdG9wPgogICAgICA8c3RvcCBvZmZzZXQ9IjgwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiI+PC9zdG9wPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNDOUQxREQiPjwvc3RvcD4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InNub3ciIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiI+PC9zdG9wPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3QkI2RkYiPjwvc3RvcD4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8cmFkaWFsR3JhZGllbnQgaWQ9InN0YXJnbG93IiBjeD0iNTAlIiBjeT0iNTAlIiByPSI1MCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjEiPjwvc3RvcD4KICAgICAgPHN0b3Agb2Zmc2V0PSI0MCUiIHN0b3AtY29sb3I9IiM3QkI2RkYiIHN0b3Atb3BhY2l0eT0iMC41Ij48L3N0b3A+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzFFNUJCOCIgc3RvcC1vcGFjaXR5PSIwIj48L3N0b3A+CiAgICA8L3JhZGlhbEdyYWRpZW50PgogIDwvZGVmcz4KCiAgCiAgPHBhdGggZD0iTTIxMCAyMCBMMzkwIDcwIEwzODIgMjgwIFEzNzggMzkwIDIxMCA0NzAgUTQyIDM5MCAzOCAyODAgTDMwIDcwIFoiIGZpbGw9InVybCgjc2t5KSIgc3Ryb2tlPSJ1cmwoI2Nocm9tZSkiIHN0cm9rZS13aWR0aD0iNyI+PC9wYXRoPgogIDxwYXRoIGQ9Ik0yMTAgMzIgTDM3OCA3OCBMMzcwIDI3NiBRMzY2IDM4MCAyMTAgNDU0IFE1NCAzODAgNTAgMjc2IEw0MiA3OCBaIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjY2hyb21lKSIgc3Ryb2tlLXdpZHRoPSIxLjUiIG9wYWNpdHk9IjAuNzUiPjwvcGF0aD4KCiAgCiAgPGNpcmNsZSBjeD0iODUiIGN5PSIxMTAiIHI9IjEuNiIgZmlsbD0iI2ZmZiI+PC9jaXJjbGU+CiAgPGNpcmNsZSBjeD0iMTIwIiBjeT0iODUiIHI9IjEiIGZpbGw9IiNmZmYiPjwvY2lyY2xlPgogIDxjaXJjbGUgY3g9IjE1NSIgY3k9IjEzNSIgcj0iMS40IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIuODUiPjwvY2lyY2xlPgogIDxjaXJjbGUgY3g9IjI2MCIgY3k9IjEwMCIgcj0iMSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjkiPjwvY2lyY2xlPgogIDxjaXJjbGUgY3g9IjMxMCIgY3k9IjE0NSIgcj0iMS42IiBmaWxsPSIjZmZmIj48L2NpcmNsZT4KICA8Y2lyY2xlIGN4PSIzNDAiIGN5PSIxMDUiIHI9IjEiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii44NSI+PC9jaXJjbGU+CgogIAogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI5MCA4OCkiPgogICAgPGNpcmNsZSByPSIyOCIgZmlsbD0idXJsKCNzdGFyZ2xvdykiPjwvY2lyY2xlPgogICAgPHBhdGggZD0iTTAgLTIyIEwzIC0zIEwyMiAwIEwzIDMgTDAgMjIgTC0zIDMgTC0yMiAwIEwtMyAtMyBaIiBmaWxsPSIjRkZGRkZGIj48L3BhdGg+CiAgICA8Y2lyY2xlIHI9IjMiIGZpbGw9IiNGRkZGRkYiPjwvY2lyY2xlPgogIDwvZz4KCiAgCiAgPHBhdGggZD0iTTM4IDI3MCYjeEE7ICAgICAgICAgICBMOTUgMTk1IEwxMzAgMjMwIEwxNjUgMTc1IEwyMDUgMjIwIEwyNDUgMTYwIEwyODUgMjE1IEwzMzAgMTkwIEwzNzAgMjM1IEwzODIgMjgwJiN4QTsgICAgICAgICAgIEwzODIgMzMwIEwzOCAzMzAgWiIgZmlsbD0idXJsKCNza3kpIiBzdHJva2U9Im5vbmUiPjwvcGF0aD4KICA8cGF0aCBkPSJNOTUgMTk1IEwxMTUgMjIwIEwxMzAgMjMwIEwxMTggMjE1IEwxMDggMjAzIFomI3hBOyAgICAgICAgICAgTTE2NSAxNzUgTDE4NSAyMDAgTDIwNSAyMjAgTDE5MiAyMDUgTDE3OCAxODggWiYjeEE7ICAgICAgICAgICBNMjQ1IDE2MCBMMjY1IDE5MCBMMjg1IDIxNSBMMjcyIDE5OCBMMjU4IDE3OCBaJiN4QTsgICAgICAgICAgIE0zMzAgMTkwIEwzNTAgMjE1IEwzNzAgMjM1IEwzNTggMjIwIEwzNDQgMjAzIFoiIGZpbGw9InVybCgjc25vdykiPjwvcGF0aD4KICAKICA8cGF0aCBkPSJNMzggMzMwIEwzODIgMzMwIiBzdHJva2U9InVybCgjY2hyb21lKSIgc3Ryb2tlLXdpZHRoPSIxLjUiIG9wYWNpdHk9IjAuNyI+PC9wYXRoPgoKICAKICA8cGF0aCBkPSJNMjAgMzU1IEw0MDAgMzU1IEwzODggNDMwIEwyMTAgNDQ4IEwzMiA0MzAgWiIgZmlsbD0iIzBBMjU1NyIgc3Ryb2tlPSJ1cmwoI2Nocm9tZSkiIHN0cm9rZS13aWR0aD0iNCI+PC9wYXRoPgogIDxwYXRoIGQ9Ik0yOCAzNjMgTDM5MiAzNjMgTDM4MiA0MjIgTDIxMCA0MzggTDM4IDQyMiBaIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjY2hyb21lKSIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjYiPjwvcGF0aD4KCiAgCiAgPHRleHQgeD0iMjEwIiB5PSI0MDgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIHN0eWxlPSJmb250LWZhbWlseTogJiMzOTtTYWlyYSBDb25kZW5zZWQmIzM5OywgJiMzOTtPc3dhbGQmIzM5OywgSW1wYWN0LCBzYW5zLXNlcmlmOyBmb250LXdlaWdodDogODAwOyBmb250LXNpemU6IDQ2cHg7IGxldHRlci1zcGFjaW5nOiAwLjAyZW07IiBmaWxsPSJ1cmwoI2Nocm9tZSkiPk5PUlRIU1RBUjwvdGV4dD4KICA8dGV4dCB4PSIyMTAiIHk9IjQzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgc3R5bGU9ImZvbnQtZmFtaWx5OiAmIzM5O0ludGVyJiMzOTssICYjMzk7SGVsdmV0aWNhJiMzOTssIHNhbnMtc2VyaWY7IGZvbnQtd2VpZ2h0OiA3MDA7IGZvbnQtc2l6ZTogMTFweDsgbGV0dGVyLXNwYWNpbmc6IDAuMzZlbTsiIGZpbGw9IiM5QUEzQjIiPsK3IEFVVE8gREVUQUlMSU5HIMK3PC90ZXh0PgoKICAKICA8cGF0aCBkPSJNMjAgMzU1IEw0IDM2OCBMMjAgMzgyIFoiIGZpbGw9IiMwQTI1NTciIHN0cm9rZT0idXJsKCNjaHJvbWUpIiBzdHJva2Utd2lkdGg9IjIiPjwvcGF0aD4KICA8cGF0aCBkPSJNNDAwIDM1NSBMNDE2IDM2OCBMNDAwIDM4MiBaIiBmaWxsPSIjMEEyNTU3IiBzdHJva2U9InVybCgjY2hyb21lKSIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+CgogIAogIDxwYXRoIGQ9Ik02MCA0NzAgUTIxMCA1MTAgMzYwIDQ3MCIgc3Ryb2tlPSJ1cmwoI2Nocm9tZSkiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC41Ij48L3BhdGg+CiAgPGNpcmNsZSBjeD0iMjEwIiBjeT0iNDkwIiByPSIyIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjgiPjwvY2lyY2xlPgo8L3N2Zz4=" style={{width:340, height:'auto', filter:'drop-shadow(0 20px 40px rgba(3,11,31,.6))'}} alt="NorthStar Auto Detailing"/>
    </div>
  );
}

const heroStyles = {
  root: { position:'relative', overflow:'hidden', minHeight:680, background:'radial-gradient(ellipse at 50% 20%, #1E5BB8 0%, #0A2557 40%, #030B1F 85%)' },
  inner: { position:'relative', zIndex:2, maxWidth:1240, margin:'0 auto', padding:'64px 28px 120px', display:'grid', gridTemplateColumns:'1fr 380px', gap:40, alignItems:'center' },
  left: { },
  right: { display:'flex', justifyContent:'center' },
  headline: { fontFamily:'var(--ns-font-display)', fontWeight:700, fontSize:68, lineHeight:1.08, letterSpacing:'-0.01em', color:'#fff', marginTop:20, marginBottom:0, paddingRight:'0.2em', overflow:'visible' },
  chrome: { background:'var(--ns-gradient-chrome)', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent', fontStyle:'italic', paddingRight:'0.12em', display:'inline-block' },
};

window.Hero = Hero;
window.ShieldMark = ShieldMark;
