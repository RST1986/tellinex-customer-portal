function unavailable(reason) {
  return {
    status: 'unavailable',
    reason,
    rxBytesDelta: null,
    txBytesDelta: null,
    totalBytesDelta: null,
  }
}

function parseCounter(value) {
  if (typeof value === 'bigint') return value >= 0n ? value : null
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 ? BigInt(value) : null
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) return BigInt(value)
  return null
}

function parseTime(value) {
  const parsed = Date.parse(value ?? '')
  return Number.isFinite(parsed) ? parsed : null
}

export function deriveUsageCounterDelta(previous, current) {
  if (!previous || !current) return unavailable('sample_pair_missing')
  if (previous.authoritative !== true || current.authoritative !== true) {
    return unavailable('non_authoritative_sample')
  }
  if (previous.customerScoped !== true || current.customerScoped !== true) {
    return unavailable('non_customer_scoped_sample')
  }

  if (!previous.customerId || previous.customerId !== current.customerId) {
    return unavailable('customer_identity_changed')
  }
  if (!previous.deviceId || previous.deviceId !== current.deviceId) {
    return unavailable('device_changed_requires_rebaseline')
  }
  if (previous.counterGeneration == null || previous.counterGeneration !== current.counterGeneration) {
    return unavailable('counter_generation_changed_requires_rebaseline')
  }

  const previousAt = parseTime(previous.observedAt)
  const currentAt = parseTime(current.observedAt)
  if (previousAt == null || currentAt == null || currentAt <= previousAt) {
    return unavailable('invalid_sample_order')
  }

  const previousRx = parseCounter(previous.rxBytes)
  const previousTx = parseCounter(previous.txBytes)
  const currentRx = parseCounter(current.rxBytes)
  const currentTx = parseCounter(current.txBytes)
  if ([previousRx, previousTx, currentRx, currentTx].some(value => value == null)) {
    return unavailable('invalid_counter_value')
  }

  if (currentRx < previousRx || currentTx < previousTx) {
    return unavailable('counter_decrease_requires_rebaseline')
  }

  const rxBytesDelta = currentRx - previousRx
  const txBytesDelta = currentTx - previousTx
  return {
    status: 'ok',
    reason: null,
    customerId: current.customerId,
    deviceId: current.deviceId,
    counterGeneration: current.counterGeneration,
    intervalStart: previous.observedAt,
    intervalEnd: current.observedAt,
    rxBytesDelta: rxBytesDelta.toString(),
    txBytesDelta: txBytesDelta.toString(),
    totalBytesDelta: (rxBytesDelta + txBytesDelta).toString(),
  }
}

export function bytesToDecimalGb(bytes) {
  const value = parseCounter(bytes)
  if (value == null) return null

  const whole = value / 1_000_000_000n
  const remainder = value % 1_000_000_000n
  return `${whole}.${remainder.toString().padStart(9, '0')}`
}
