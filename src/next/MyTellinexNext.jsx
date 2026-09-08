import './txs.css'
import { ServiceCard } from './components/ServiceCard'
import { NetworkHealth } from './components/NetworkHealth'
import { BillSummary } from './components/BillSummary'

const Status = ({ children }) => <span style={{padding:'4px 10px',borderRadius:999,background:'rgba(34,197,94,.12)',color:'var(--tlx-success)',fontSize:12,fontWeight:700}}>{children}</span>
const Button = ({ children }) => <button type="button" style={{border:0,borderRadius:'var(--tlx-radius-md)',background:'var(--tlx-primary)',color:'var(--tlx-primary-contrast)',padding:'10px 14px',fontWeight:700,cursor:'pointer'}}>{children}</button>

export default function MyTellinexNext(){
  return <div className="tlx-shell">
    <header style={{borderBottom:'1px solid var(--tlx-border)'}}><div className="tlx-wrap" style={{paddingTop:18,paddingBottom:18,display:'flex',justifyContent:'space-between',alignItems:'center',gap:16}}><div><div style={{fontSize:12,color:'var(--tlx-muted)',letterSpacing:'.08em',textTransform:'uppercase'}}>MyTellinex</div><div style={{fontSize:22,fontWeight:700,marginTop:4}}>Your fibre service</div></div><Status>Online</Status></div></header>
    <main className="tlx-wrap" style={{paddingTop:24}}>
      <div className="tlx-grid">
        <div className="tlx-col-8"><ServiceCard title="Gigabit Fibre" subtitle="XGS-PON residential service" status={<Status>Connected</Status>} metrics={[{label:'Plan speed',value:'1 Gbps'},{label:'Technology',value:'XGS-PON'},{label:'Service state',value:'Online'}]} action={<Button>View service</Button>}/></div>
        <div className="tlx-col-4"><BillSummary amount="7,500" dueLabel="Due date pending live billing data" autopayLabel="Payment method pending integration" action={<Button>Billing</Button>}/></div>
        <div className="tlx-col-6"><NetworkHealth status="healthy" detail="Status surface is ready. Live network telemetry is not connected in this branch, so no synthetic outage or uptime values are shown." updatedAt="Preview data"/></div>
        <div className="tlx-col-6"><section style={{background:'var(--tlx-surface)',border:'1px solid var(--tlx-border)',borderRadius:'var(--tlx-radius-lg)',padding:'var(--tlx-space-5)'}}><div style={{fontSize:12,color:'var(--tlx-muted)'}}>Support</div><h2 style={{fontSize:18,margin:'6px 0 8px'}}>Help when you need it</h2><p style={{margin:'0 0 20px',color:'var(--tlx-muted)',fontSize:13,lineHeight:1.5}}>Support actions will connect to approved Tellinex channels. No simulated ticket state is presented.</p><Button>Open support</Button></section></div>
      </div>
    </main>
  </div>
}
