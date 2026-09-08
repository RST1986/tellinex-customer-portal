import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from './data/supabaseClient'
import { createAuthenticatedSupportTicket, loadAuthenticatedSupportTickets } from './data/support'

function Surface({ children, ...props }) {
  return <section {...props} style={{background:'var(--tlx-surface)',border:'1px solid var(--tlx-border)',borderRadius:'var(--tlx-radius-lg)',padding:'var(--tlx-space-5)',...props.style}}>{children}</section>
}

function Muted({ children }) {
  return <p style={{color:'var(--tlx-muted)',lineHeight:1.55}}>{children}</p>
}

export function ServicesTab({ enabled, service, status }) {
  const rows = status === 'live' && service
    ? [
        ['Plan', service.planName || 'Not available'],
        ['Contracted download', service.speedDownMbps == null ? 'Not available' : `${service.speedDownMbps} Mb/s`],
        ['Contracted upload', service.speedUpMbps == null ? 'Not available' : `${service.speedUpMbps} Mb/s`],
        ['Subscription status', service.status || 'Not available'],
      ]
    : []

  return <div style={{padding:'28px 0 90px'}}>
    <div style={{fontSize:12,color:'var(--tlx-muted)',letterSpacing:'.08em',textTransform:'uppercase'}}>Services</div>
    <h1 style={{fontSize:'clamp(28px,5vw,42px)',margin:'8px 0 10px'}}>Your Tellinex service</h1>
    <Muted>Plan and contracted service details are separate from live network health and measured throughput.</Muted>

    {!enabled && <Surface aria-label="Service integration status" style={{marginTop:20}}>
      <strong>Live service data is disabled in this build.</strong>
      <Muted>No subscription data is requested until the controlled feature flag is enabled.</Muted>
    </Surface>}

    {enabled && status === 'loading' && <Surface aria-live="polite" style={{marginTop:20}}>Loading your service…</Surface>}
    {enabled && status === 'unavailable' && <Surface aria-live="polite" style={{marginTop:20}}>
      <strong>Service details are unavailable.</strong>
      <Muted>Network-health claims are not inferred from missing subscription data.</Muted>
    </Surface>}

    {rows.length > 0 && <div className="tlx-grid" style={{marginTop:20}}>
      {rows.map(([label,value]) => <Surface key={label} className="tlx-col-6">
        <div style={{fontSize:12,color:'var(--tlx-muted)',marginBottom:6}}>{label}</div>
        <div style={{fontSize:20,fontWeight:700}}>{value}</div>
      </Surface>)}
    </div>}

    <Surface style={{marginTop:20}}>
      <strong>Network health</strong>
      <Muted>Pending telemetry binding. MyTellinex will not infer outages from a city, parish or address match.</Muted>
    </Surface>
  </div>
}

function TicketRow({ ticket }) {
  return <Surface>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'baseline',flexWrap:'wrap'}}>
      <strong>{ticket.subject}</strong>
      <span style={{fontSize:12,color:'var(--tlx-muted)',textTransform:'capitalize'}}>{ticket.status || 'open'}</span>
    </div>
    <div style={{fontSize:12,color:'var(--tlx-muted)',marginTop:8}}>
      {[ticket.ticket_type, ticket.priority, ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('en-JM') : null].filter(Boolean).join(' · ')}
    </div>
  </Surface>
}

