import test from 'node:test'
import assert from 'node:assert/strict'
import { bytesToDecimalGb, deriveUsageCounterDelta } from '../src/next/data/usageCounterProducer.js'

function sample(overrides = {}) {
  return {
    customerId: 'customer-1',
    deviceId: 'router-1',
    counterGeneration: 'generation-1',
    observedAt: '2026-09-09T08:00:00Z',
    rxBytes: '10000000000',
    txBytes: '4000000000',
    authoritative: true,
    customerScoped: true,
    ...overrides,
  }
}

test('derives exact monotonic byte deltas without floating point loss', () => {
  const result = deriveUsageCounterDelta(
    sample(),
    sample({ observedAt: '2026-09-09T08:05:00Z', rxBytes: '12500000000', txBytes: '4750000000' }),
  )
  assert.equal(result.status, 'ok')
  assert.equal(result.rxBytesDelta, '2500000000')
  assert.equal(result.txBytesDelta, '750000000')
  assert.equal(result.totalBytesDelta, '3250000000')
})

test('never accepts a device replacement as a usage delta', () => {
  const result = deriveUsageCounterDelta(sample(), sample({ deviceId: 'router-2', observedAt: '2026-09-09T08:05:00Z' }))
  assert.equal(result.status, 'unavailable')
  assert.equal(result.reason, 'device_changed_requires_rebaseline')
})

test('requires an explicit counter generation boundary', () => {
  const result = deriveUsageCounterDelta(sample(), sample({ counterGeneration: 'generation-2', observedAt: '2026-09-09T08:05:00Z' }))
  assert.equal(result.status, 'unavailable')
  assert.equal(result.reason, 'counter_generation_changed_requires_rebaseline')
})

test('fails closed on counter reset or rollover', () => {
  const result = deriveUsageCounterDelta(sample(), sample({ observedAt: '2026-09-09T08:05:00Z', rxBytes: '100', txBytes: '200' }))
  assert.equal(result.status, 'unavailable')
  assert.equal(result.reason, 'counter_decrease_requires_rebaseline')
})

test('rejects non-authoritative and non-customer-scoped samples', () => {
  assert.equal(deriveUsageCounterDelta(sample(), sample({ authoritative: false, observedAt: '2026-09-09T08:05:00Z' })).status, 'unavailable')
  assert.equal(deriveUsageCounterDelta(sample(), sample({ customerScoped: false, observedAt: '2026-09-09T08:05:00Z' })).status, 'unavailable')
})

test('rejects invalid or non-increasing sample timestamps', () => {
  assert.equal(deriveUsageCounterDelta(sample(), sample({ observedAt: '2026-09-09T08:00:00Z' })).reason, 'invalid_sample_order')
  assert.equal(deriveUsageCounterDelta(sample(), sample({ observedAt: 'not-a-time' })).reason, 'invalid_sample_order')
})

test('rejects unsafe numeric counters rather than silently rounding', () => {
  const result = deriveUsageCounterDelta(sample(), sample({
    observedAt: '2026-09-09T08:05:00Z',
    rxBytes: Number.MAX_SAFE_INTEGER + 10,
  }))
  assert.equal(result.status, 'unavailable')
  assert.equal(result.reason, 'invalid_counter_value')
})

test('converts bytes to decimal GB exactly as a decimal string', () => {
  assert.equal(bytesToDecimalGb('3250000000'), '3.250000000')
  assert.equal(bytesToDecimalGb('1000000000'), '1.000000000')
  assert.equal(bytesToDecimalGb('-1'), null)
})
