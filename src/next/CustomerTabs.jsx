import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from './data/supabaseClient'
import { loadAuthenticatedNetworkHealth, toCustomerHealthModel } from './data/networkHealth'
import { createAuthenticatedSupportTicket, loadAuthenticatedSupportTickets } from './data/support'
import { TlxAlertBanner } from './registry/TlxAlertBanner'
import { TlxButton } from './registry/TlxButton'
import { TlxEmptyState } from './registry/TlxEmptyState'
import { TlxLoadingState } from './registry/TlxLoadingState'
import { TlxStatusBadge } from './registry/TlxStatusBadge'
import { TlxSurfaceCard as Surface } from './registry/TlxSurfaceCard'

function Muted({ children }) {
  return <p style={{color:'var(--tlx-muted)',lineHeight:1.55}}>{children}</p>
}

function formatHealthTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-JM', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }).format(date)
}

function healthTone(state) {
  switch (state) {
    case 'healthy':
      return 'success'
    case 'degraded':
      return 'warning'
    case 'outage':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function NetworkTab({ enabled }) {
  const [health, setHealth] = useState(null)
  const [status, setStatus] = useState(enabled ? 'loading' : 'off')

  useEffect(() => {
    let cancelled = false
    if (!enabled) {
      setHealth(null)
      setStatus('off')
      return () => { cancelled = true }
    }

    setStatus('loading')
    const load = async () => {
      try {
        const row = await loadAuthenticatedNetworkHealth(getSupabaseBrowserClient())
        if (cancelled) return
        setHealth(toCustomerHealthModel(row))
        setStatus('live')
      } catch {
        if (cancelled) return
        setHealth(null)
        setStatus('unavailable')
      }
    }
    load()
    return () => { cancelled = true }
  }, [enabled])

  const unknown = status === 'live' && (!health || health.state === 'unknown')
  const stateLabel = health?.state === 'healthy' ? 'Healthy'
    : health?.state === 'degraded' ? 'Degraded'
      : health?.state === 'outage' ? 'Outage'
        : 'Not yet verified'

  return <div style={{padding:'28px 0 90px'}}>
    <div style={{fontSize:12,color:'var(--tlx-muted)',letterSpacing:'.08em',textTransform:'uppercase'}}>Network</div>
    <h1 style={{fontSize:'clamp(28px,5vw,42px)',margin:'8px 0 10px'}}>Your network health</h1>
    <Muted>This surface uses only your authenticated customer health snapshot. It does not use global NOC metrics or location-based outage guesses.</Muted>

    {!enabled && <Surface style={{marginTop:20}}>
      <strong>Live network health is disabled in this build.</strong>
      <Muted>No customer health snapshot is requested until the controlled feature flag is enabled.</Muted>
    </Surface>}

    {enabled && status === 'loading' && <TlxLoadingState label="Checking your verified network health…" detail="Waiting for the authenticated customer health snapshot." style={{marginTop:20}} />}

    {enabled && status === 'unavailable' && <TlxAlertBanner tone="warning" title="Network health is unavailable." style={{marginTop:20}}>
      Missing telemetry is never interpreted as healthy service.
    </TlxAlertBanner>}

    {enabled && status === 'live' && <>
      <Surface aria-live="polite" style={{marginTop:20}}>
        <div style={{fontSize:12,color:'var(--tlx-muted)',marginBottom:8}}>Verified customer state</div>
        <TlxStatusBadge tone={healthTone(health?.state)}>{stateLabel}</TlxStatusBadge>
        <Muted>{unknown ? 'Tellinex does not yet have enough authoritative telemetry to verify your live service health.' : health.health}</Muted>
      </Surface>

      <div className="tlx-grid" style={{marginTop:12}}>
        <Surface className="tlx-col-6">
          <div style={{fontSize:12,color:'var(--tlx-muted)',marginBottom:6}}>Last verified update</div>
          <div style={{fontSize:17,fontWeight:700}}>{formatHealthTime(health?.updatedAt) || 'Not available'}</div>
        </Surface>
        <Surface className="tlx-col-6">
          <div style={{fontSize:12,color:'var(--tlx-muted)',marginBottom:6}}>Estimated resolution</div>
          <div style={{fontSize:17,fontWeight:700}}>{health?.state === 'outage' || health?.state === 'degraded' ? (formatHealthTime(health?.estimatedResolutionAt) || 'Not yet available') : 'Not applicable'}</div>
        </Surface>
      </div>

      <Surface style={{marginTop:12}}>
        <strong>What this does not mean</strong>
        <Muted>Contracted plan speed is not measured throughput. Wi-Fi quality is separate from Internet service health. An unresolved global incident is not shown here unless Tellinex has positively linked it to your service.</Muted>
      </Surface>
    </>}
  </div>
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

    {enabled && status === 'loading' && <TlxLoadingState label="Loading your service…" detail="Retrieving contracted service details for this authenticated account." style={{marginTop:20}} />}
    {enabled && status === 'unavailable' && <TlxAlertBanner tone="warning" title="Service details are unavailable." style={{marginTop:20}}>
      Network-health claims are not inferred from missing subscription data.
    </TlxAlertBanner>}

    {rows.length > 0 && <div className="tlx-grid" style={{marginTop:20}}>
      {rows.map(([label,value]) => <Surface key={label} className="tlx-col-6">
        <div style={{fontSize:12,color:'var(--tlx-muted)',marginBottom:6}}>{label}</div>
        <div style={{fontSize:20,fontWeight:700}}>{value}</div>
      </Surface>)}
    </div>}

    <Surface style={{marginTop:20}}>
      <strong>Network health</strong>
      <Muted>Network health has its own customer-scoped contract and remains separate from contracted service details.</Muted>
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
        <TlxButton type="submit" variant="primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create request'}</TlxButton>
        {notice && <p aria-live="polite" style={{fontSize:13,color:'var(--tlx-muted)',margin:'12px 0 0'}}>{notice}</p>}
      </Surface>
    </form>}

    {enabled && <section aria-label="Your support requests" style={{marginTop:24}}>
      <h2 style={{fontSize:20,margin:'0 0 12px'}}>Your requests</h2>
      {status === 'loading' && <TlxLoadingState label="Loading support requests…" detail="Retrieving support history for this authenticated account." lines={2} />}
      {status === 'unavailable' && <TlxAlertBanner tone="warning" title="Support requests are unavailable.">
        Existing support requests could not be loaded. This does not imply that your requests were deleted or closed.
      </TlxAlertBanner>}
      {status === 'live' && tickets.length === 0 && <TlxEmptyState title="No support requests yet." description="This authenticated account has no support requests yet." />}
      {tickets.length > 0 && <div style={{display:'grid',gap:10}}>{tickets.map(ticket => <TicketRow key={ticket.id} ticket={ticket} />)}</div>}
    </section>}
  </div>
}
