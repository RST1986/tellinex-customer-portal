import test from 'node:test'
import assert from 'node:assert/strict'
import { loadAuthenticatedNetworkHealth, toCustomerHealthModel } from '../src/next/data/networkHealth.js'

function makeBuilder(result, calls) {
  return {
    select(columns) { calls.push(['select', columns]); return this },
    eq(column, value) { calls.push(['eq', column, value]); return this },
    maybeSingle() { calls.push(['maybeSingle']); return Promise.resolve(result) },
  }
}

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
      return makeBuilder({ data: { state: 'unknown', summary: 'Network health integration pending', started_at: null, estimated_resolution_at: null, updated_at: '2026-09-08T21:00:00Z' }, error: null }, calls)
    },
  }

  await loadAuthenticatedNetworkHealth(client)
  assert.deepEqual(calls[0], ['select', 'state,summary,started_at,estimated_resolution_at,updated_at'])
  assert.deepEqual(calls[1], ['eq', 'user_id', 'user-1'])
})

test('unknown never becomes healthy by absence of evidence', () => {
  const model = toCustomerHealthModel({ state: 'unknown', summary: null, updated_at: null })
  assert.equal(model.state, 'unknown')
  assert.equal(model.health, 'Service health pending integration')
  assert.equal(model.tone, 'warning')
})

test('outage preserves customer-safe ETR fields', () => {
  const model = toCustomerHealthModel({
    state: 'outage',
    summary: 'Outage affecting your service',
    started_at: '2026-09-08T20:00:00Z',
    estimated_resolution_at: '2026-09-08T23:00:00Z',
    updated_at: '2026-09-08T21:00:00Z',
  })
  assert.equal(model.state, 'outage')
  assert.equal(model.tone, 'danger')
  assert.equal(model.estimatedResolutionAt, '2026-09-08T23:00:00Z')
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
