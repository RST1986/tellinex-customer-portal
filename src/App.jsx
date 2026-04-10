import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
// TELLINEX CUSTOMER APP — ISP BENCHMARK EDITION
// Benchmarked against: Sky My Sky, BT, Virgin Media, Hyperoptic
// Features: Dashboard, Speed Test, WiFi Management, Parental
// Controls, Bills, Support, Account, Engineer Tracking,
// Network Status, Loyalty Rewards
// ═══════════════════════════════════════════════════════════

const T = "#00C9A7", TD = "#00A88A", N = "#0A1628", NL = "#0F2035",
  NM = "#132840", A = "#00E88A", O = "#FF8C42", R = "#FF4757",
  W = "#F0F4F8", G = "#8A9BB0", P = "#7C5CFC", Y = "#FFD93D";

const s = {
  app: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: `linear-gradient(180deg,${N},#0D1F30)`, fontFamily: "'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: W, position: "relative" },
  bar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px 4px", fontSize: 12, fontWeight: 600, color: G },
  hdr: { padding: "8px 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  li: { width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T},${A})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: N },
  sc: { padding: "0 20px 120px" },
  cd: { background: `linear-gradient(135deg,${NL},${NM})`, borderRadius: 20, padding: 20, marginBottom: 14, border: `1px solid ${T}15`, position: "relative", overflow: "hidden" },
  gl: { position: "absolute", top: -50, right: -50, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle,${T}15 0%,transparent 70%)`, pointerEvents: "none" },
  lb: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: G, marginBottom: 6 },
  bn: { fontSize: 48, fontWeight: 800, letterSpacing: -2, lineHeight: 1, background: `linear-gradient(135deg,${T},${A})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  sr: { display: "flex", gap: 10, marginBottom: 14 },
  st: { flex: 1, background: NM, borderRadius: 16, padding: "14px 12px", border: `1px solid ${T}10` },
  sv: { fontSize: 20, fontWeight: 700, color: W, marginBottom: 2 },
  sl: { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: G },
  bt: { width: "100%", padding: "14px 20px", borderRadius: 14, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: -0.3 },
  bp: { background: `linear-gradient(135deg,${T},${A})`, color: N },
  bs: { background: NM, color: W, border: `1px solid ${T}30` },
  nv: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: `${N}F5`, backdropFilter: "blur(20px)", borderTop: `1px solid ${T}15`, display: "flex", justifyContent: "space-around", padding: "6px 0 26px", zIndex: 100 },
  ni: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 9, fontWeight: 600, cursor: "pointer", padding: "5px 8px" },
  pb: { height: 6, borderRadius: 3, background: NM, overflow: "hidden", marginTop: 8 },
  pf: (p, c) => ({ height: "100%", borderRadius: 3, width: `${p}%`, background: `linear-gradient(90deg,${c},${c}CC)`, transition: "width 1s ease" }),
  li2: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T}08` },
  bg: c => ({ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${c}20`, color: c }),
  inp: { width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${T}20`, background: NM, color: W, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  tog: on => ({ width: 44, height: 24, borderRadius: 12, background: on ? T : `${G}40`, cursor: "pointer", position: "relative", transition: "all 0.3s", border: "none" }),
  togK: on => ({ width: 20, height: 20, borderRadius: 10, background: W, position: "absolute", top: 2, left: on ? 22 : 2, transition: "all 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }),
};

const Toggle = ({ on, onChange }) => (
  <button style={s.tog(on)} onClick={() => onChange(!on)}><div style={s.togK(on)} /></button>
);

const H2 = ({ children }) => <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, margin: "0 0 4px", padding: "0 4px" }}>{children}</h2>;
const Sub = ({ children }) => <p style={{ fontSize: 12, color: G, margin: "0 0 16px", padding: "0 4px" }}>{children}</p>;

// ═══ SPEED GAUGE ═══
function Gauge({ value, max = 1000 }) {
  const p = Math.min(value / max * 100, 100);
  return (
    <div style={{ width: 180, height: 180, margin: "0 auto 16px", position: "relative" }}>
      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
        <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor={T} /><stop offset="100%" stopColor={A} /></linearGradient></defs>
        <circle cx="100" cy="100" r="85" fill="none" stroke={NM} strokeWidth="10" strokeLinecap="round" transform="rotate(-135 100 100)" strokeDasharray={`${270*3.14*85/180} ${360*3.14*85/180}`} />
        <circle cx="100" cy="100" r="85" fill="none" stroke="url(#sg)" strokeWidth="10" strokeLinecap="round" transform="rotate(-135 100 100)" strokeDasharray={`${p*2.7*3.14*85/180} ${360*3.14*85/180}`} style={{ transition: "stroke-dasharray 0.5s", filter: `drop-shadow(0 0 8px ${T}80)` }} />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div style={{ ...s.bn, fontSize: 44 }}>{value}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: G, marginTop: 2 }}>Mbps</div>
      </div>
    </div>
  );
}

// ═══ 1. DASHBOARD (Sky My Sky benchmark) ═══
function Dashboard({ nav }) {
  const [notif] = useState(2);
  return (
    <div style={s.sc}>
      {/* Connection Hero Card */}
      <div style={{ ...s.cd, background: `linear-gradient(135deg,${T}12,${NM})`, border: `1px solid ${T}25` }}>
        <div style={s.gl} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={s.lb}>Your Connection</div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1 }}>Gigabit Fibre</div>
            <div style={{ fontSize: 12, color: T, fontWeight: 600, marginTop: 2 }}>1,000 Mbps symmetrical • XGS-PON</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${A}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 22 }}>📶</span></div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={s.bg(A)}>● Online</span><span style={s.bg(T)}>WiFi 6E</span><span style={s.bg(P)}>6 devices</span>
        </div>
      </div>
      {/* Speed Summary */}
      <div style={s.sr}>
        <div style={s.st}><div style={{ ...s.sv, color: T }}>↓ 947</div><div style={s.sl}>Download</div></div>
        <div style={s.st}><div style={{ ...s.sv, color: A }}>↑ 891</div><div style={s.sl}>Upload</div></div>
        <div style={s.st}><div style={{ ...s.sv, color: O }}>2ms</div><div style={s.sl}>Latency</div></div>
      </div>
      {/* Bill Summary */}
      <div style={s.cd}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={s.lb}>Next Bill</div><div style={{ fontSize: 22, fontWeight: 700 }}>J$7,500</div><div style={{ fontSize: 11, color: G, marginTop: 2 }}>Due May 15 • Auto-pay ON ✓</div></div>
          <button onClick={() => nav("bill")} style={{ ...s.bt, ...s.bp, width: "auto", padding: "10px 20px", fontSize: 13 }}>View Bill</button>
        </div>
      </div>
      {/* Quick Actions Grid — Sky/BT benchmark */}
      <div style={s.cd}>
        <div style={s.lb}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
          {[{i:"⚡",l:"Speed Test",c:T,t:"speed"},{i:"📶",l:"WiFi",c:P,t:"wifi"},{i:"🛡",l:"Parental",c:O,t:"parental"},{i:"🔧",l:"Engineer",c:R,t:"engineer"},{i:"🎁",l:"Rewards",c:Y,t:"rewards"},{i:"📊",l:"Usage",c:A,t:"usage"}].map((a,i) => (
            <div key={i} onClick={() => nav(a.t)} style={{ background: `${a.c}10`, borderRadius: 14, padding: "14px 8px", textAlign: "center", cursor: "pointer", border: `1px solid ${a.c}12` }}>
              <span style={{ fontSize: 22 }}>{a.i}</span><div style={{ fontSize: 11, fontWeight: 600, marginTop: 6 }}>{a.l}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Network Status — Virgin Media benchmark */}
      <div style={s.cd}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><div style={s.lb}>Network Health</div><span style={s.bg(A)}>All Systems Go</span></div>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({length:24}).map((_,i) => <div key={i} style={{ flex: 1, height: 30, borderRadius: 3, background: `${A}${i > 20 ? '40' : '25'}`, display: "flex", alignItems: "flex-end" }}><div style={{ width: "100%", height: `${80+Math.random()*20}%`, background: `${A}50`, borderRadius: "2px 2px 0 0" }} /></div>)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: G, marginTop: 4 }}><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>Now</span></div>
        <div style={{ fontSize: 11, color: G, marginTop: 6, textAlign: "center" }}>99.98% uptime • 0 outages this month</div>
      </div>
      {/* Notifications */}
      {notif > 0 && <div style={{ ...s.cd, border: `1px solid ${O}30`, background: `linear-gradient(135deg,${O}08,${NM})` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 14, fontWeight: 700 }}>🔔 {notif} Notifications</div><div style={{ fontSize: 12, color: G, marginTop: 2 }}>Maintenance scheduled Apr 15 02:00-04:00</div></div>
          <span style={{ color: G, fontSize: 18 }}>→</span>
        </div>
      </div>}
    </div>
  );
}

// ═══ 2. SPEED TEST (Ookla/BT benchmark) ═══
function SpeedTest() {
  const [run, setRun] = useState(false), [spd, setSpd] = useState(0), [ph, setPh] = useState("idle"), [res, setRes] = useState(null);
  const ref = useRef(null);
  const go = () => {
    setRun(true); setSpd(0); setPh("download"); setRes(null); let v = 0;
    ref.current = setInterval(() => { v += Math.random()*120+30; if(v>945) v=940+Math.random()*18; setSpd(Math.round(v));
      if(v>940){ clearInterval(ref.current); const dl=Math.round(v); setPh("upload"); v=0;
        ref.current = setInterval(() => { v += Math.random()*100+25; if(v>885) v=880+Math.random()*12; setSpd(Math.round(v));
          if(v>880){ clearInterval(ref.current); setRes({dl,ul:Math.round(v),ping:2,jit:0.4}); setPh("done"); setRun(false); }
        },100); }
    },100);
  };
  useEffect(() => () => clearInterval(ref.current), []);
  return (
    <div style={s.sc}>
      <H2>Speed Test</H2><Sub>Test your Tellinex connection</Sub>
      <div style={{ ...s.cd, textAlign: "center", border: `1px solid ${T}30`, background: `linear-gradient(135deg,${T}10,${NM})` }}>
        <Gauge value={res ? res.dl : spd} />
        <div style={{ fontSize: 13, fontWeight: 700, color: ph==="download"?T:ph==="upload"?A:G, height: 20, marginBottom: 14 }}>
          {ph==="download"&&"↓ Testing Download..."}{ph==="upload"&&"↑ Testing Upload..."}{ph==="done"&&"✓ Complete"}{ph==="idle"&&"Ready"}
        </div>
        {!run && <button onClick={go} style={{ ...s.bt, ...s.bp, borderRadius: 50, padding: "16px 24px" }}>{res?"Test Again":"Start Test"}</button>}
        {run && <div style={s.pb}><div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg,${T},${A})`, animation: "pulse 1s infinite", width: "100%" }} /></div>}
      </div>
      {res && <><div style={s.sr}><div style={s.st}><div style={{...s.sv,color:T}}>↓ {res.dl}</div><div style={s.sl}>Download Mbps</div></div><div style={s.st}><div style={{...s.sv,color:A}}>↑ {res.ul}</div><div style={s.sl}>Upload Mbps</div></div></div>
      <div style={s.sr}><div style={s.st}><div style={{...s.sv,color:O}}>{res.ping}ms</div><div style={s.sl}>Ping</div></div><div style={s.st}><div style={{...s.sv,color:P}}>{res.jit}ms</div><div style={s.sl}>Jitter</div></div></div>
      {/* Plan comparison — BT benchmark */}
      <div style={s.cd}><div style={s.lb}>vs Your Plan</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}><span style={{ fontSize: 13 }}>Download</span><span style={{ fontSize: 13, fontWeight: 700 }}>{res.dl} / 1,000 Mbps</span></div>
        <div style={s.pb}><div style={s.pf(res.dl/10, T)} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}><span style={{ fontSize: 13 }}>Upload</span><span style={{ fontSize: 13, fontWeight: 700 }}>{res.ul} / 1,000 Mbps</span></div>
        <div style={s.pb}><div style={s.pf(res.ul/10, A)} /></div>
        <div style={{ marginTop: 12, padding: "10px 14px", background: `${A}10`, borderRadius: 10, fontSize: 12, color: A, fontWeight: 600 }}>✓ You are getting {Math.round(res.dl/10)}% of your plan speed — Excellent</div>
      </div></>}
    </div>
  );
}

