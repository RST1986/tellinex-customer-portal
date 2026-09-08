import test from 'node:test'
import assert from 'node:assert/strict'
import { loadAuthenticatedService, toServiceSummary } from '../src/next/data/service.js'

function makeBuilder(result, calls) {
  return {
    select(columns) { calls.push(['select', columns]); return this },
    eq(column, value) { calls.push(['eq', column, value]); return this },
    order(column, options) { calls.push(['order', column, options]); return this },
    limit(value) { calls.push(['limit', value]); return this },
    maybeSingle() { calls.push(['maybeSingle']); return Promise.resolve(result) },
  }
}

test('requires verified JWT claims before service reads', async () => {
  const client = {
    auth: { getClaims: async () => ({ data: { claims: {} }, error: null }) },
    from: () => { throw new Error('should not query') },
  }
  await assert.rejects(() => loadAuthenticatedService(client), /identity could not be verified/)
})

test('loads only linked customer service with minimum fields', async () => {
  const linkCalls = []
  const serviceCalls = []
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'user-1' } }, error: null }) },
    from(table) {
      if (table === 'customer_auth_links') return makeBuilder({ data: { customer_id: 'customer-1' }, error: null }, linkCalls)
      if (table === 'subscriptions') return makeBuilder({ data: { plan_name: 'Tellinex Fibre', speed_down_mbps: 1000, speed_up_mbps: 500, status: 'active' }, error: null }, serviceCalls)
      throw new Error(`unexpected table ${table}`)
    },
  }

  const result = await loadAuthenticatedService(client)
  assert.deepEqual(result, { plan_name: 'Tellinex Fibre', speed_down_mbps: 1000, speed_up_mbps: 500, status: 'active' })
  assert.deepEqual(linkCalls[0], ['select', 'customer_id'])
  assert.deepEqual(linkCalls[1], ['eq', 'user_id', 'user-1'])
  assert.deepEqual(serviceCalls[0], ['select', 'plan_name,speed_down_mbps,speed_up_mbps,status'])
  assert.deepEqual(serviceCalls[1], ['eq', 'customer_id', 'customer-1'])
})

test('returns null when no ownership link exists', async () => {
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'user-2' } }, error: null }) },
    from(table) {
      if (table === 'customer_auth_links') return makeBuilder({ data: null, error: null }, [])
      throw new Error('subscriptions must not be queried without a link')
    },
  }
  assert.equal(await loadAuthenticatedService(client), null)
})

test('projects only customer-safe service fields', () => {
  assert.deepEqual(toServiceSummary({
    plan_name: 'Tellinex Fibre',
    speed_down_mbps: 1000,
    speed_up_mbps: 500,
    status: 'active',
    stripe_subscription_id: 'must-not-leak',
  }), {
    planName: 'Tellinex Fibre',
    speedDownMbps: 1000,
    speedUpMbps: 500,
    status: 'active',
  })
})
