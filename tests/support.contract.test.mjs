import test from 'node:test'
import assert from 'node:assert/strict'
import { loadAuthenticatedSupport, toSupportSummary } from '../src/next/data/support.js'

function makeBuilder(result, calls) {
  return {
    select(columns) { calls.push(['select', columns]); return this },
    eq(column, value) { calls.push(['eq', column, value]); return this },
    order(column, options) { calls.push(['order', column, options]); return this },
    limit(value) { calls.push(['limit', value]); return this },
    maybeSingle() { calls.push(['maybeSingle']); return Promise.resolve(result) },
    then(resolve, reject) { return Promise.resolve(result).then(resolve, reject) },
  }
}

test('requires verified JWT claims before support reads', async () => {
  const client = {
    auth: { getClaims: async () => ({ data: { claims: {} }, error: null }) },
    from: () => { throw new Error('should not query') },
  }
  await assert.rejects(() => loadAuthenticatedSupport(client), /identity could not be verified/)
})

test('loads only linked customer tickets with minimum fields and dual ownership filters', async () => {
  const linkCalls = []
  const ticketCalls = []
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'user-1' } }, error: null }) },
    from(table) {
      if (table === 'customer_auth_links') return makeBuilder({ data: { customer_id: 'customer-1' }, error: null }, linkCalls)
      if (table === 'customer_tickets') return makeBuilder({ data: [{ id: 't1', ticket_type: 'general', subject: 'Help', status: 'open', priority: 'normal', created_at: '2026-09-08T20:00:00Z', resolved_at: null }], error: null }, ticketCalls)
      throw new Error(`unexpected table ${table}`)
    },
  }

  const result = await loadAuthenticatedSupport(client)
  assert.equal(result.length, 1)
  assert.deepEqual(linkCalls[0], ['select', 'customer_id'])
  assert.deepEqual(linkCalls[1], ['eq', 'user_id', 'user-1'])
  assert.deepEqual(ticketCalls[0], ['select', 'id,ticket_type,subject,status,priority,created_at,resolved_at'])
  assert.deepEqual(ticketCalls[1], ['eq', 'customer_id', 'customer-1'])
  assert.deepEqual(ticketCalls[2], ['eq', 'user_id', 'user-1'])
})

test('does not query tickets without an ownership link', async () => {
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'user-2' } }, error: null }) },
    from(table) {
      if (table === 'customer_auth_links') return makeBuilder({ data: null, error: null }, [])
      throw new Error('customer_tickets must not be queried without a link')
    },
  }
  assert.deepEqual(await loadAuthenticatedSupport(client), [])
})

test('projects only customer-safe support fields', () => {
  assert.deepEqual(toSupportSummary([{ id:'t1', ticket_type:'billing', subject:'Invoice', status:'open', priority:'high', created_at:'x', resolved_at:null, assigned_to:'internal-agent', resolution:'internal detail' }]), [{ id:'t1', type:'billing', subject:'Invoice', status:'open', priority:'high', createdAt:'x', resolvedAt:null }])
})
