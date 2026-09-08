import test from 'node:test'
import assert from 'node:assert/strict'
import { firstName, maskAccountBillingFacts, projectLiveAccountBilling } from '../src/next/data/liveAccountBilling.js'

const model = {
  health: 'Your Tellinex service is healthy',
  tone: 'success',
  exceptions: [],
  actions: ['Improve Wi-Fi'],
  facts: [
    ['Internet', '920 Mb/s · Working'],
    ['Wi-Fi', 'Good'],
    ['Devices', '14 online'],
    ['Usage', 'On track'],
    ['Bill', 'J$7500'],
    ['Next payment', '12 Sep · Auto-pay'],
  ],
}

test('live Account Billing never presents prototype telemetry as live', () => {
  const projected = projectLiveAccountBilling(model, {
    billAmount: 8200,
    billCurrency: 'JMD',
    billDueDate: '2026-09-18',
    autoPayEnabled: true,
  })

  assert.equal(projected.health, 'Service health integration pending')
  assert.equal(projected.tone, 'warning')
  assert.deepEqual(projected.facts.slice(0, 4), [
    ['Internet', 'Pending integration'],
    ['Wi-Fi', 'Pending integration'],
    ['Devices', 'Pending integration'],
    ['Usage', 'Pending integration'],
  ])
  assert.match(projected.facts[4][1], /8,200/)
  assert.match(projected.facts[5][1], /18 Sep/)
  assert.match(projected.facts[5][1], /Auto-pay/)
  assert.deepEqual(projected.actions, [])
})

test('missing live billing values never fall back to prototype bill data', () => {
  const projected = projectLiveAccountBilling(model, {})
  assert.equal(projected.facts[4][1], 'No bill available')
  assert.equal(projected.facts[5][1], 'Not available')
})

test('loading and unavailable states mask all unsupported live surfaces', () => {
  const loading = maskAccountBillingFacts(model, 'loading')
  const unavailable = maskAccountBillingFacts(model, 'unavailable')

  assert.deepEqual(loading.facts.slice(0, 4).map(([, value]) => value), Array(4).fill('Pending integration'))
  assert.equal(loading.facts[4][1], 'Loading…')
  assert.equal(loading.facts[5][1], 'Loading…')
  assert.equal(unavailable.facts[4][1], 'Unavailable')
  assert.equal(unavailable.facts[5][1], 'Unavailable')
  assert.equal(unavailable.health, 'Account and billing are temporarily unavailable')
})

test('firstName returns only a safe greeting token', () => {
  assert.equal(firstName('  Rui Santos  '), 'Rui')
  assert.equal(firstName(''), null)
  assert.equal(firstName(null), null)
})
