// addons.jsx
function AddOns() {
  const items = [
    { name: "Engine Bay Clean", price: "$40" },
    { name: "Pet Hair Removal", price: "$30+" },
    { name: "Odor Removal", price: "$50+" },
    { name: "Headlight Restoration", price: "$60" },
    { name: "Ceramic Coating", price: "$300+" },
  ];
  return (
    <section id="addons" style={addOnStyles.section}>
      <div style={addOnStyles.inner}>
        <div className="ns-eyebrow" style={{fontSize:24, marginBottom:16, textAlign:'center'}}>Add-Ons</div>
        <div style={addOnStyles.grid}>
          {items.map(it => (
            <div key={it.name} style={addOnStyles.row}>
              <div style={{fontFamily:'var(--ns-font-body)', fontWeight:500, fontSize:15, color:'#fff'}}>{it.name}</div>
              <div style={{fontFamily:'var(--ns-font-display)', fontWeight:800, fontStyle:'italic', fontSize:22, color:'var(--ns-signal)'}}>{it.price}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const addOnStyles = {
  section: { padding:'40px 0 72px', background:'var(--ns-midnight)' },
  inner: { maxWidth:760, margin:'0 auto', padding:'0 28px' },
  grid: { background:'rgba(11,29,61,0.55)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', border:'1px solid var(--ns-border-strong)', borderRadius:'var(--ns-radius-lg)', padding:'8px 20px', boxShadow:'var(--ns-glow-sm)' },
  row: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid var(--ns-border)' },
};

window.AddOns = AddOns;
