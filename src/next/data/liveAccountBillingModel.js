export function formatMoney(amount, currency) {
  if (amount == null || !currency) return null
  try {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount))
  } catch {
    return `${currency} ${amount}`
  }
}

export function applyLiveAccountBilling(homeModel, billingFacts) {
  if (!homeModel) throw new Error('Home model is required.')

  const facts = homeModel.facts.map(([label, value]) => {
    if (label === 'Bill') {
      const formatted = formatMoney(billingFacts?.billAmount, billingFacts?.billCurrency)
      return [label, formatted ?? value]
    }

    if (label === 'Next payment') {
      const due = billingFacts?.billDueDate
      const autoPay = billingFacts?.autoPayEnabled
      if (!due) return [label, value]
      return [label, `${due}${autoPay === true ? ' · Auto-pay' : ''}`]
    }

    return [label, value]
  })

  return {
    ...homeModel,
    facts,
    liveAccountBilling: true,
    customerName: billingFacts?.customerName ?? null,
  }
}
