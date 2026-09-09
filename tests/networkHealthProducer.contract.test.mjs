import test from 'node:test'
import assert from 'node:assert/strict'
import { deriveCustomerNetworkHealth } from '../src/next/data/networkHealthProducer.js'

const nowMs = Date.parse('2026-09-09T08:00:00Z')

function signal(source, state, overrides = {}) {
  return {
    source,
    state,
    authoritative: true,
    customerScoped: true,
    observedAt: '2026-09-09T07:59:00Z',
    validUntil: '2026-09-09T08:03:00Z',
    ...overrides,
  }
}

test('fails closed without an authoritative customer binding', () => {
  assert.equal(deriveCustomerNetworkHealth({ bindingValid: false, signals: [signal('ont', 'healthy')], nowMs }).state, 'unknown')
})

test('never infers healthy from silence', () => {
  const result = deriveCustomerNetworkHealth({ bindingValid: true, signals: [], nowMs })
  assert.equal(result.state, 'unknown')
  assert.equal(result.reason, 'fresh_operational_evidence_missing')
})

test('ignores stale, non-authoritative, and non-customer-scoped signals', () => {
  const result = deriveCustomerNetworkHealth({
    bindingValid: true,
    nowMs,
    signals: [
      signal('ont', 'healthy', { validUntil: '2026-09-09T07:59:30Z' }),
      signal('router', 'healthy', { authoritative: false }),
      signal('incident', 'outage', { customerScoped: false }),
    ],
  })
  assert.equal(result.state, 'unknown')
})

test('requires every configured source before declaring health', () => {
  const result = deriveCustomerNetworkHealth({
    bindingValid: true,
    nowMs,
    requiredSources: ['ont', 'router'],
    signals: [signal('ont', 'healthy')],
  })
  assert.equal(result.state, 'unknown')
  assert.equal(result.reason, 'required_source_missing')
})

test('outage evidence wins over healthy evidence', () => {
  const result = deriveCustomerNetworkHealth({
    bindingValid: true,
    nowMs,
    requiredSources: ['ont', 'router'],
    signals: [
      signal('ont', 'healthy'),
      signal('router', 'healthy'),
      signal('incident', 'outage', { reason: 'customer_impact_incident', estimatedResolutionAt: '2026-09-09T10:00:00Z' }),
    ],
  })
  assert.equal(result.state, 'outage')
  assert.equal(result.reason, 'customer_impact_incident')
  assert.equal(result.estimatedResolutionAt, '2026-09-09T10:00:00Z')
})

test('degraded evidence wins when no outage exists', () => {
  const result = deriveCustomerNetworkHealth({
    bindingValid: true,
    nowMs,
    requiredSources: ['ont', 'router'],
    signals: [signal('ont', 'healthy'), signal('router', 'degraded')],
  })
  assert.equal(result.state, 'degraded')
})

test('declares healthy only from positive fresh required evidence', () => {
  const result = deriveCustomerNetworkHealth({
    bindingValid: true,
    nowMs,
    requiredSources: ['ont', 'router'],
    signals: [signal('ont', 'healthy'), signal('router', 'healthy')],
  })
  assert.equal(result.state, 'healthy')
  assert.equal(result.reason, 'positive_required_sources_healthy')
})

test('unknown from a required source prevents a healthy result', () => {
  const result = deriveCustomerNetworkHealth({
    bindingValid: true,
    nowMs,
    requiredSources: ['ont', 'router'],
    signals: [signal('ont', 'healthy'), signal('router', 'unknown')],
  })
  assert.equal(result.state, 'unknown')
  assert.equal(result.reason, 'required_source_unknown')
})

test('rejects evidence timestamped too far in the future', () => {
  const result = deriveCustomerNetworkHealth({
    bindingValid: true,
    nowMs,
    signals: [signal('ont', 'healthy', { observedAt: '2026-09-09T08:02:00Z', validUntil: '2026-09-09T08:05:00Z' })],
  })
  assert.equal(result.state, 'unknown')
})
