/* phone.jsx — animated SMS conversation mockup for the hero */

const CHAT = [
  { side: 'in',  text: "Hey! 👋 What are you looking to get done, and what are you driving?", t: "9:41 AM" },
  { side: 'out', text: "2020 Civic — could use a full interior + exterior detail before I sell it", t: "9:41 AM" },
  { side: 'in',  text: "We can do that. We're mobile, so we come to you — got Saturday morning open this week.", t: "9:42 AM" },
  { side: 'out', text: "Perfect. What's it run, and do you do ceramic coating too?", t: "9:42 AM" },
  { side: 'in',  text: "Sent you a quote — ceramic coating's available as an add-on. See you Saturday 🚗✨", t: "9:43 AM" },
];

function PhoneChat({ show = true }) {
  const [count, setCount] = React.useState(0);
  const [typing, setTyping] = React.useState(false);

  React.useEffect(() => {
    if (!show) return;
    let cancelled = false;
    const timers = [];
    setCount(0);
    // reveal bubbles with a typing indicator before incoming ones
    let delay = 700;
    CHAT.forEach((m, i) => {
      if (m.side === 'in' && i > 0) {
        timers.push(setTimeout(() => !cancelled && setTyping(true), delay));
        delay += 850;
      }
      timers.push(setTimeout(() => {
        if (cancelled) return;
        setTyping(false);
        setCount(i + 1);
      }, delay));
      delay += 750;
    });
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [show]);

  if (!show) return null;

  return (
    <div className="phone-col">
      <div className="phone-deco"></div>
      <div className="phone">
        <div className="phone-notch"></div>
        <div className="phone-screen">
          <div className="chat-top">
            <div className="av">N</div>
            <div>
              <div className="who">NorthStar Detailing</div>
              <div className="stat">Typically replies in minutes</div>
            </div>
            <div className="call-x"><IconPhoneOff /> no calls</div>
          </div>

          <div className="chat-body">
            {CHAT.slice(0, count).map((m, i) => (
              <React.Fragment key={i}>
                <div className={`b-row ${m.side}`}>
                  <div className="bubble">{m.text}</div>
                </div>
                {i === count - 1 && <div className="b-time">{m.t} · Delivered</div>}
              </React.Fragment>
            ))}
            {typing && (
              <div className="b-row in" style={{ opacity: 1, transform: 'none' }}>
                <div className="bubble"><span className="typing"><span></span><span></span><span></span></span></div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <div className="fake">Text your reply…</div>
            <div className="send"><IconSend /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PhoneChat = PhoneChat;
