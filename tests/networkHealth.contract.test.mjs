import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_NETWORK_HEALTH_MAX_AGE_MS, loadAuthenticatedNetworkHealth, toCustomerHealthModel } from '../src/next/data/networkHealth.js'

function makeBuilder(result, calls) {
  return {
    select(columns) { calls.push(['select', columns]); return this },
    eq(column, value) { calls.push(['eq', column, value]); return this },
    maybeSingle() { calls.push(['maybeSingle']); return Promise.resolve(result) },
  }
}

const nowMs = Date.parse('2026-09-08T21:02:00Z')
const freshUpdatedAt = '2026-09-08T21:00:00Z'
const futureValidity = '2026-09-08T21:04:00Z'

test('requires verified JWT claims before network health reads', async () => {
  const client = {
    auth: { getClaims: async () => ({ data: { claims: {} }, error: null }) },
    from: () => { throw new Error('should not query') },
  }
  await assert.rejects(() => loadAuthenticatedNetworkHealth(client), /identity could not be verified/)
})

test('reads only the customer-safe health surface scoped to signed-in user', async () => {
  const calls = []
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'user-1' } }, error: null }) },
    from(table) {
      assert.equal(table, 'customer_network_health')
      return makeBuilder({ data: { state: 'unknown', summary: 'Network health integration pending', started_at: null, estimated_resolution_at: null, updated_at: freshUpdatedAt, valid_until: null }, error: null }, calls)
    },
  }

  await loadAuthenticatedNetworkHealth(client)
  assert.deepEqual(calls[0], ['select', 'state,summary,started_at,estimated_resolution_at,updated_at,valid_until'])
  assert.deepEqual(calls[1], ['eq', 'user_id', 'user-1'])
})

test('unknown never becomes healthy by absence of evidence', () => {
  const model = toCustomerHealthModel({ state: 'unknown', summary: null, updated_at: null, valid_until: null })
  assert.equal(model.state, 'unknown')
  assert.equal(model.health, 'Service health pending integration')
  assert.equal(model.tone, 'warning')
})

test('fresh outage with declared validity preserves customer-safe ETR fields', () => {
  const model = toCustomerHealthModel({
    state: 'outage',
    summary: 'Outage affecting your service',
    started_at: '2026-09-08T20:00:00Z',
    estimated_resolution_at: '2026-09-08T23:00:00Z',
    updated_at: freshUpdatedAt,
    valid_until: futureValidity,
  }, { nowMs })
  assert.equal(model.state, 'outage')
  assert.equal(model.tone, 'danger')
  assert.equal(model.estimatedResolutionAt, '2026-09-08T23:00:00Z')
})

test('missing declared validity fails closed even when producer timestamp is fresh', () => {
  const model = toCustomerHealthModel({
    state: 'healthy',
    summary: 'Healthy',
    updated_at: freshUpdatedAt,
    valid_until: null,
  }, { nowMs })
  assert.equal(model.state, 'unknown')
  assert.equal(model.health, 'Service health data is temporarily unavailable')
  assert.equal(model.summary, null)
})

test('expired declared validity fails closed even when producer timestamp is fresh', () => {
  const model = toCustomerHealthModel({
    state: 'healthy',
    summary: 'Healthy',
    updated_at: freshUpdatedAt,
    valid_until: '2026-09-08T21:01:59Z',
  }, { nowMs })
  assert.equal(model.state, 'unknown')
  assert.equal(model.summary, null)
})

test('stale healthy snapshot fails closed despite a later declared validity', () => {
  const updatedAt = '2026-09-08T21:00:00Z'
  const staleNowMs = Date.parse(updatedAt) + DEFAULT_NETWORK_HEALTH_MAX_AGE_MS + 1
  const model = toCustomerHealthModel({
    state: 'healthy',
    summary: 'Healthy',
    updated_at: updatedAt,
    valid_until: '2026-09-08T22:00:00Z',
  }, { nowMs: staleNowMs })
  assert.equal(model.state, 'unknown')
  assert.equal(model.tone, 'warning')
  assert.equal(model.health, 'Service health data is temporarily unavailable')
  assert.equal(model.summary, null)
})

test('missing or invalid producer timestamp fails closed to unknown', () => {
  assert.equal(toCustomerHealthModel({ state: 'outage', summary: 'Outage', updated_at: null, valid_until: futureValidity }, { nowMs }).state, 'unknown')
  assert.equal(toCustomerHealthModel({ state: 'degraded', summary: 'Degraded', updated_at: 'not-a-date', valid_until: futureValidity }, { nowMs }).state, 'unknown')
})

test('implausible future producer timestamp fails closed to unknown', () => {
  const model = toCustomerHealthModel({
    state: 'healthy',
    summary: 'Healthy',
    updated_at: '2026-09-08T21:04:00Z',
    valid_until: '2026-09-08T21:05:00Z',
  }, { nowMs })
  assert.equal(model.state, 'unknown')
})

test('adapter never needs NOC/global incident tables', async () => {
  const seen = []
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'user-1' } }, error: null }) },
    from(table) {
      seen.push(table)
      return makeBuilder({ data: null, error: null }, [])
    },
  }
  await loadAuthenticatedNetworkHealth(client)
  assert.deepEqual(seen, ['customer_network_health'])
})