// ═══ 3. WIFI MANAGEMENT (Sky/BT/Virgin benchmark) ═══
function WiFi() {
  const [guest, setGuest] = useState(false);
  const devices = [{n:"Marcus's iPhone",b:"6GHz",sig:95,dl:"124MB",on:true},{n:"Living Room TV",b:"5GHz",sig:88,dl:"2.1GB",on:true},{n:"PS5",b:"Ethernet",sig:100,dl:"890MB",on:true},{n:"Work Laptop",b:"6GHz",sig:92,dl:"340MB",on:true},{n:"Ring Doorbell",b:"2.4GHz",sig:76,dl:"45MB",on:true},{n:"Guest iPhone",b:"5GHz",sig:70,dl:"12MB",on:false}];
  return (
    <div style={s.sc}>
      <H2>WiFi Management</H2><Sub>Manage your home network</Sub>
      {/* Network Names */}
      <div style={s.cd}>
        <div style={s.lb}>Your Networks</div>
        {[{name:"TELLINEX-5G-A7C2",band:"WiFi 6E • 6GHz",sig:"Excellent"},{name:"TELLINEX-5G-A7C2",band:"WiFi 6 • 5GHz",sig:"Strong"},{name:"TELLINEX-A7C2",band:"WiFi 4 • 2.4GHz",sig:"Good"}].map((n,i) => (
          <div key={i} style={s.li2}><div><div style={{fontSize:13,fontWeight:600}}>{n.name}</div><div style={{fontSize:11,color:G}}>{n.band}</div></div><span style={s.bg(A)}>{n.sig}</span></div>
        ))}
        <button style={{ ...s.bt, ...s.bs, marginTop: 10, fontSize: 13 }}>Change WiFi Password</button>
      </div>
      {/* Guest Network — Sky Broadband Buddy benchmark */}
      <div style={s.cd}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 14, fontWeight: 700 }}>Guest Network</div><div style={{ fontSize: 12, color: G }}>TELLINEX-GUEST</div></div>
          <Toggle on={guest} onChange={setGuest} />
        </div>
        {guest && <div style={{ marginTop: 10, padding: 12, background: `${T}10`, borderRadius: 10, fontSize: 12, color: T }}>Guest network active • Isolated from main network</div>}
      </div>
      {/* Connected Devices — Virgin Media benchmark */}
      <div style={s.cd}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><div style={s.lb}>Connected Devices ({devices.filter(d=>d.on).length})</div></div>
        {devices.map((d,i) => (
          <div key={i} style={s.li2}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${d.on?T:G}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{d.b==="Ethernet"?"🔌":"📱"}</div>
              <div><div style={{fontSize:13,fontWeight:600}}>{d.n}</div><div style={{fontSize:11,color:G}}>{d.b} • {d.dl} today</div></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: NM }}><div style={{ height: "100%", borderRadius: 2, width: `${d.sig}%`, background: d.sig > 80 ? A : d.sig > 60 ? O : R }} /></div>
              <div style={{ fontSize: 9, color: G, marginTop: 2 }}>{d.sig}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ 4. PARENTAL CONTROLS (Sky Broadband Buddy benchmark) ═══
function Parental() {
  const [paused, setPaused] = useState(false);
  const profiles = [{n:"Jaylen",age:"12",bed:"9:00 PM",dl:"1.2GB",blocked:3,on:true},{n:"Amara",age:"8",bed:"8:00 PM",dl:"450MB",blocked:7,on:true}];
  return (
    <div style={s.sc}>
      <H2>Parental Controls</H2><Sub>Keep your family safe online</Sub>
      {/* Pause Internet — Sky Buddy core feature */}
      <div style={{ ...s.cd, border: `1px solid ${paused?R:T}30`, background: `linear-gradient(135deg,${paused?R:T}08,${NM})` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 16, fontWeight: 800 }}>{paused ? "⏸ Internet Paused" : "▶ Internet Active"}</div><div style={{ fontSize: 12, color: G, marginTop: 2 }}>{paused ? "All children devices paused" : "All devices connected normally"}</div></div>
          <button onClick={() => setPaused(!paused)} style={{ ...s.bt, width: "auto", padding: "10px 20px", fontSize: 13, background: paused ? `linear-gradient(135deg,${A},${T})` : `linear-gradient(135deg,${R},${O})`, color: paused ? N : W, border: "none" }}>{paused ? "Resume" : "Pause All"}</button>
        </div>
      </div>
      {/* Child Profiles */}
      {profiles.map((p,i) => (
        <div key={i} style={s.cd}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: `${P}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👦</div>
              <div><div style={{ fontSize: 15, fontWeight: 700 }}>{p.n}</div><div style={{ fontSize: 11, color: G }}>Age {p.age}</div></div>
            </div>
            <Toggle on={p.on} onChange={() => {}} />
          </div>
          <div style={s.sr}>
            <div style={{ ...s.st, padding: "10px" }}><div style={{ fontSize: 11, color: G }}>Bedtime</div><div style={{ fontSize: 14, fontWeight: 700 }}>{p.bed}</div></div>
            <div style={{ ...s.st, padding: "10px" }}><div style={{ fontSize: 11, color: G }}>Today</div><div style={{ fontSize: 14, fontWeight: 700 }}>{p.dl}</div></div>
            <div style={{ ...s.st, padding: "10px" }}><div style={{ fontSize: 11, color: G }}>Blocked</div><div style={{ fontSize: 14, fontWeight: 700, color: R }}>{p.blocked}</div></div>
          </div>
          <div style={{ fontSize: 11, color: G }}>Content filter: <span style={{ color: O, fontWeight: 600 }}>Age-appropriate</span> • Safe search: <span style={{ color: A, fontWeight: 600 }}>ON</span></div>
        </div>
      ))}
    </div>
  );
}

// ═══ 5. BILLS & PAYMENTS (Sky/BT benchmark) ═══
function Bills() {
  return (
    <div style={s.sc}>
      <H2>Billing</H2><Sub>Manage payments and view bills</Sub>
      <div style={{ ...s.cd, background: `linear-gradient(135deg,${T}12,${A}06)`, border: `1px solid ${T}30` }}>
        <div style={s.gl} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}><div><div style={s.lb}>Current Balance</div><div style={{ fontSize: 34, fontWeight: 800 }}>J$7,500</div></div><span style={s.bg(O)}>Due in 12 days</span></div>
        {/* Bill Breakdown — Sky benchmark */}
        <div style={{ background: `${N}80`, borderRadius: 12, padding: 12, marginTop: 8 }}>
          <div style={s.lb}>Bill Breakdown</div>
          {[{l:"Gigabit Fibre",v:"J$6,500"},{l:"WiFi 6E Router",v:"J$500"},{l:"Tellinex TV Basic",v:"J$500"},{l:"Referral credit",v:"-J$1,000",c:A}].map((b,i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}><span style={{ color: G }}>{b.l}</span><span style={{ fontWeight: 600, color: b.c || W }}>{b.v}</span></div>
          ))}
          <div style={{ borderTop: `1px solid ${T}20`, marginTop: 6, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800 }}><span>Total</span><span>J$6,500</span></div>
        </div>
      </div>
      {/* Payment Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <button style={{ ...s.bt, ...s.bp, borderRadius: 14 }}>💳 Pay Now</button>
        <button style={{ ...s.bt, ...s.bs, borderRadius: 14 }}>📱 Lynk Pay</button>
      </div>
      {/* Auto-pay — BT benchmark */}
      <div style={s.cd}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 14, fontWeight: 700 }}>Auto-Pay</div><div style={{ fontSize: 12, color: G }}>NCB Visa •••• 6234 • 15th monthly</div></div>
          <Toggle on={true} onChange={() => {}} />
        </div>
      </div>
      {/* Payment History */}
      <div style={s.cd}>
        <div style={s.lb}>Payment History</div>
        {[{d:"Mar 15",a:"J$7,500",m:"Auto-pay"},{d:"Feb 15",a:"J$7,500",m:"Auto-pay"},{d:"Jan 15",a:"J$7,500",m:"Auto-pay"},{d:"Dec 15",a:"J$5,000",m:"Lynk Pay"}].map((p,i) => (
          <div key={i} style={s.li2}><div><div style={{fontSize:13,fontWeight:600}}>{p.d}, 2026</div><div style={{fontSize:11,color:G}}>{p.m}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700}}>{p.a}</div><span style={s.bg(A)}>✓ Paid</span></div></div>
        ))}
      </div>
      <button style={{ ...s.bt, ...s.bs, borderRadius: 14 }}>📄 Download Invoice (PDF)</button>
    </div>
  );
}

// ═══ 6. SUPPORT (Sky/BT benchmark — fault diagnosis + chat) ═══
function Support() {
  const [msg, setMsg] = useState(""), [msgs, setMsgs] = useState([{f:"bot",t:"👋 Hi! I'm Tellinex AI. I can diagnose issues, book engineers, or answer questions. What can I help with?"}]);
  const send = () => { if(!msg.trim()) return; setMsgs(m=>[...m,{f:"user",t:msg}]); setMsg("");
    setTimeout(() => setMsgs(m=>[...m,{f:"bot",t:"I've run a quick diagnostic on your line. Everything looks healthy! Your ONT is online, signal levels are normal (-12.3 dBm), and WiFi is broadcasting on all 3 bands. Ticket #TX-2847 created for reference."}]), 1200);
  };
  return (
    <div style={s.sc}>
      <H2>Support</H2><Sub>We are here 24/7</Sub>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[{i:"📞",l:"Call",s:"876-555-0100"},{i:"💬",l:"WhatsApp",s:"Instant"},{i:"📧",l:"Email",s:"support@"}].map((c,i) => (
          <div key={i} style={{ ...s.cd, marginBottom: 0, textAlign: "center", cursor: "pointer", padding: 14 }}><span style={{fontSize:24}}>{c.i}</span><div style={{fontSize:12,fontWeight:700,marginTop:6}}>{c.l}</div><div style={{fontSize:10,color:T}}>{c.s}</div></div>
        ))}
      </div>
      {/* Fault Diagnosis Wizard — BT benchmark */}
      <div style={s.cd}>
        <div style={s.lb}>Quick Diagnosis</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          {["Slow speeds","No internet","WiFi dropping","Buffering"].map((f,i) => (
            <button key={i} style={{ ...s.bt, ...s.bs, padding: "10px 12px", fontSize: 12, borderRadius: 10 }}>{f}</button>
          ))}
        </div>
      </div>
      {/* AI Chat */}
      <div style={{ ...s.cd, padding: 0 }}>
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T}10`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 15, background: `linear-gradient(135deg,${T},${A})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: N }}>T</div>
          <div><div style={{fontSize:13,fontWeight:700}}>Tellinex AI</div><div style={{fontSize:10,color:A}}>● Online • avg 12 min response</div></div>
        </div>
        <div style={{ height: 200, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {msgs.map((m,i) => <div key={i} style={{display:"flex",justifyContent:m.f==="user"?"flex-end":"flex-start"}}><div style={{maxWidth:"80%",padding:"10px 12px",borderRadius:m.f==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.f==="user"?`linear-gradient(135deg,${T},${TD})`:NM,color:m.f==="user"?N:W,fontSize:12,lineHeight:1.5}}>{m.t}</div></div>)}
        </div>
        <div style={{ padding: 10, borderTop: `1px solid ${T}10`, display: "flex", gap: 6 }}>
          <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Describe your issue..." style={{...s.inp,flex:1,padding:"10px 12px",fontSize:12}} />
          <button onClick={send} style={{width:40,height:40,borderRadius:10,border:"none",background:`linear-gradient(135deg,${T},${A})`,color:N,fontSize:16,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
        </div>
      </div>
    </div>
  );
}

// ═══ 7. ACCOUNT (Sky/BT benchmark — plan + referral + contract) ═══
function Account() {
  return (
    <div style={s.sc}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: `linear-gradient(135deg,${T}30,${A}15)`, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, border: `3px solid ${T}40` }}>👤</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 2px" }}>Marcus Thompson</h2>
        <p style={{ fontSize: 12, color: G, margin: 0 }}>Customer since January 2026</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}><span style={s.bg(T)}>Gigabit</span><span style={s.bg(A)}>● Active</span><span style={s.bg(Y)}>VIP Gold</span></div>
      </div>
      <div style={s.cd}><div style={s.lb}>Account</div>
        {[{l:"Account ID",v:"TX-001-2026"},{l:"Address",v:"15 Trafalgar Rd, New Kingston"},{l:"Email",v:"marcus@email.com"},{l:"Phone",v:"+1 876-555-0123"},{l:"Contract",v:"Rolling monthly"}].map((d,i) => <div key={i} style={s.li2}><span style={{fontSize:11,color:G}}>{d.l}</span><span style={{fontSize:12,fontWeight:600}}>{d.v}</span></div>)}
      </div>
      <div style={s.cd}><div style={s.lb}>Your Plan</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, marginBottom: 10 }}>
          <div><div style={{fontSize:18,fontWeight:800}}>Tellinex Gigabit</div><div style={{fontSize:12,color:T}}>1,000/1,000 Mbps • WiFi 6E • Tellinex TV</div></div>
          <div style={{fontSize:20,fontWeight:800}}>J$7,500<span style={{fontSize:11,fontWeight:500,color:G}}>/mo</span></div>
        </div>
        <button style={{...s.bt,...s.bs,borderRadius:12,fontSize:13}}>View All Plans →</button>
      </div>
      {/* Referral — unique to Tellinex */}
      <div style={{...s.cd,border:`1px solid ${Y}20`,background:`linear-gradient(135deg,${Y}06,${NM})`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={s.lb}>Refer a Friend</div><span style={{fontSize:20}}>🎁</span></div>
        <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>Earn J$1,000 credit per referral</div>
        <div style={{fontSize:11,color:G,marginBottom:10}}>Your friend gets first month free too!</div>
        <div style={{background:N,borderRadius:12,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",border:`1px dashed ${T}40`}}>
          <span style={{fontSize:16,fontWeight:800,letterSpacing:2,color:T}}>MARCUS-TX25</span>
          <button style={{background:`${T}20`,border:"none",color:T,padding:"6px 12px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer"}}>Copy</button>
        </div>
        <div style={{fontSize:11,color:G,marginTop:6}}>3 referred • J$3,000 earned</div>
      </div>
    </div>
  );
}

// ═══ 8. ENGINEER VISITS (Sky/BT benchmark — book + track) ═══
function Engineer() {
  return (
    <div style={s.sc}>
      <H2>Engineer Visits</H2><Sub>Book, track and manage visits</Sub>
      <div style={{...s.cd,border:`1px solid ${T}30`,background:`linear-gradient(135deg,${T}08,${NM})`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={s.lb}>Next Visit</div><span style={s.bg(T)}>Confirmed</span>
        </div>
        <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>Installation Completion</div>
        <div style={{fontSize:13,color:G}}>📅 Thursday, Apr 17 • 9:00 AM - 12:00 PM</div>
        <div style={{fontSize:13,color:G,marginTop:4}}>👷 Technician: Andre Williams • ID: TX-ENG-04</div>
        <div style={{marginTop:12,display:"flex",gap:8}}>
          <button style={{...s.bt,...s.bp,flex:1,fontSize:12,padding:"10px"}}>📍 Track Engineer</button>
          <button style={{...s.bt,...s.bs,flex:1,fontSize:12,padding:"10px"}}>📅 Reschedule</button>
        </div>
      </div>
      {/* Visit Timeline */}
      <div style={s.cd}>
        <div style={s.lb}>Visit Timeline</div>
        {[{t:"Job assigned",d:"Apr 10",done:true},{t:"Parts confirmed",d:"Apr 11",done:true},{t:"Engineer dispatched",d:"Apr 17",done:false},{t:"Installation complete",d:"",done:false}].map((v,i) => (
          <div key={i} style={{display:"flex",gap:12,padding:"8px 0"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{width:20,height:20,borderRadius:10,background:v.done?T:`${G}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:v.done?N:G}}>{v.done?"✓":i+1}</div>
              {i<3&&<div style={{width:2,height:24,background:`${T}20`}} />}
            </div>
            <div><div style={{fontSize:13,fontWeight:600,color:v.done?W:`${G}80`}}>{v.t}</div>{v.d&&<div style={{fontSize:11,color:G}}>{v.d}</div>}</div>
          </div>
        ))}
      </div>
      <button style={{...s.bt,...s.bs,borderRadius:14}}>📞 Book New Visit</button>
    </div>
  );
}

