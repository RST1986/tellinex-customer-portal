import { useMemo, useState } from 'react'
import './txs.css'
import { HOME_STATES, homeFixtures } from './homeModel'

const toneVar = {
  success: 'var(--tlx-success)',
  warning: 'var(--tlx-warning)',
  danger: 'var(--tlx-danger)',
}

const Button = ({ children }) => (
  <button type="button" style={{border:'1px solid var(--tlx-border)',borderRadius:'var(--tlx-radius-md)',background:'var(--tlx-surface-2)',color:'var(--tlx-text)',padding:'10px 14px',fontWeight:700,cursor:'pointer'}}>{children}</button>
)

function HealthSentence({ text, tone }) {
  return <section aria-live="polite" style={{padding:'28px 0 22px'}}>
    <div style={{fontSize:12,color:'var(--tlx-muted)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>Service health</div>
    <h1 style={{fontSize:'clamp(30px,6vw,48px)',lineHeight:1.08,margin:0,maxWidth:760,letterSpacing:'-.03em'}}>{text}</h1>
    <div style={{width:44,height:4,borderRadius:999,background:toneVar[tone],marginTop:16}} aria-hidden="true" />
  </section>
}

function ExceptionStack({ items }) {
  if (!items.length) return null
  return <section aria-label="Things needing attention" style={{display:'grid',gap:10,marginBottom:20}}>
    {items.map((item) => <article key={item.title} style={{background:'var(--tlx-surface)',border:'1px solid var(--tlx-border)',borderRadius:'var(--tlx-radius-lg)',padding:'var(--tlx-space-5)'}}>
      <h2 style={{fontSize:17,margin:'0 0 6px'}}>{item.title}</h2>
      <p style={{margin:0,color:'var(--tlx-muted)',lineHeight:1.55,fontSize:14}}>{item.detail}</p>
    </article>)}
  </section>
}

function FactRow({ facts }) {
  return <section aria-label="Service facts" className="tlx-grid" style={{marginBottom:20}}>
    {facts.map(([label,value]) => <div key={label} className="tlx-col-4" style={{background:'var(--tlx-surface)',border:'1px solid var(--tlx-border)',borderRadius:'var(--tlx-radius-lg)',padding:'var(--tlx-space-5)'}}>
      <div style={{fontSize:12,color:'var(--tlx-muted)',marginBottom:6}}>{label}</div>
      <div style={{fontSize:17,fontWeight:700,lineHeight:1.3}}>{value}</div>
    </div>)}
  </section>
}

function ActionRail({ actions }) {
  if (!actions.length) return <p style={{margin:'4px 0 22px',color:'var(--tlx-muted)',fontSize:13}}>Nothing needs your attention.</p>
  return <section aria-label="Contextual actions" style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:26}}>
    {actions.slice(0,3).map(action => <Button key={action}>{action}</Button>)}
  </section>
}

const tabs = ['HOME','NETWORK','SERVICES','USAGE','BILLING','SUPPORT']

export default function MyTellinexNext(){
  const initialState = import.meta.env.DEV ? HOME_STATES.HEALTHY : HOME_STATES.HEALTHY
  const [state, setState] = useState(initialState)
  const model = useMemo(() => homeFixtures[state], [state])

  return <div className="tlx-shell">
    <header style={{borderBottom:'1px solid var(--tlx-border)'}}>
      <div className="tlx-wrap" style={{paddingTop:18,paddingBottom:18,display:'flex',justifyContent:'space-between',alignItems:'center',gap:16}}>
        <div>
          <div style={{fontSize:12,color:'var(--tlx-muted)',letterSpacing:'.08em',textTransform:'uppercase'}}>MyTellinex</div>
          <div style={{fontSize:22,fontWeight:700,marginTop:4}}>Customer Home</div>
        </div>
        <div style={{fontSize:12,color:'var(--tlx-muted)'}}>Prototype state · no production telemetry</div>
      </div>
    </header>

    <main className="tlx-wrap" style={{paddingTop:10}}>
      <div style={{fontSize:14,color:'var(--tlx-muted)',marginTop:16}}>Good evening, Rui</div>
      <HealthSentence text={model.health} tone={model.tone} />
      <ExceptionStack items={model.exceptions} />
      <FactRow facts={model.facts} />
      <ActionRail actions={model.actions} />

      {import.meta.env.DEV && <section aria-label="Prototype state selector" style={{borderTop:'1px solid var(--tlx-border)',paddingTop:18,marginTop:8,marginBottom:24}}>
        <div style={{fontSize:12,color:'var(--tlx-muted)',marginBottom:10}}>Prototype states</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {Object.keys(homeFixtures).map(key => <button key={key} type="button" onClick={() => setState(key)} style={{border:'1px solid var(--tlx-border)',background:key===state?'var(--tlx-primary)':'var(--tlx-surface)',color:key===state?'var(--tlx-primary-contrast)':'var(--tlx-text)',padding:'8px 10px',borderRadius:'var(--tlx-radius-md)',cursor:'pointer',fontSize:12,fontWeight:700}}>{key}</button>)}
        </div>
      </section>}
    </main>

    <nav aria-label="MyTellinex primary" style={{position:'sticky',bottom:0,borderTop:'1px solid var(--tlx-border)',background:'var(--tlx-bg)'}}>
      <div className="tlx-wrap" style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:4,paddingTop:10,paddingBottom:10}}>
        {tabs.map(tab => <button key={tab} type="button" style={{border:0,background:tab==='HOME'?'var(--tlx-surface-2)':'transparent',color:tab==='HOME'?'var(--tlx-text)':'var(--tlx-muted)',padding:'10px 6px',borderRadius:'var(--tlx-radius-md)',fontSize:11,fontWeight:700}}>{tab}</button>)}
      </div>
    </nav>
  </div>
}
