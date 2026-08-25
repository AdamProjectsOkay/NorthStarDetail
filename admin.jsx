/* admin.jsx — hidden staff CRM entry point.
   Secret combo: hold Ctrl and press 4 three times (Ctrl + 4 4 4).
   Redirects to the real, server-enforced login (login.php). No
   credentials are checked here — the server does that. */

function AdminGate() {
  const seqRef = React.useRef({ n: 0, timer: null });

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && (e.key === '4' || e.code === 'Digit4' || e.code === 'Numpad4')) {
        e.preventDefault();
        const s = seqRef.current;
        s.n += 1;
        clearTimeout(s.timer);
        s.timer = setTimeout(() => { s.n = 0; }, 1400);
        if (s.n >= 3) {
          s.n = 0;
          window.location.href = 'login.php';
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return null;
}

window.AdminGate = AdminGate;