// ═══ 9. REWARDS / LOYALTY (Sky VIP benchmark) ═══
function Rewards() {
  return (
    <div style={s.sc}>
      <H2>Tellinex Rewards</H2><Sub>Our way of saying thank you</Sub>
      <div style={{...s.cd,border:`1px solid ${Y}25`,background:`linear-gradient(135deg,${Y}10,${NM})`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><div style={s.lb}>Your Tier</div><div style={{fontSize:22,fontWeight:800,color:Y}}>⭐ Gold Member</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:24,fontWeight:800}}>2,450</div><div style={{fontSize:11,color:G}}>points</div></div>
        </div>
        <div style={s.pb}><div style={s.pf(65,Y)} /></div>
        <div style={{fontSize:11,color:G,marginTop:4}}>550 points to Platinum tier</div>
      </div>
      <div style={s.cd}><div style={s.lb}>Available Rewards</div>
        {[{r:"Free month broadband",p:"3,000 pts",i:"🌐"},{r:"Tellinex TV upgrade",p:"1,500 pts",i:"📺"},{r:"Speed boost weekend",p:"500 pts",i:"⚡"},{r:"J$500 bill credit",p:"1,000 pts",i:"💰"}].map((r,i) => (
          <div key={i} style={s.li2}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>{r.i}</span><div><div style={{fontSize:13,fontWeight:600}}>{r.r}</div><div style={{fontSize:11,color:Y}}>{r.p}</div></div></div><button style={{background:`${Y}20`,border:"none",color:Y,padding:"6px 12px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer"}}>Redeem</button></div>
        ))}
      </div>
      <div style={s.cd}><div style={s.lb}>How to Earn</div>
        {["Pay on time: 100 pts/month","Refer a friend: 500 pts","12 months loyalty: 1,000 pts","Speed test: 10 pts"].map((h,i) => <div key={i} style={{fontSize:12,color:G,padding:"6px 0",borderBottom:`1px solid ${T}06`}}>{h}</div>)}
      </div>
    </div>
  );
}

