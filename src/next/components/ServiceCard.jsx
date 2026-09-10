import { TlxSurfaceCard } from '../registry/TlxSurfaceCard'

export function ServiceCard({ title, subtitle, status, metrics = [], action }) {
  return <TlxSurfaceCard title={title} description={subtitle}>
    {status && <div style={{marginBottom:16}}>{status}</div>}
    {metrics.length > 0 && <dl style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:12,margin:'0'}}>
      {metrics.map(m => <div key={m.label}>
        <dt style={{color:'var(--tlx-muted)',fontSize:12}}>{m.label}</dt>
        <dd style={{margin:'4px 0 0',fontSize:20,fontWeight:650}}>{m.value}</dd>
      </div>)}
    </dl>}
    {action && <div style={{marginTop:20}}>{action}</div>}
  </TlxSurfaceCard>
}
