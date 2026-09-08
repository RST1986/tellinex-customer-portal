function formatMoney(amount, currency) {
  if (amount == null) return null

  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount)) return null

  try {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: currency || 'JMD',
      maximumFractionDigits: 2,
    }).format(numericAmount)
  } catch {
    return `${currency || 'JMD'} ${numericAmount.toFixed(2)}`
  }
}

function formatDueDate(value) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('en-JM', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

const LIVE_PENDING_LABELS = new Set(['Internet', 'Wi-Fi', 'Devices', 'Usage'])

export function projectLiveAccountBilling(model, billingFacts) {
  if (!model || !billingFacts) return model

  const billValue = formatMoney(billingFacts.billAmount, billingFacts.billCurrency)
  const dueDate = formatDueDate(billingFacts.billDueDate)
  const nextPaymentValue = dueDate
    ? `${dueDate}${billingFacts.autoPayEnabled === true ? ' · Auto-pay' : ''}`
    : 'Not available'

  return {
    ...model,
    health: 'Service health integration pending',
    tone: 'warning',
    exceptions: [],
    actions: [],
    facts: model.facts.map(([label]) => {
      if (LIVE_PENDING_LABELS.has(label)) return [label, 'Pending integration']
      if (label === 'Bill') return [label, billValue || 'No bill available']
      if (label === 'Next payment') return [label, nextPaymentValue]
      return [label, 'Pending integration']
    }),
  }
}

export function maskAccountBillingFacts(model, status) {
  if (!model) return model
  const replacement = status === 'loading' ? 'Loading…' : 'Unavailable'

  return {
    ...model,
    health: status === 'loading'
      ? 'Account and billing are loading'
      : 'Account and billing are temporarily unavailable',
    tone: 'warning',
    exceptions: status === 'unavailable'
      ? [{ title: 'Account data unavailable', detail: 'Service-health, outage and support channels remain independent of this account-data issue.' }]
      : [],
    actions: [],
    facts: model.facts.map(([label]) => {
      if (label === 'Bill' || label === 'Next payment') return [label, replacement]
      return [label, 'Pending integration']
    }),
  }
}

export function firstName(fullName) {
  const trimmed = fullName?.trim()
  if (!trimmed) return null
  return trimmed.split(/\s+/)[0] || null
}
