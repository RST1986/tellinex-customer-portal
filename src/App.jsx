import { useState, useEffect, useRef } from 'react'

const SUPABASE_URL = 'https://egztpclpcnizcdtfugsv.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const ANTHROPIC_PROXY = 'https://tellinex-preview.netlify.app/.netlify/functions/ai-chat'

const supa = (table, query = '') => `${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`
const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }

// ============================================================
// LOGIN SCREEN
// ============================================================
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // login | register | forgot

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'register' ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password'
      const res = await fetch(`${SUPABASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.error || data.error_description) {
        setError(data.error_description || data.msg || data.error || 'Authentication failed')
      } else if (data.access_token) {
        localStorage.setItem('tellinex_session', JSON.stringify(data))
        onLogin(data)
      } else if (mode === 'register') {
        setMode('login')
        setError('')
        alert('Account created! Please check your email to confirm, then log in.')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #0A0F1C 0%, #0D1528 50%, #0A1A2E 100%)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeIn 0.5s ease-out' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1, marginBottom: 4 }}>
            <span style={{ color: '#00C2FF' }}>Tellinex</span>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase' }}>Customer Portal</div>
        </div>

        {/* Form Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '36px 32px', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, textAlign: 'center' }}>
            {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', outline: 'none', fontSize: 15 }}
                placeholder="you@email.com" />
            </div>

            {mode !== 'forgot' && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', outline: 'none', fontSize: 15 }}
                  placeholder={mode === 'register' ? 'Create a password' : 'Your password'} />
              </div>
            )}

            {error && <div style={{ padding: '10px 14px', background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)', borderRadius: 8, color: '#FF5252', fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? 'rgba(0,194,255,0.3)' : 'linear-gradient(135deg, #00C2FF, #0088CC)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s' }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            {mode === 'login' ? (
              <>
                <span onClick={() => setMode('forgot')} style={{ cursor: 'pointer', color: '#00C2FF' }}>Forgot password?</span>
                <span style={{ margin: '0 8px' }}>|</span>
                <span onClick={() => setMode('register')} style={{ cursor: 'pointer', color: '#00C2FF' }}>Create account</span>
              </>
            ) : (
              <span onClick={() => setMode('login')} style={{ cursor: 'pointer', color: '#00C2FF' }}>Back to sign in</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          Jamaica's first underground fibre broadband
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN PORTAL
// ============================================================
export default function App() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState('dashboard')
  const [customer, setCustomer] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('tellinex_session')
    if (saved) {
      try {
        const s = JSON.parse(saved)
        setSession(s)
      } catch {}
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (session) loadCustomerData()
  }, [session])

  const loadCustomerData = async () => {
    if (!session?.user?.email) return
    try {
      const [cRes, sRes, iRes, pRes] = await Promise.all([
        fetch(supa('customers', `email=eq.${encodeURIComponent(session.user.email)}&limit=1`), { headers }),
        fetch(supa('subscriptions', `order=created_at.desc&limit=1`), { headers }),
        fetch(supa('invoices', `order=created_at.desc&limit=20`), { headers }),
        fetch(supa('payments', `order=paid_at.desc&limit=20`), { headers })
      ])
      const customers = await cRes.json()
      if (customers.length > 0) setCustomer(customers[0])
      setSubscription((await sRes.json())[0] || null)
      setInvoices(await iRes.json())
      setPayments(await pRes.json())
    } catch (e) {
      console.error('Load error:', e)
    }
  }

  const logout = () => {
    localStorage.removeItem('tellinex_session')
    setSession(null)
    setCustomer(null)
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
  if (!session) return <LoginScreen onLogin={setSession} />

  const userName = session?.user?.user_metadata?.full_name || customer?.customer_name || session?.user?.email?.split('@')[0] || 'Customer'
  const plan = subscription?.plan_name || 'No active plan'
  const speed = subscription ? `${subscription.speed_down_mbps || '?'} Mbps` : '--'
  const monthlyPrice = subscription ? `$${parseFloat(subscription.monthly_price_usd || 0).toFixed(2)}` : '$0.00'
  const nextBill = subscription?.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'
  const acctStatus = customer?.status || 'pending'

  const statusColor = { active: '#00E676', pending: '#FFB300', suspended: '#FF5252', disconnected: '#888' }
  const badge = (text, color) => (
    <span style={{ background: color + '20', color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{text}</span>
  )

  // ======================== VIEWS ========================

  const DashboardView = () => (
    <div className="animate-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {userName}</h2>
      <p style={{ color: 'var(--text-dim)', marginBottom: 28, fontSize: 15 }}>Here's your account overview</p>

      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Your Plan" value={plan} sub={speed + ' symmetrical'} color="var(--accent)" />
        <StatCard label="Monthly Bill" value={monthlyPrice} sub={`Next: ${nextBill}`} color="var(--green)" />
        <StatCard label="Account Status" value={acctStatus} badge={badge(acctStatus, statusColor[acctStatus] || '#888')} color={statusColor[acctStatus]} />
        <StatCard label="Account #" value={customer?.account_number || 'Pending'} sub="Tellinex Jamaica" color="var(--purple)" />
      </div>

      {/* Quick Actions */}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: 'var(--text-dim)' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { icon: 'ð', label: 'View Bills', action: () => setView('bills') },
          { icon: 'ð', label: 'Upgrade Plan', action: () => setView('plans') },
          { icon: 'ð ', label: 'Report a Fault', action: () => setView('support') },
          { icon: 'ð¬', label: 'Chat with Opus', action: () => setView('support') },
          { icon: 'âï¸', label: 'Account Settings', action: () => setView('account') },
          { icon: 'ð', label: 'Speed Test', action: () => window.open('https://fast.com', '_blank') }
        ].map((item, i) => (
          <button key={i} onClick={item.action}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 14, transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--border-hover)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span> {item.label}
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: 'var(--text-dim)' }}>Recent Invoices</h3>
      <Card>
        {invoices.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>No invoices yet. Your first bill will appear here after activation.</div>
        ) : invoices.slice(0, 5).map((inv, i) => (
          <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <div style={{ fontWeight: 500 }}>{inv.invoice_number}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inv.period_start && inv.period_end ? `${new Date(inv.period_start).toLocaleDateString()} - ${new Date(inv.period_end).toLocaleDateString()}` : 'N/A'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 600 }}>${parseFloat(inv.total_usd || 0).toFixed(2)}</span>
              {badge(inv.status || 'draft', { paid: '#00E676', sent: '#42A5F5', overdue: '#FF5252', draft: '#888' }[inv.status] || '#888')}
            </div>
          </div>
        ))}
      </Card>
    </div>
  )

  const BillsView = () => (
    <div className="animate-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Bills & Payments</h2>
      <p style={{ color: 'var(--text-dim)', marginBottom: 28, fontSize: 15 }}>View your invoices and payment history</p>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: 'var(--text-dim)' }}>Invoices</h3>
      <Card>
        {invoices.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No invoices yet</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Invoice #', 'Period', 'Amount', 'Status', 'Due Date'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 500 }}>{inv.invoice_number}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13 }}>{inv.period_start ? `${new Date(inv.period_start).toLocaleDateString()} - ${new Date(inv.period_end).toLocaleDateString()}` : '--'}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>${parseFloat(inv.total_usd || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px 14px' }}>{badge(inv.status || 'draft', { paid: '#00E676', sent: '#42A5F5', overdue: '#FF5252', draft: '#888' }[inv.status] || '#888')}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13 }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '28px 0 14px', color: 'var(--text-dim)' }}>Payment History</h3>
      <Card>
        {payments.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No payments recorded yet</div>
        ) : payments.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < payments.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <div style={{ fontWeight: 500 }}>${parseFloat(p.amount_usd || 0).toFixed(2)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.payment_method || 'N/A'} {p.transaction_ref ? `- ${p.transaction_ref}` : ''}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {badge(p.status || 'completed', { completed: '#00E676', pending: '#FFB300', failed: '#FF5252', refunded: '#42A5F5' }[p.status] || '#888')}
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '--'}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )

  const PlansView = () => {
    const plans = [
      { name: 'Starter', speed: 100, price: 45, features: ['100 Mbps symmetrical', 'Wi-Fi 6E router included', 'No data caps', '24/7 support'] },
      { name: 'Performance', speed: 500, price: 65, popular: true, features: ['500 Mbps symmetrical', 'Wi-Fi 6E router included', 'No data caps', 'Priority support', 'Free installation'] },
      { name: 'Ultra', speed: 1000, price: 95, features: ['1 Gbps symmetrical', 'Wi-Fi 6E mesh system', 'No data caps', 'Dedicated support line', 'Free installation', 'Static IP available'] }
    ]
    const currentPlan = subscription?.plan_name?.toLowerCase()

    return (
      <div className="animate-in">
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>My Plan</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 28, fontSize: 15 }}>Manage your broadband plan</p>

        {subscription && (
          <Card style={{ marginBottom: 28, border: '1px solid rgba(0,194,255,0.2)', background: 'rgba(0,194,255,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Current Plan</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{subscription.plan_name}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>{subscription.speed_down_mbps} Mbps symmetrical</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>${parseFloat(subscription.monthly_price_usd || 0).toFixed(2)}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>per month</div>
              </div>
            </div>
          </Card>
        )}

        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, color: 'var(--text-dim)' }}>Available Plans</h3>
        <div className="plan-cards" style={{ display: 'flex', gap: 16 }}>
          {plans.map(p => (
            <div key={p.name} style={{ flex: 1, background: p.popular ? 'rgba(0,194,255,0.05)' : 'var(--bg-card)', border: p.popular ? '2px solid rgba(0,194,255,0.3)' : '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px 24px', position: 'relative' }}>
              {p.popular && <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#000', fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: '0 0 8px 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Most Popular</div>}
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 16 }}>{p.speed} Mbps</div>
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}><span style={{ color: 'var(--accent)' }}>${p.price}</span><span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></div>
              <div style={{ marginTop: 20 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13, color: 'var(--text-dim)' }}>
                    <span style={{ color: 'var(--green)' }}>â</span> {f}
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', marginTop: 20, padding: '12px', background: currentPlan === p.name.toLowerCase() ? 'rgba(255,255,255,0.05)' : p.popular ? 'var(--accent)' : 'rgba(255,255,255,0.08)', border: currentPlan === p.name.toLowerCase() ? '1px solid var(--border)' : 'none', borderRadius: 'var(--radius-sm)', color: currentPlan === p.name.toLowerCase() ? 'var(--text-muted)' : p.popular ? '#000' : '#fff', fontWeight: 600, fontSize: 14 }}>
                {currentPlan === p.name.toLowerCase() ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const SupportView = () => {
    const [messages, setMessages] = useState([{ role: 'assistant', content: `Hi ${userName}! I'm Opus, your Tellinex AI assistant. How can I help you today? I can help with billing questions, technical issues, plan changes, or anything else about your service.` }])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const chatEnd = useRef(null)

    useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    const sendMessage = async () => {
      if (!input.trim() || sending) return
      const userMsg = input.trim()
      setInput('')
      setMessages(prev => [...prev, { role: 'user', content: userMsg }])
      setSending(true)
      try {
        const res = await fetch(ANTHROPIC_PROXY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMsg }] })
        })
        const data = await res.json()
        const reply = data?.content?.[0]?.text || 'Sorry, I had trouble processing that. Please try again.'
        setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      } catch {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Connection issue. Please try again or email support@tellinex.com.' }])
      }
      setSending(false)
    }

    return (
      <div className="animate-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Support</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 20, fontSize: 15 }}>Chat with Opus AI or report an issue</p>

        {/* Quick support options */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {['No internet connection', 'Slow speeds', 'Billing question', 'Upgrade my plan', 'Moving house'].map(q => (
            <button key={q} onClick={() => { setInput(q); }}
              style={{ padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text-dim)', fontSize: 12, transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)' }}>
              {q}
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', minHeight: 400, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                <div style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? 'rgba(0,194,255,0.15)' : 'rgba(255,255,255,0.05)', color: 'var(--text)', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {msg.role === 'assistant' && <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>OPUS AI</div>}
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
                <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: 14 }}>
                  <span style={{ animation: 'pulse 1.5s infinite' }}>Opus is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEnd} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', outline: 'none', fontSize: 14 }} />
            <button onClick={sendMessage} disabled={sending}
              style={{ padding: '10px 20px', background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#000', fontWeight: 600, fontSize: 14 }}>
              Send
            </button>
          </div>
        </div>

        {/* Contact info */}
        <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>ð§ support@tellinex.com</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>ð 1-876-TELLINEX</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>ð¬ WhatsApp: +1 876 555 0100</div>
        </div>
      </div>
    )
  }

  const AccountView = () => (
    <div className="animate-in">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Account Settings</h2>
      <p style={{ color: 'var(--text-dim)', marginBottom: 28, fontSize: 15 }}>Manage your personal information</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Personal Information</h3>
          <Field label="Full Name" value={customer?.customer_name || userName} />
          <Field label="Email" value={session?.user?.email || '--'} />
          <Field label="Phone" value={customer?.phone || '--'} />
          <Field label="Parish" value={customer?.parish || '--'} />
        </Card>

        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Service Address</h3>
          <Field label="Address" value={customer?.address || 'Not set'} />
          <Field label="Account Number" value={customer?.account_number || 'Pending'} />
          <Field label="Account Status" value={acctStatus} badge={badge(acctStatus, statusColor[acctStatus] || '#888')} />
          <Field label="Member Since" value={customer?.created_at ? new Date(customer.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'} />
        </Card>
      </div>

      <div style={{ marginTop: 28 }}>
        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Notifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Email notifications for bills', 'SMS alerts for outages', 'Promotional offers', 'Service updates'].map(n => (
              <label key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-dim)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} /> {n}
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 28 }}>
        <button onClick={logout}
          style={{ padding: '12px 28px', background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)', borderRadius: 'var(--radius-sm)', color: '#FF5252', fontSize: 14, fontWeight: 600 }}>
          Sign Out
        </button>
      </div>
    </div>
  )

  // ======================== NAV & LAYOUT ========================

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'ð ' },
    { id: 'bills', label: 'Bills', icon: 'ð' },
    { id: 'plans', label: 'My Plan', icon: 'ð' },
    { id: 'support', label: 'Support', icon: 'ð¬' },
    { id: 'account', label: 'Account', icon: 'âï¸' }
  ]

  const views = { dashboard: DashboardView, bills: BillsView, plans: PlansView, support: SupportView, account: AccountView }
  const CurrentView = views[view] || DashboardView

  return (
    <div className="portal-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="portal-sidebar" style={{ width: 220, minWidth: 220, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 14px', gap: 4 }}>
        {/* Logo */}
        <div style={{ padding: '0 10px', marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>
            <span style={{ color: 'var(--accent)' }}>Tellinex</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>My Account</div>
        </div>

        {navItems.map(item => (
          <button key={item.id} onClick={() => setView(item.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: view === item.id ? 'var(--accent-glow)' : 'transparent', border: view === item.id ? '1px solid rgba(0,194,255,0.2)' : '1px solid transparent', borderRadius: 'var(--radius-sm)', color: view === item.id ? 'var(--accent)' : 'var(--text-dim)', fontSize: 14, fontWeight: view === item.id ? 600 : 400, transition: 'all 0.2s', width: '100%', textAlign: 'left' }}>
            <span className="sidebar-icon" style={{ fontSize: 18 }}>{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}

        <div style={{ marginTop: 'auto', padding: '14px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{userName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{session?.user?.email}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="portal-main" style={{ flex: 1, padding: '28px 36px', overflow: 'auto', maxHeight: '100vh' }}>
        <CurrentView />
      </div>
    </div>
  )
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function Card({ children, style = {} }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', ...style }}>
      {children}
    </div>
  )
}

function StatCard({ label, value, sub, color, badge: badgeEl }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 22px' }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      {badgeEl || <div style={{ fontSize: 22, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>}
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

function Field({ label, value, badge: badgeEl }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
      {badgeEl || <div style={{ fontSize: 15 }}>{value}</div>}
    </div>
  )
}
