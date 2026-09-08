import { useEffect, useMemo, useState } from 'react'
import './txs.css'
import { HOME_STATES, homeFixtures } from './homeModel'
import { getSupabaseBrowserClient } from './data/supabaseClient'
import { loadAuthenticatedAccountBilling, toHomeBillingFacts } from './data/accountBilling'
import { firstName, maskAccountBillingFacts, projectLiveAccountBilling } from './data/liveAccountBilling'
import { loadAuthenticatedService, toServiceSummary } from './data/service'
import { NetworkTab, ServicesTab, SupportTab } from './CustomerTabs'
import BillingTab from './BillingTab'

const toneVar = {
  success: 'var(--tlx-success)',
  warning: 'var(--tlx-warning)',
  danger: 'var(--tlx-danger)',
}

const Button = ({ children, onClick, primary = false }) => (
  <button type="button" onClick={onClick} style={{border:'1px solid var(--tlx-border)',borderRadius:'var(--tlx-radius-md)',background:primary?'var(--tlx-primary)':'var(--tlx-surface-2)',color:primary?'var(--tlx-primary-contrast)':'var(--tlx-text)',padding:'10px 14px',fontWeight:700,cursor:'pointer'}}>{children}</button>
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

function ServiceSummary({ service, status }) {
  if (status === 'off') return null

  const rows = status === 'live' && service
    ? [
        ['Plan', service.planName || 'Not available'],
        ['Download', service.speedDownMbps == null ? 'Not available' : `${service.speedDownMbps} Mb/s`],
        ['Upload', service.speedUpMbps == null ? 'Not available' : `${service.speedUpMbps} Mb/s`],
        ['Status', service.status || 'Not available'],
      ]
    : [
        ['Plan', status === 'loading' ? 'Loading…' : 'Unavailable'],
        ['Download', '—'],
        ['Upload', '—'],
        ['Status', status === 'loading' ? 'Loading…' : 'Unavailable'],
      ]

  return <section aria-label="Your service" style={{marginBottom:20}}>
    <div style={{fontSize:12,color:'var(--tlx-muted)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:10}}>Your service</div>
    <div className="tlx-grid">
      {rows.map(([label,value]) => <div key={label} className="tlx-col-3" style={{background:'var(--tlx-surface)',border:'1px solid var(--tlx-border)',borderRadius:'var(--tlx-radius-lg)',padding:'var(--tlx-space-5)'}}>
        <div style={{fontSize:12,color:'var(--tlx-muted)',marginBottom:6}}>{label}</div>
        <div style={{fontSize:17,fontWeight:700,lineHeight:1.3}}>{value}</div>
      </div>)}
    </div>
    <p style={{fontSize:12,color:'var(--tlx-muted)',margin:'10px 0 0'}}>Contracted service details only · live network health remains pending integration.</p>
  </section>
}

function WifiImprovementSheet({ onClose }) {
  return <section role="dialog" aria-modal="true" aria-labelledby="wifi-offer-title" style={{position:'fixed',inset:0,zIndex:30,display:'grid',alignItems:'end',background:'rgba(0,0,0,.48)'}}>
    <div style={{background:'var(--tlx-bg)',borderTop:'1px solid var(--tlx-border)',padding:'24px max(20px,calc((100vw - 760px)/2)) 30px'}}>
      <div style={{fontSize:12,color:'var(--tlx-muted)',letterSpacing:'.08em',textTransform:'uppercase'}}>Network · optional improvement</div>
      <h2 id="wifi-offer-title" style={{fontSize:26,margin:'8px 0 10px'}}>Improve Wi-Fi coverage in your home</h2>
      <p style={{maxWidth:720,color:'var(--tlx-muted)',lineHeight:1.6,margin:'0 0 14px'}}>Your fibre line is working. Some devices have weak Wi-Fi coverage. A Tellinex-supported extender or managed mesh may improve in-home coverage.</p>
      <div style={{background:'var(--tlx-surface)',border:'1px solid var(--tlx-border)',borderRadius:'var(--tlx-radius-lg)',padding:'var(--tlx-space-5)',marginBottom:16}}>
        <strong>This is optional.</strong>
        <p style={{margin:'6px 0 0',color:'var(--tlx-muted)',lineHeight:1.55}}>This does not change your broadband plan, guarantee contracted WAN speed, fix a street outage, or replace outage and fault support.</p>
      </div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <Button primary onClick={onClose}>View options later</Button>
        <Button onClick={onClose}>Dismiss</Button>
        <Button onClick={onClose}>Don’t show again</Button>
      </div>
      <p style={{fontSize:12,color:'var(--tlx-muted)',margin:'14px 0 0'}}>Prototype only · checkout disabled · READY_FOR_PRODUCTION = NO</p>
    </div>
  </section>
}

function ActionRail({ actions, state, onWifiImprove }) {
  if (!actions.length) return <p style={{margin:'4px 0 22px',color:'var(--tlx-muted)',fontSize:13}}>Nothing needs your attention.</p>
  return <section aria-label="Contextual actions" style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:26}}>
    {actions.slice(0,3).map(action => {
      const wifiAction = state === HOME_STATES.WIFI_WEAK && action === 'Improve Wi-Fi'
      return <Button key={action} onClick={wifiAction ? onWifiImprove : undefined}>{wifiAction ? 'Improve Wi-Fi coverage' : action}</Button>
    })}
  </section>
}

function PendingTab({ tab }) {
  return <div style={{padding:'28px 0 90px'}}>
    <div style={{fontSize:12,color:'var(--tlx-muted)',letterSpacing:'.08em',textTransform:'uppercase'}}>{tab}</div>
    <h1 style={{fontSize:'clamp(28px,5vw,42px)',margin:'8px 0 10px'}}>{tab[0] + tab.slice(1).toLowerCase()}</h1>
    <section style={{background:'var(--tlx-surface)',border:'1px solid var(--tlx-border)',borderRadius:'var(--tlx-radius-lg)',padding:'var(--tlx-space-5)',marginTop:20}}>
      <strong>Pending approved live contract.</strong>
      <p style={{color:'var(--tlx-muted)',lineHeight:1.55,marginBottom:0}}>MyTellinex will not substitute prototype or global operational data for customer-scoped information.</p>
    </section>
  </div>
}

const tabs = ['HOME','NETWORK','SERVICES','USAGE','BILLING','SUPPORT']

export default function MyTellinexNext(){
  const [activeTab, setActiveTab] = useState('HOME')
  const [state, setState] = useState(HOME_STATES.HEALTHY)
  const [wifiSheetOpen, setWifiSheetOpen] = useState(false)
  const [liveBilling, setLiveBilling] = useState(null)
  const [liveBillingStatus, setLiveBillingStatus] = useState('off')
  const [liveService, setLiveService] = useState(null)
  const [liveServiceStatus, setLiveServiceStatus] = useState('off')
  const liveAccountBillingEnabled = import.meta.env.VITE_MYTELLINEX_LIVE_ACCOUNT_BILLING === 'true'
  const liveServiceEnabled = import.meta.env.VITE_MYTELLINEX_LIVE_SERVICE === 'true'
  const liveSupportEnabled = import.meta.env.VITE_MYTELLINEX_LIVE_SUPPORT === 'true'
  const liveNetworkHealthEnabled = import.meta.env.VITE_MYTELLINEX_LIVE_NETWORK_HEALTH === 'true'

  useEffect(() => {
    let cancelled = false

    if (!liveAccountBillingEnabled) {
      setLiveBilling(null)
      setLiveBillingStatus('off')
      return () => { cancelled = true }
    }

    setLiveBillingStatus('loading')

    const loadLiveBilling = async () => {
      try {
        const client = getSupabaseBrowserClient()
        const result = await loadAuthenticatedAccountBilling(client)
        if (cancelled) return
        setLiveBilling(toHomeBillingFacts(result))
        setLiveBillingStatus('live')
      } catch {
        if (cancelled) return
        setLiveBilling(null)
        setLiveBillingStatus('unavailable')
      }
    }

    loadLiveBilling()
    return () => { cancelled = true }
  }, [liveAccountBillingEnabled])

  useEffect(() => {
    let cancelled = false

    if (!liveServiceEnabled) {
      setLiveService(null)
      setLiveServiceStatus('off')
      return () => { cancelled = true }
    }

    setLiveServiceStatus('loading')

    const loadLiveService = async () => {
      try {
        const client = getSupabaseBrowserClient()
        const result = await loadAuthenticatedService(client)
        if (cancelled) return
        setLiveService(toServiceSummary(result))
        setLiveServiceStatus(result ? 'live' : 'unavailable')
      } catch {
        if (cancelled) return
        setLiveService(null)
        setLiveServiceStatus('unavailable')
      }
    }

    loadLiveService()
    return () => { cancelled = true }
  }, [liveServiceEnabled])

  const prototypeModel = useMemo(() => homeFixtures[state], [state])
  const liveDataEnabled = liveAccountBillingEnabled || liveServiceEnabled || liveNetworkHealthEnabled
  const model = useMemo(() => {
    if (liveDataEnabled && (liveBillingStatus === 'loading' || liveBillingStatus === 'unavailable' || liveBillingStatus === 'off')) {
      return maskAccountBillingFacts(prototypeModel, liveBillingStatus === 'loading' ? 'loading' : 'unavailable')
    }
    if (liveBillingStatus === 'live') return projectLiveAccountBilling(prototypeModel, liveBilling)
    return prototypeModel
  }, [prototypeModel, liveBilling, liveBillingStatus, liveDataEnabled])

  const greetingName = liveBillingStatus === 'live' ? firstName(liveBilling?.customerName) : null
  const liveParts = []
  if (liveBillingStatus === 'live') liveParts.push('Account + Billing live')
  if (liveServiceStatus === 'live') liveParts.push('Service live')
  if (liveSupportEnabled) liveParts.push('Support enabled')
  if (liveNetworkHealthEnabled) liveParts.push('Network snapshot enabled')
  const runtimeLabel = liveParts.length
    ? `${liveParts.join(' · ')} · Home health pending producer`
    : liveDataEnabled
      ? 'Live customer data loading/unavailable · Home health pending producer'
      : 'Prototype state · no production telemetry'

  const changeState = (nextState) => {
    setWifiSheetOpen(false)
    setState(nextState)
  }

  const homeContent = <>
    <div style={{fontSize:14,color:'var(--tlx-muted)',marginTop:16}}>{greetingName ? `Welcome back, ${greetingName}` : 'Welcome back'}</div>
    <HealthSentence text={liveDataEnabled ? 'Service health pending integration' : model.health} tone={liveDataEnabled ? 'warning' : model.tone} />
    <ExceptionStack items={liveDataEnabled ? [] : model.exceptions} />
    <ServiceSummary service={liveService} status={liveServiceStatus} />
    <FactRow facts={liveDataEnabled ? model.facts.map(([label,value]) => ['Internet','Wi-Fi','Devices','Usage'].includes(label) ? [label,'Pending integration'] : [label,value]) : model.facts} />
    <ActionRail actions={liveDataEnabled ? [] : model.actions} state={state} onWifiImprove={() => setWifiSheetOpen(true)} />

    {import.meta.env.DEV && !liveDataEnabled && <section aria-label="Prototype state selector" style={{borderTop:'1px solid var(--tlx-border)',paddingTop:18,marginTop:8,marginBottom:24}}>
      <div style={{fontSize:12,color:'var(--tlx-muted)',marginBottom:10}}>Prototype states</div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {Object.keys(homeFixtures).map(key => <button key={key} type="button" onClick={() => changeState(key)} style={{border:'1px solid var(--tlx-border)',background:key===state?'var(--tlx-primary)':'var(--tlx-surface)',color:key===state?'var(--tlx-primary-contrast)':'var(--tlx-text)',padding:'8px 10px',borderRadius:'var(--tlx-radius-md)',cursor:'pointer',fontSize:12,fontWeight:700}}>{key}</button>)}
      </div>
    </section>}
  </>

  return <div className="tlx-shell">
    <header style={{borderBottom:'1px solid var(--tlx-border)'}}>
      <div className="tlx-wrap" style={{paddingTop:18,paddingBottom:18,display:'flex',justifyContent:'space-between',alignItems:'center',gap:16}}>
        <div>
          <div style={{fontSize:12,color:'var(--tlx-muted)',letterSpacing:'.08em',textTransform:'uppercase'}}>MyTellinex</div>
          <div style={{fontSize:22,fontWeight:700,marginTop:4}}>{activeTab === 'HOME' ? 'Customer Home' : activeTab[0] + activeTab.slice(1).toLowerCase()}</div>
        </div>
        <div style={{fontSize:12,color:'var(--tlx-muted)'}}>{runtimeLabel}</div>
      </div>
    </header>

    <main className="tlx-wrap" style={{paddingTop:10}}>
      {activeTab === 'HOME' && homeContent}
      {activeTab === 'NETWORK' && <NetworkTab enabled={liveNetworkHealthEnabled} />}
      {activeTab === 'SERVICES' && <ServicesTab enabled={liveServiceEnabled} service={liveService} status={liveServiceStatus} />}
      {activeTab === 'BILLING' && <BillingTab enabled={liveAccountBillingEnabled} />}
      {activeTab === 'SUPPORT' && <SupportTab enabled={liveSupportEnabled} />}
      {!['HOME','NETWORK','SERVICES','BILLING','SUPPORT'].includes(activeTab) && <PendingTab tab={activeTab} />}
    </main>

    <nav aria-label="MyTellinex primary" style={{position:'sticky',bottom:0,borderTop:'1px solid var(--tlx-border)',background:'var(--tlx-bg)'}}>
      <div className="tlx-wrap" style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:4,paddingTop:10,paddingBottom:10}}>
        {tabs.map(tab => <button key={tab} type="button" onClick={() => { setWifiSheetOpen(false); setActiveTab(tab) }} aria-current={tab === activeTab ? 'page' : undefined} style={{border:0,background:tab===activeTab?'var(--tlx-surface-2)':'transparent',color:tab===activeTab?'var(--tlx-text)':'var(--tlx-muted)',padding:'10px 6px',borderRadius:'var(--tlx-radius-md)',fontSize:11,fontWeight:700,cursor:'pointer'}}>{tab}</button>)}
      </div>
    </nav>

    {import.meta.env.DEV && activeTab === 'HOME' && !liveDataEnabled && wifiSheetOpen && <WifiImprovementSheet onClose={() => setWifiSheetOpen(false)} />}
  </div>
}
