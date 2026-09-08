import test from 'node:test'
import assert from 'node:assert/strict'
import { loadAuthenticatedSupportTickets } from '../src/next/data/support.js'

function makeBuilder(result, calls) {
  return {
    select(columns) { calls.push(['select', columns]); return this },
    eq(column, value) { calls.push(['eq', column, value]); return this },
    order(column, options) { calls.push(['order', column, options]); return this },
    limit(value) { calls.push(['limit', value]); return Promise.resolve(result) },
  }
}

test('requires verified JWT claims before support reads', async () => {
  const client = {
    auth: { getClaims: async () => ({ data: { claims: {} }, error: null }) },
    from: () => { throw new Error('should not query') },
  }
  await assert.rejects(() => loadAuthenticatedSupportTickets(client), /identity could not be verified/)
})

test('reads only current-user support tickets with minimum fields', async () => {
  const calls = []
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'user-1' } }, error: null }) },
    from(table) {
      assert.equal(table, 'customer_tickets')
      return makeBuilder({ data: [], error: null }, calls)
    },
  }

  const result = await loadAuthenticatedSupportTickets(client)
  assert.deepEqual(result, [])
  assert.deepEqual(calls[0], ['select', 'id,subject,ticket_type,status,priority,created_at,resolved_at'])
  assert.deepEqual(calls[1], ['eq', 'user_id', 'user-1'])
  assert.deepEqual(calls[2], ['order', 'created_at', { ascending: false }])
  assert.deepEqual(calls[3], ['limit', 20])
})
