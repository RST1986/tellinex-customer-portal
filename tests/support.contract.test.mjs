import test from 'node:test'
import assert from 'node:assert/strict'
import { createAuthenticatedSupportTicket, loadAuthenticatedSupportTickets } from '../src/next/data/support.js'

function chain(result, calls) {
  return {
    select(value) { calls.push(['select', value]); return this },
    eq(column, value) { calls.push(['eq', column, value]); return this },
    order(column, options) { calls.push(['order', column, options]); return this },
    limit(value) { calls.push(['limit', value]); return Promise.resolve(result) },
    insert(payload) { calls.push(['insert', payload]); return this },
    single() { calls.push(['single']); return Promise.resolve(result) },
  }
}

test('support reads require verified JWT claims', async () => {
  const client = {
    auth: { getClaims: async () => ({ data: { claims: {} }, error: null }) },
    from: () => { throw new Error('should not query') },
  }
  await assert.rejects(() => loadAuthenticatedSupportTickets(client), /identity could not be verified/)
})

test('support reads are scoped to verified user id and minimum fields', async () => {
  const calls = []
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'user-1' } }, error: null }) },
    from(table) {
      assert.equal(table, 'customer_tickets')
      return chain({ data: [], error: null }, calls)
    },
  }

  assert.deepEqual(await loadAuthenticatedSupportTickets(client, 10), [])
  assert.deepEqual(calls[0], ['select', 'id,subject,ticket_type,priority,status,created_at,resolved_at'])
  assert.deepEqual(calls[1], ['eq', 'user_id', 'user-1'])
  assert.deepEqual(calls[3], ['limit', 10])
})

test('support creation pins user id and governed data source', async () => {
  const calls = []
  const row = { id: 'ticket-1', subject: 'Need help', status: 'open' }
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'user-1' } }, error: null }) },
    from(table) {
      assert.equal(table, 'customer_tickets')
      return chain({ data: row, error: null }, calls)
    },
  }

  const result = await createAuthenticatedSupportTicket(client, {
    subject: ' Need help ',
    ticketType: 'general',
    priority: 'normal',
    description: ' Router issue ',
  })

  assert.deepEqual(result, row)
  const payload = calls.find(call => call[0] === 'insert')[1]
  assert.equal(payload.user_id, 'user-1')
  assert.equal(payload.subject, 'Need help')
  assert.equal(payload.description, 'Router issue')
  assert.equal(payload.data_source, 'my_tellinex_app')
})

test('support creation rejects empty subjects before insert', async () => {
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'user-1' } }, error: null }) },
    from: () => { throw new Error('should not query') },
  }
  await assert.rejects(() => createAuthenticatedSupportTicket(client, { subject: '  ' }), /subject is required/)
})
