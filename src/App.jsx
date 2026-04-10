import { useState, useEffect, useRef } from "react";

const TEAL = "#00C9A7";
const TEAL_DARK = "#00A88A";
const NAVY = "#0A1628";
const NAVY_LIGHT = "#0F2035";
const NAVY_MID = "#132840";
const ACCENT = "#00E88A";
const ORANGE = "#FF8C42";
const RED = "#FF4757";
const WHITE = "#F0F4F8";
const GRAY = "#8A9BB0";

const styles = {
  app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: `linear-gradient(180deg, ${NAVY} 0%, #0D1F30 100%)`, fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: WHITE, position: "relative", overflow: "hidden" },
  statusBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px 4px", fontSize: 12, fontWeight: 600, color: GRAY },
  header: { padding: "8px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: NAVY },
  logoText: { fontSize: 20, fontWeight: 700, letterSpacing: -0.5 },
  avatar: { width: 40, height: 40, borderRadius: 20, background: NAVY_MID, border: `2px solid ${TEAL}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  screen: { padding: "0 20px 100px" },
  card: { background: `linear-gradient(135deg, ${NAVY_LIGHT}, ${NAVY_MID})`, borderRadius: 20, padding: 20, marginBottom: 14, border: `1px solid ${TEAL}15`, position: "relative", overflow: "hidden" },
  cardGlow: { position: "absolute", top: -50, right: -50, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${TEAL}15 0%, transparent 70%)`, pointerEvents: "none" },
  speedCard: { background: `linear-gradient(135deg, ${TEAL}15, ${NAVY_MID})`, borderRadius: 24, padding: 24, marginBottom: 14, border: `1px solid ${TEAL}30`, textAlign: "center" },
  label: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: GRAY, marginBottom: 6 },
  bigNum: { fontSize: 56, fontWeight: 800, letterSpacing: -2, lineHeight: 1, background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  statRow: { display: "flex", gap: 10, marginBottom: 14 },
  stat: { flex: 1, background: NAVY_MID, borderRadius: 16, padding: "16px 14px", border: `1px solid ${TEAL}10` },
  statVal: { fontSize: 22, fontWeight: 700, color: WHITE, marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: GRAY },
  btn: { width: "100%", padding: "16px 24px", borderRadius: 14, border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.2s", letterSpacing: -0.3 },
  btnPrimary: { background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})`, color: NAVY },
  btnSecondary: { background: NAVY_MID, color: WHITE, border: `1px solid ${TEAL}30` },
  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: `${NAVY}F0`, backdropFilter: "blur(20px)", borderTop: `1px solid ${TEAL}15`, display: "flex", justifyContent: "space-around", padding: "8px 0 28px", zIndex: 100 },
  navItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", padding: "6px 12px", borderRadius: 12 },
  progressBar: { height: 6, borderRadius: 3, background: NAVY_MID, overflow: "hidden", marginTop: 8 },
  progressFill: (pct, color) => ({ height: "100%", borderRadius: 3, width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}CC)`, transition: "width 1s ease" }),
  listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${TEAL}08` },
  badge: (color) => ({ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${color}20`, color }),
  input: { width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${TEAL}20`, background: NAVY_MID, color: WHITE, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  speedRing: { width: 200, height: 200, margin: "0 auto 20px", position: "relative" }
};

function SpeedGauge({ value, running }) {
  const max = 1000;
  const pct = Math.min(value / max * 100, 100);
  return (
    <div style={styles.speedRing}>
      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
        <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={TEAL} /><stop offset="100%" stopColor={ACCENT} /></linearGradient></defs>
        <circle cx="100" cy="100" r="88" fill="none" stroke={NAVY_MID} strokeWidth="8" strokeLinecap="round" transform="rotate(-135 100 100)" strokeDasharray={`${270*3.14*88/180} ${360*3.14*88/180}`} />
        <circle cx="100" cy="100" r="88" fill="none" stroke="url(#sg)" strokeWidth="8" strokeLinecap="round" transform="rotate(-135 100 100)" strokeDasharray={`${pct*2.7*3.14*88/180} ${360*3.14*88/180}`} style={{ transition: "stroke-dasharray 0.5s ease", filter: "drop-shadow(0 0 8px rgba(0,201,167,0.5))" }} />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
        <div style={{ ...styles.bigNum, fontSize: running ? 48 : 52 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: GRAY, marginTop: 4 }}>Mbps</div>
      </div>
    </div>
  );
}

function HomeScreen() {
  return (
    <div style={styles.screen}>
      <div style={{ ...styles.card, background: `linear-gradient(135deg, ${TEAL}12, ${NAVY_MID})`, border: `1px solid ${TEAL}25` }}>
        <div style={styles.cardGlow} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={styles.label}>Your Connection</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>Gigabit Fibre</div>
            <div style={{ fontSize: 13, color: TEAL, fontWeight: 600, marginTop: 2 }}>1,000 Mbps symmetrical</div>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: `${ACCENT}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 24 }}>📶</span></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={styles.badge(ACCENT)}>● Online</span>
          <span style={styles.badge(TEAL)}>XGS-PON</span>
          <span style={styles.badge("#7C5CFC")}>WiFi 6E</span>
        </div>
      </div>
      <div style={styles.statRow}>
        <div style={styles.stat}><div style={{ ...styles.statVal, color: TEAL }}>↓ 947</div><div style={styles.statLabel}>Download Mbps</div></div>
        <div style={styles.stat}><div style={{ ...styles.statVal, color: ACCENT }}>↑ 891</div><div style={styles.statLabel}>Upload Mbps</div></div>
        <div style={styles.stat}><div style={{ ...styles.statVal, color: ORANGE }}>2ms</div><div style={styles.statLabel}>Latency</div></div>
      </div>
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={styles.label}>Next Bill</div><div style={{ fontSize: 24, fontWeight: 700 }}>J$7,500</div><div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>Due May 15, 2026</div></div>
          <button style={{ ...styles.btn, ...styles.btnPrimary, width: "auto", padding: "12px 24px", fontSize: 13 }}>Pay Now</button>
        </div>
      </div>
      <div style={styles.card}>
        <div style={styles.label}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {[{ icon: "⚡", label: "Speed Test", color: TEAL },{ icon: "🛡", label: "WiFi Settings", color: "#7C5CFC" },{ icon: "🎁", label: "Refer a Friend", color: ORANGE },{ icon: "📺", label: "Tellinex TV", color: RED }].map((a, i) => (
            <div key={i} style={{ background: `${a.color}10`, borderRadius: 14, padding: "16px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: `1px solid ${a.color}15` }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span><span style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><div style={styles.label}>Network Status</div><span style={styles.badge(ACCENT)}>All Systems Operational</span></div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ width: "100%", height: 40, borderRadius: 6, background: `${ACCENT}20`, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
                <div style={{ width: "100%", height: `${85 + Math.random() * 15}%`, background: `linear-gradient(180deg, ${ACCENT}60, ${TEAL}30)`, borderRadius: "4px 4px 0 0" }} />
              </div>
              <div style={{ fontSize: 9, color: GRAY, marginTop: 4, fontWeight: 600 }}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: GRAY, marginTop: 8, textAlign: "center" }}>99.98% uptime this month</div>
      </div>
    </div>
  );
}

function SpeedTestScreen() {
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [results, setResults] = useState(null);
  const intervalRef = useRef(null);
  const runTest = () => {
    setRunning(true); setSpeed(0); setPhase("download"); setResults(null);
    let s = 0;
    intervalRef.current = setInterval(() => {
      s += Math.random() * 120 + 30;
      if (s > 950) s = 940 + Math.random() * 20;
      setSpeed(Math.round(s));
      if (s > 940) {
        clearInterval(intervalRef.current);
        const dl = Math.round(s);
        setPhase("upload"); s = 0;
        intervalRef.current = setInterval(() => {
          s += Math.random() * 100 + 25;
          if (s > 890) s = 880 + Math.random() * 15;
          setSpeed(Math.round(s));
          if (s > 880) { clearInterval(intervalRef.current); setResults({ download: dl, upload: Math.round(s), ping: 2, jitter: 0.4 }); setPhase("done"); setRunning(false); }
        }, 100);
      }
    }, 100);
  };
  useEffect(() => () => clearInterval(intervalRef.current), []);
  return (
    <div style={styles.screen}>
      <div style={{ textAlign: "center", marginBottom: 20 }}><h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Speed Test</h2><p style={{ fontSize: 13, color: GRAY, margin: 0 }}>Powered by Tellinex Network</p></div>
      <div style={styles.speedCard}>
        <SpeedGauge value={results ? results.download : speed} running={running} />
        <div style={{ fontSize: 13, fontWeight: 700, color: phase === "download" ? TEAL : phase === "upload" ? ACCENT : GRAY, height: 20, marginBottom: 16 }}>
          {phase === "download" && "↓ Testing Download..."}{phase === "upload" && "↑ Testing Upload..."}{phase === "done" && "✓ Test Complete"}{phase === "idle" && "Ready to test"}
        </div>
        {!running && <button onClick={runTest} style={{ ...styles.btn, ...styles.btnPrimary, borderRadius: 50, fontSize: 16, padding: "18px 24px" }}>{results ? "Test Again" : "Start Test"}</button>}
      </div>
      {results && <div style={styles.statRow}><div style={styles.stat}><div style={{ ...styles.statVal, color: TEAL }}>↓ {results.download}</div><div style={styles.statLabel}>Download Mbps</div></div><div style={styles.stat}><div style={{ ...styles.statVal, color: ACCENT }}>↑ {results.upload}</div><div style={styles.statLabel}>Upload Mbps</div></div></div>}
      {results && <div style={styles.statRow}><div style={styles.stat}><div style={{ ...styles.statVal, color: ORANGE }}>{results.ping}ms</div><div style={styles.statLabel}>Ping</div></div><div style={styles.stat}><div style={{ ...styles.statVal, color: "#7C5CFC" }}>{results.jitter}ms</div><div style={styles.statLabel}>Jitter</div></div></div>}
    </div>
  );
}

function BillScreen() {
  return (
    <div style={styles.screen}>
      <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", padding: "0 4px" }}>Billing</h2>
      <p style={{ fontSize: 13, color: GRAY, margin: "0 0 20px", padding: "0 4px" }}>Manage your payments</p>
      <div style={{ ...styles.card, background: `linear-gradient(135deg, ${TEAL}15, ${ACCENT}08)`, border: `1px solid ${TEAL}30` }}>
        <div style={styles.cardGlow} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}><div><div style={styles.label}>Current Balance</div><div style={{ fontSize: 36, fontWeight: 800 }}>J$7,500</div></div><span style={styles.badge(ORANGE)}>Due in 12 days</span></div>
        <div style={styles.label}>Plan: Tellinex Gigabit</div>
        <div style={styles.progressBar}><div style={styles.progressFill(65, TEAL)} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <button style={{ ...styles.btn, ...styles.btnPrimary, borderRadius: 14 }}>💳 Pay Now</button>
        <button style={{ ...styles.btn, ...styles.btnSecondary, borderRadius: 14 }}>📱 Lynk Pay</button>
      </div>
      <div style={styles.card}>
        <div style={styles.label}>Payment History</div>
        {[{ d: "Mar 15, 2026", amt: "J$7,500" },{ d: "Feb 15, 2026", amt: "J$7,500" },{ d: "Jan 15, 2026", amt: "J$7,500" }].map((p, i) => (
          <div key={i} style={styles.listItem}><div><div style={{ fontSize: 13, fontWeight: 600 }}>{p.d}</div><div style={{ fontSize: 11, color: GRAY }}>Monthly subscription</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: 14, fontWeight: 700 }}>{p.amt}</div><span style={styles.badge(ACCENT)}>✓ Paid</span></div></div>
        ))}
      </div>
    </div>
  );
}

