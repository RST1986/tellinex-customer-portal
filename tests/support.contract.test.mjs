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
    maybeSingle() { calls.push(['maybeSingle']); return Promise.resolve(result) },
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

test('support creation resolves customer ownership and pins both identities', async () => {
  const linkCalls = []
  const ticketCalls = []
  const row = { id: 'ticket-1', subject: 'Need help', status: 'open' }
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'user-1' } }, error: null }) },
    from(table) {
      if (table === 'customer_auth_links') {
        return chain({ data: { customer_id: 'customer-1' }, error: null }, linkCalls)
      }
      if (table === 'customer_tickets') {
        return chain({ data: row, error: null }, ticketCalls)
      }
      throw new Error(`unexpected table ${table}`)
    },
  }

  const result = await createAuthenticatedSupportTicket(client, {
    subject: ' Need help ',
    ticketType: 'general',
    priority: 'normal',
    description: ' Router issue ',
  })

  assert.deepEqual(result, row)
  assert.deepEqual(linkCalls[0], ['select', 'customer_id'])
  assert.deepEqual(linkCalls[1], ['eq', 'user_id', 'user-1'])
  const payload = ticketCalls.find(call => call[0] === 'insert')[1]
  assert.equal(payload.user_id, 'user-1')
  assert.equal(payload.customer_id, 'customer-1')
  assert.equal(payload.subject, 'Need help')
  assert.equal(payload.description, 'Router issue')
  assert.equal(payload.data_source, 'my_tellinex_app')
})

test('support creation fails closed when no customer link exists', async () => {
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'user-1' } }, error: null }) },
    from(table) {
      if (table === 'customer_auth_links') return chain({ data: null, error: null }, [])
      throw new Error('ticket insert must not run without customer link')
    },
  }
  await assert.rejects(() => createAuthenticatedSupportTicket(client, { subject: 'Need help' }), /customer link could not be resolved/)
})

test('support creation rejects empty subjects before ownership lookup', async () => {
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'user-1' } }, error: null }) },
    from: () => { throw new Error('should not query') },
  }
  await assert.rejects(() => createAuthenticatedSupportTicket(client, { subject: '  ' }), /subject is required/)
})
