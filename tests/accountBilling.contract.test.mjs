import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const sourceUrl = new URL('../src/next/data/accountBilling.js', import.meta.url)
const source = await readFile(sourceUrl, 'utf8')

test('requires verified JWT claims before customer reads', () => {
  assert.match(source, /auth\.getClaims\(\)/)
  assert.match(source, /claimsData\?\.claims\?\.sub/)
  assert.match(source, /Authenticated user identity could not be verified/)
})

test('scopes profile and bill reads to the verified user id', () => {
  const ownershipFilters = source.match(/\.eq\('user_id', userId\)/g) ?? []
  assert.equal(ownershipFilters.length, 2)
  assert.match(source, /from\('customer_profiles'\)/)
  assert.match(source, /from\('customer_bills'\)/)
})

test('does not request provider secret identifiers', () => {
  assert.doesNotMatch(source, /stripe_customer_id/i)
  assert.doesNotMatch(source, /stripe_payment_intent_id/i)
  assert.doesNotMatch(source, /service_role/i)
})

test('limits bill history and orders newest due date first', () => {
  assert.match(source, /order\('due_date', \{ ascending: false \}\)/)
  assert.match(source, /limit\(12\)/)
})

test('projects only Home-safe account and billing facts', () => {
  for (const key of [
    'customerName',
    'accountId',
    'planName',
    'planSpeed',
    'billAmount',
    'billCurrency',
    'billStatus',
    'billDueDate',
    'autoPayEnabled',
  ]) {
    assert.match(source, new RegExp(`${key}:`))
  }
})
