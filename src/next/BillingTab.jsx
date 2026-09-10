import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from './data/supabaseClient'
import { loadAuthenticatedAccountBilling } from './data/accountBilling'
import { TlxEmptyState } from './registry/TlxEmptyState'
import { TlxStatusBadge } from './registry/TlxStatusBadge'
import { TlxSurfaceCard as Surface } from './registry/TlxSurfaceCard'

function Muted({ children }) {
  return <p style={{color:'var(--tlx-muted)',lineHeight:1.55}}>{children}</p>
}

function formatMoney(amount, currency) {
  if (amount == null) return 'Not available'
  const value = Number(amount)
  if (!Number.isFinite(value)) return 'Not available'
  try {
    return new Intl.NumberFormat('en-JM', { style:'currency', currency:currency || 'JMD', maximumFractionDigits:2 }).format(value)
  } catch {
    return `${currency || 'JMD'} ${value.toFixed(2)}`
  }
}

function formatDate(value) {
  if (!value) return 'Not available'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return new Intl.DateTimeFormat('en-JM', { day:'numeric', month:'short', year:'numeric' }).format(date)
}

function billStatusTone(status) {
  switch (String(status || '').toLowerCase()) {
    case 'paid':
    case 'settled':
      return 'success'
    case 'overdue':
    case 'failed':
      return 'danger'
    case 'due':
    case 'pending':
    case 'open':
      return 'warning'
    default:
      return 'neutral'
  }
}

function formatStatusLabel(status) {
  const value = String(status || '').trim()
  if (!value) return 'Status unavailable'
  return value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function BillRow({ bill }) {
  return <Surface>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'baseline',flexWrap:'wrap'}}>
      <strong>{formatMoney(bill.amount, bill.currency)}</strong>
      <TlxStatusBadge tone={billStatusTone(bill.status)}>{formatStatusLabel(bill.status)}</TlxStatusBadge>
    </div>
    <div style={{fontSize:12,color:'var(--tlx-muted)',marginTop:8}}>Due {formatDate(bill.due_date)}</div>
  </Surface>
}

export default function BillingTab({ enabled }) {
  const [bills, setBills] = useState([])
  const [status, setStatus] = useState(enabled ? 'loading' : 'off')

  useEffect(() => {
    let cancelled = false
    if (!enabled) {
      setBills([])
      setStatus('off')
      return () => { cancelled = true }
    }

    setStatus('loading')
    const load = async () => {
      try {
        const result = await loadAuthenticatedAccountBilling(getSupabaseBrowserClient())
        if (cancelled) return
        setBills(result?.bills ?? [])
        setStatus('live')
      } catch {
        if (cancelled) return
        setBills([])
        setStatus('unavailable')
      }
    }
    load()
    return () => { cancelled = true }
  }, [enabled])

  const latest = bills[0] ?? null

  return <div style={{padding:'28px 0 90px'}}>
    <div style={{fontSize:12,color:'var(--tlx-muted)',letterSpacing:'.08em',textTransform:'uppercase'}}>Billing</div>
    <h1 style={{fontSize:'clamp(28px,5vw,42px)',margin:'8px 0 10px'}}>Your bills</h1>
    <Muted>Billing is customer-scoped and read-only in this slice. Payment-provider identifiers and internal billing metadata are not requested.</Muted>

    {!enabled && <Surface style={{marginTop:20}}>
      <strong>Live billing is disabled in this build.</strong>
      <Muted>No billing rows are requested until the controlled Account + Billing feature flag is enabled.</Muted>
    </Surface>}

    {enabled && status === 'loading' && <Surface aria-live="polite" style={{marginTop:20}}>Loading your bills…</Surface>}

    {enabled && status === 'unavailable' && <Surface aria-live="polite" style={{marginTop:20}}>
      <strong>Billing is unavailable.</strong>
      <Muted>MyTellinex will not fall back to prototype bill amounts while live billing is enabled.</Muted>
    </Surface>}

    {enabled && status === 'live' && <>
      <div className="tlx-grid" style={{marginTop:20}}>
        <Surface className="tlx-col-6">
          <div style={{fontSize:12,color:'var(--tlx-muted)',marginBottom:6}}>Latest bill</div>
          <div style={{fontSize:24,fontWeight:700}}>{latest ? formatMoney(latest.amount, latest.currency) : 'No bills yet'}</div>
        </Surface>
        <Surface className="tlx-col-6">
          <div style={{fontSize:12,color:'var(--tlx-muted)',marginBottom:6}}>Due date</div>
          <div style={{fontSize:20,fontWeight:700}}>{latest ? formatDate(latest.due_date) : 'Not applicable'}</div>
        </Surface>
      </div>

      <section aria-label="Billing history" style={{marginTop:24}}>
        <h2 style={{fontSize:20,margin:'0 0 12px'}}>Billing history</h2>
        {bills.length === 0 && <TlxEmptyState title="No billing records yet." description="No billing records are available for this authenticated account yet." />}
        {bills.length > 0 && <div style={{display:'grid',gap:10}}>{bills.map((bill,index) => <BillRow key={`${bill.due_date || 'bill'}-${index}`} bill={bill} />)}</div>}
      </section>
    </>}

    <Surface style={{marginTop:20}}>
      <strong>Payment actions</strong>
      <Muted>Payment and auto-pay mutation are not enabled by this read-only Billing slice.</Muted>
    </Surface>
  </div>
}