function SupportScreen() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([{ from: "bot", text: "👋 Welcome to Tellinex Support! How can I help you today?" }]);
  const send = () => {
    if (!msg.trim()) return;
    setMessages(m => [...m, { from: "user", text: msg }]);
    setMsg("");
    setTimeout(() => { setMessages(m => [...m, { from: "bot", text: "Thanks for reaching out! A support agent will respond shortly. Ticket #TX-2847." }]); }, 1200);
  };
  return (
    <div style={styles.screen}>
      <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 16px", padding: "0 4px" }}>Support</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[{ icon: "📞", label: "Call Us", sub: "876-555-FIBRE" },{ icon: "💬", label: "WhatsApp", sub: "876-555-0100" }].map((c, i) => (
          <div key={i} style={{ ...styles.card, marginBottom: 0, textAlign: "center", cursor: "pointer" }}><span style={{ fontSize: 28 }}>{c.icon}</span><div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>{c.label}</div><div style={{ fontSize: 11, color: TEAL }}>{c.sub}</div></div>
        ))}
      </div>
      <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${TEAL}10`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: NAVY }}>T</div>
          <div><div style={{ fontSize: 14, fontWeight: 700 }}>Tellinex AI Support</div><div style={{ fontSize: 11, color: ACCENT }}>● Online</div></div>
        </div>
        <div style={{ height: 220, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m, i) => (<div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: m.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.from === "user" ? `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})` : NAVY_MID, color: m.from === "user" ? NAVY : WHITE, fontSize: 13, lineHeight: 1.5 }}>{m.text}</div></div>))}
        </div>
        <div style={{ padding: 12, borderTop: `1px solid ${TEAL}10`, display: "flex", gap: 8 }}>
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type your message..." style={{ ...styles.input, flex: 1, padding: "10px 14px", fontSize: 13 }} />
          <button onClick={send} style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})`, color: NAVY, fontSize: 18, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
        </div>
      </div>
    </div>
  );
}