export function SupportTab({ enabled }) {
  const [tickets, setTickets] = useState([])
  const [status, setStatus] = useState(enabled ? 'loading' : 'off')
  const [subject, setSubject] = useState('')
  const [ticketType, setTicketType] = useState('general')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    if (!enabled) {
      setTickets([])
      setStatus('off')
      return () => { cancelled = true }
    }

    setStatus('loading')
    const load = async () => {
      try {
        const rows = await loadAuthenticatedSupportTickets(getSupabaseBrowserClient())
        if (cancelled) return
        setTickets(rows)
        setStatus('live')
      } catch {
        if (cancelled) return
        setTickets([])
        setStatus('unavailable')
      }
    }
    load()
    return () => { cancelled = true }
  }, [enabled])

  const submitTicket = async (event) => {
    event.preventDefault()
    if (!enabled || submitting) return
    setSubmitting(true)
    setNotice('')
    try {
      const ticket = await createAuthenticatedSupportTicket(getSupabaseBrowserClient(), {
        subject,
        ticketType,
        description,
        priority: 'normal',
      })
      setTickets(current => [ticket, ...current.filter(item => item.id !== ticket.id)])
      setSubject('')
      setDescription('')
      setTicketType('general')
      setStatus('live')
      setNotice('Support request created.')
    } catch {
      setNotice('Support request could not be created. Try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  return <div style={{padding:'28px 0 90px'}}>
    <div style={{fontSize:12,color:'var(--tlx-muted)',letterSpacing:'.08em',textTransform:'uppercase'}}>Support</div>
    <h1 style={{fontSize:'clamp(28px,5vw,42px)',margin:'8px 0 10px'}}>Get help</h1>
    <Muted>Support remains available independently of billing, network-health or add-on commerce.</Muted>

    {!enabled && <Surface style={{marginTop:20}}>
      <strong>Live support is disabled in this build.</strong>
      <Muted>No ticket data is requested and no ticket can be created until the controlled feature flag is enabled.</Muted>
    </Surface>}

    {enabled && <form onSubmit={submitTicket} style={{marginTop:20}}>
      <Surface>
        <h2 style={{fontSize:20,margin:'0 0 16px'}}>Create a support request</h2>
        <label style={{display:'grid',gap:6,marginBottom:14}}>
          <span style={{fontSize:13,fontWeight:700}}>Subject</span>
          <input value={subject} onChange={event => setSubject(event.target.value)} required maxLength={160} style={{padding:12,border:'1px solid var(--tlx-border)',borderRadius:'var(--tlx-radius-md)',background:'var(--tlx-bg)',color:'var(--tlx-text)'}} />
        </label>
        <label style={{display:'grid',gap:6,marginBottom:14}}>
          <span style={{fontSize:13,fontWeight:700}}>Type</span>
          <select value={ticketType} onChange={event => setTicketType(event.target.value)} style={{padding:12,border:'1px solid var(--tlx-border)',borderRadius:'var(--tlx-radius-md)',background:'var(--tlx-bg)',color:'var(--tlx-text)'}}>
            <option value="general">General</option>
            <option value="outage">Outage</option>
            <option value="slow_speed">Slow speed</option>
            <option value="billing">Billing</option>
            <option value="installation">Installation</option>
          </select>
        </label>
        <label style={{display:'grid',gap:6,marginBottom:14}}>
          <span style={{fontSize:13,fontWeight:700}}>Details</span>
          <textarea value={description} onChange={event => setDescription(event.target.value)} rows={5} maxLength={4000} style={{padding:12,border:'1px solid var(--tlx-border)',borderRadius:'var(--tlx-radius-md)',background:'var(--tlx-bg)',color:'var(--tlx-text)',resize:'vertical'}} />
        </label>
        <button type="submit" disabled={submitting} style={{border:0,borderRadius:'var(--tlx-radius-md)',background:'var(--tlx-primary)',color:'var(--tlx-primary-contrast)',padding:'11px 15px',fontWeight:700,cursor:submitting?'wait':'pointer'}}>{submitting ? 'Creating…' : 'Create request'}</button>
        {notice && <p aria-live="polite" style={{fontSize:13,color:'var(--tlx-muted)',margin:'12px 0 0'}}>{notice}</p>}
      </Surface>
    </form>}

    {enabled && <section aria-label="Your support requests" style={{marginTop:24}}>
      <h2 style={{fontSize:20,margin:'0 0 12px'}}>Your requests</h2>
      {status === 'loading' && <Muted>Loading support requests…</Muted>}
      {status === 'unavailable' && <Muted>Support requests are unavailable right now.</Muted>}
      {status === 'live' && tickets.length === 0 && <Muted>No support requests yet.</Muted>}
      {tickets.length > 0 && <div style={{display:'grid',gap:10}}>{tickets.map(ticket => <TicketRow key={ticket.id} ticket={ticket} />)}</div>}
    </section>}
  </div>
}