// ═══ 10. USAGE (Virgin Media benchmark) ═══
function Usage() {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const dl = [12,8,15,22,18,45,38];
  return (
    <div style={s.sc}>
      <H2>Usage</H2><Sub>Your bandwidth this week</Sub>
      <div style={s.sr}>
        <div style={s.st}><div style={{...s.sv,color:T}}>158 GB</div><div style={s.sl}>This month</div></div>
        <div style={s.st}><div style={{...s.sv,color:A}}>∞</div><div style={s.sl}>No data cap</div></div>
      </div>
      <div style={s.cd}>
        <div style={s.lb}>Daily Usage (GB)</div>
        <div style={{display:"flex",gap:6,alignItems:"flex-end",height:120,marginTop:8}}>
          {days.map((d,i) => <div key={i} style={{flex:1,textAlign:"center"}}>
            <div style={{height:100,display:"flex",alignItems:"flex-end"}}><div style={{width:"100%",height:`${dl[i]/45*100}%`,background:`linear-gradient(180deg,${T}80,${A}40)`,borderRadius:"4px 4px 0 0`,transition:"height 0.5s"}} /></div>
            <div style={{fontSize:9,color:G,marginTop:4}}>{d}</div>
            <div style={{fontSize:10,fontWeight:600,marginTop:1}}>{dl[i]}</div>
          </div>)}
        </div>
      </div>
      <div style={s.cd}><div style={s.lb}>Top Devices by Usage</div>
        {[{n:"PS5",u:"45 GB",p:28},{n:"Living Room TV",u:"38 GB",p:24},{n:"Work Laptop",u:"32 GB",p:20},{n:"Marcus's iPhone",u:"22 GB",p:14}].map((d,i) => (
          <div key={i} style={s.li2}><div><div style={{fontSize:13,fontWeight:600}}>{d.n}</div><div style={s.pb}><div style={s.pf(d.p*3, T)} /></div></div><span style={{fontSize:13,fontWeight:700,minWidth:50,textAlign:"right"}}>{d.u}</span></div>
        ))}
      </div>
    </div>
  );
}

// ═══ MAIN APP ═══
export default function App() {
  const [tab, setTab] = useState("home");
  const nav = useCallback((t) => setTab(t), []);
  const tabs = [{id:"home",i:"⌂",l:"Home"},{id:"speed",i:"⚡",l:"Speed"},{id:"wifi",i:"📶",l:"WiFi"},{id:"bill",i:"💳",l:"Bills"},{id:"account",i:"👤",l:"Account"}];
  const screens = {home:<Dashboard nav={nav}/>,speed:<SpeedTest/>,wifi:<WiFi/>,parental:<Parental/>,bill:<Bills/>,support:<Support/>,account:<Account/>,engineer:<Engineer/>,rewards:<Rewards/>,usage:<Usage/>};
  return (
    <div style={s.app}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}*{-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{width:0}body{margin:0;background:#060D18}`}</style>
      <div style={s.bar}><span>9:41</span><span>📶 🔋</span></div>
      <div style={s.hdr}>
        <div style={s.logo}><div style={s.li}>T</div><span style={{fontSize:18,fontWeight:700}}>Tellinex</span></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {!["home","speed","wifi","bill","account"].includes(tab) && <button onClick={()=>setTab("home")} style={{background:`${T}20`,border:"none",color:T,padding:"6px 10px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer"}}>← Back</button>}
          <div style={{width:36,height:36,borderRadius:18,background:NM,border:`2px solid ${T}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,cursor:"pointer"}} onClick={()=>setTab("support")}>💬</div>
        </div>
      </div>
      {screens[tab] || <Dashboard nav={nav} />}
      <div style={s.nv}>
        {tabs.map(t => (
          <div key={t.id} onClick={()=>setTab(t.id)} style={{...s.ni,color:tab===t.id?T:G}}>
            <span style={{fontSize:20,filter:tab===t.id?`drop-shadow(0 0 6px ${T}80)`:"none"}}>{t.i}</span>
            <span>{t.l}</span>{tab===t.id&&<div style={{width:4,height:4,borderRadius:2,background:T}} />}
          </div>
        ))}
      </div>
    </div>
  );
}