function AccountScreen() {
  return (
    <div style={styles.screen}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: `linear-gradient(135deg, ${TEAL}30, ${ACCENT}15)`, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, border: `3px solid ${TEAL}40` }}>👤</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 2px" }}>Marcus Thompson</h2>
        <p style={{ fontSize: 13, color: GRAY, margin: 0 }}>Customer since January 2026</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10 }}><span style={styles.badge(TEAL)}>Gigabit Plan</span><span style={styles.badge(ACCENT)}>● Active</span></div>
      </div>
      <div style={styles.card}>
        <div style={styles.label}>Account Details</div>
        {[{ l: "Account ID", v: "TX-001-2026" },{ l: "Address", v: "15 Trafalgar Rd, New Kingston" },{ l: "Email", v: "marcus@email.com" },{ l: "Phone", v: "+1 876-555-0123" }].map((d, i) => (
          <div key={i} style={styles.listItem}><span style={{ fontSize: 12, color: GRAY }}>{d.l}</span><span style={{ fontSize: 13, fontWeight: 600 }}>{d.v}</span></div>
        ))}
      </div>
      <div style={styles.card}>
        <div style={styles.label}>Your Plan</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 12 }}>
          <div><div style={{ fontSize: 20, fontWeight: 800 }}>Tellinex Gigabit</div><div style={{ fontSize: 13, color: TEAL }}>1,000/1,000 Mbps • WiFi 6E</div></div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>J$7,500<span style={{ fontSize: 12, fontWeight: 500, color: GRAY }}>/mo</span></div>
        </div>
        <button style={{ ...styles.btn, ...styles.btnSecondary, borderRadius: 12 }}>Upgrade Plan →</button>
      </div>
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><div style={styles.label}>Refer a Friend</div><span style={{ fontSize: 22 }}>🎁</span></div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Earn J$1,000 credit</div>
        <div style={{ fontSize: 12, color: GRAY, marginBottom: 12 }}>Share your code and get credit when friends sign up</div>
        <div style={{ background: NAVY, borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px dashed ${TEAL}40` }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2, color: TEAL }}>MARCUS-TX25</span>
          <button style={{ background: `${TEAL}20`, border: "none", color: TEAL, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Copy</button>
        </div>
        <div style={{ fontSize: 11, color: GRAY, marginTop: 8 }}>3 friends referred • J$3,000 earned</div>
      </div>
      <div style={styles.card}>
        <div style={styles.label}>Connected Devices</div>
        {[{ n: "Marcus's iPhone", t: "WiFi 6E • 6GHz", s: true },{ n: "Living Room TV", t: "WiFi 6 • 5GHz", s: true },{ n: "PS5", t: "Ethernet • Cat 6", s: true },{ n: "Work Laptop", t: "WiFi 6E • 6GHz", s: false }].map((d, i) => (
          <div key={i} style={styles.listItem}><div><div style={{ fontSize: 13, fontWeight: 600 }}>{d.n}</div><div style={{ fontSize: 11, color: GRAY }}>{d.t}</div></div><span style={styles.badge(d.s ? ACCENT : GRAY)}>{d.s ? "● Online" : "○ Offline"}</span></div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const tabs = [{ id: "home", icon: "⌂", label: "Home" },{ id: "speed", icon: "⚡", label: "Speed" },{ id: "bill", icon: "💳", label: "Bills" },{ id: "support", icon: "💬", label: "Support" },{ id: "account", icon: "👤", label: "Account" }];
  return (
    <div style={styles.app}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}*{-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{width:0}body{margin:0;background:#060D18}`}</style>
      <div style={styles.statusBar}><span>9:41</span><span style={{ display: "flex", gap: 4, alignItems: "center" }}>📶 🔋</span></div>
      <div style={styles.header}>
        <div style={styles.logo}><div style={styles.logoIcon}>T</div><span style={styles.logoText}>Tellinex</span></div>
        <div style={styles.avatar}>👤</div>
      </div>
      {tab === "home" && <HomeScreen />}
      {tab === "speed" && <SpeedTestScreen />}
      {tab === "bill" && <BillScreen />}
      {tab === "support" && <SupportScreen />}
      {tab === "account" && <AccountScreen />}
      <div style={styles.nav}>
        {tabs.map(t => (
          <div key={t.id} onClick={() => setTab(t.id)} style={{ ...styles.navItem, color: tab === t.id ? TEAL : GRAY }}>
            <span style={{ fontSize: 22, filter: tab === t.id ? `drop-shadow(0 0 6px ${TEAL}80)` : "none" }}>{t.icon}</span>
            <span>{t.label}</span>
            {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: 2, background: TEAL }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
