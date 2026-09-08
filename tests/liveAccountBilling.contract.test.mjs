import test from 'node:test'
import assert from 'node:assert/strict'
import { firstName, maskAccountBillingFacts, projectLiveAccountBilling } from '../src/next/data/liveAccountBilling.js'

const model = {
  health: 'Your Tellinex service is healthy',
  tone: 'success',
  facts: [
    ['Internet', '920 Mb/s · Working'],
    ['Wi-Fi', 'Good'],
    ['Devices', '14 online'],
    ['Usage', 'On track'],
    ['Bill', 'J$7500'],
    ['Next payment', '12 Sep · Auto-pay'],
  ],
}

test('only Bill and Next payment are replaced by live Account Billing facts', () => {
  const projected = projectLiveAccountBilling(model, {
    billAmount: 8200,
    billCurrency: 'JMD',
    billDueDate: '2026-09-18',
    autoPayEnabled: true,
  })

  assert.deepEqual(projected.facts.slice(0, 4), model.facts.slice(0, 4))
  assert.match(projected.facts[4][1], /8,200/)
  assert.match(projected.facts[5][1], /18 Sep/)
  assert.match(projected.facts[5][1], /Auto-pay/)
})

test('missing live billing values preserve the supplied model rather than inventing data', () => {
  const projected = projectLiveAccountBilling(model, {})
  assert.deepEqual(projected.facts, model.facts)
})

test('loading and unavailable states never expose prototype billing values', () => {
  const loading = maskAccountBillingFacts(model, 'loading')
  const unavailable = maskAccountBillingFacts(model, 'unavailable')

  assert.deepEqual(loading.facts.slice(0, 4), model.facts.slice(0, 4))
  assert.equal(loading.facts[4][1], 'Loading…')
  assert.equal(loading.facts[5][1], 'Loading…')
  assert.equal(unavailable.facts[4][1], 'Unavailable')
  assert.equal(unavailable.facts[5][1], 'Unavailable')
})

test('firstName returns only a safe greeting token', () => {
  assert.equal(firstName('  Rui Santos  '), 'Rui')
  assert.equal(firstName(''), null)
  assert.equal(firstName(null), null)
})
