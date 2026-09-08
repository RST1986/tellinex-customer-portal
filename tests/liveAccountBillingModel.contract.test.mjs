import test from 'node:test'
import assert from 'node:assert/strict'
import { applyLiveAccountBilling } from '../src/next/data/liveAccountBillingModel.js'

const base = {
  health: 'Your Tellinex service is healthy',
  tone: 'success',
  exceptions: [],
  actions: [],
  facts: [
    ['Internet', '920 Mb/s · Working'],
    ['Wi-Fi', 'Good'],
    ['Devices', '14 online'],
    ['Usage', 'On track'],
    ['Bill', 'J$7,500'],
    ['Next payment', '12 Sep · Auto-pay'],
  ],
}

test('only overlays approved Account/Billing fields', () => {
  const result = applyLiveAccountBilling(base, {
    customerName: 'Customer A',
    billAmount: 8125,
    billCurrency: 'JMD',
    billDueDate: '2026-09-20',
    autoPayEnabled: false,
  })

  assert.equal(result.health, base.health)
  assert.deepEqual(result.exceptions, base.exceptions)
  assert.deepEqual(result.actions, base.actions)
  assert.deepEqual(result.facts.slice(0, 4), base.facts.slice(0, 4))
  assert.match(result.facts[4][1], /8,?125/)
  assert.equal(result.facts[5][1], '2026-09-20')
  assert.equal(result.customerName, 'Customer A')
  assert.equal(result.liveAccountBilling, true)
})

test('does not replace prototype billing values when live fields are absent', () => {
  const result = applyLiveAccountBilling(base, {})
  assert.equal(result.facts[4][1], 'J$7,500')
  assert.equal(result.facts[5][1], '12 Sep · Auto-pay')
})
