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

test('requests only the minimum browser fields for this Home slice', () => {
  for (const field of ['full_name', 'amount', 'currency', 'status', 'due_date']) {
    assert.match(source, new RegExp(`'${field}'`))
  }
  for (const forbidden of ['phone', 'address', 'account_id', 'invoice_pdf_url', 'line_items', 'stripe_customer_id', 'stripe_payment_intent_id', 'service_role']) {
    assert.doesNotMatch(source, new RegExp(forbidden, 'i'))
  }
})

test('limits bill history and orders newest due date first', () => {
  assert.match(source, /order\('due_date', \{ ascending: false \}\)/)
  assert.match(source, /limit\(12\)/)
})

test('projects only Home-safe account and billing facts', () => {
  for (const key of ['customerName', 'billAmount', 'billCurrency', 'billStatus', 'billDueDate']) {
    assert.match(source, new RegExp(`${key}:`))
  }
  for (const key of ['accountId', 'planName', 'planSpeed', 'autoPayEnabled']) {
    assert.doesNotMatch(source, new RegExp(`${key}:`))
  }
})
