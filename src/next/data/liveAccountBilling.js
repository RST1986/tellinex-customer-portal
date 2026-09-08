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

export function projectLiveAccountBilling(model, billingFacts) {
  if (!model || !billingFacts) return model

  const billValue = formatMoney(billingFacts.billAmount, billingFacts.billCurrency)
  const dueDate = formatDueDate(billingFacts.billDueDate)
  const nextPaymentValue = dueDate
    ? `${dueDate}${billingFacts.autoPayEnabled === true ? ' · Auto-pay' : ''}`
    : null

  return {
    ...model,
    facts: model.facts.map(([label, value]) => {
      if (label === 'Bill' && billValue) return [label, billValue]
      if (label === 'Next payment' && nextPaymentValue) return [label, nextPaymentValue]
      return [label, value]
    }),
  }
}

export function firstName(fullName) {
  const trimmed = fullName?.trim()
  if (!trimmed) return null
  return trimmed.split(/\s+/)[0] || null
}
