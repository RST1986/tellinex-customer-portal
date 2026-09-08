import test from 'node:test'
import assert from 'node:assert/strict'
import { maskAccountBillingFacts } from '../src/next/data/liveAccountBilling.js'

const model = {
  facts: [
    ['Internet', 'Working'],
    ['Wi-Fi', 'Good'],
    ['Bill', 'J$7500'],
    ['Next payment', '12 Sep · Auto-pay'],
  ],
}

test('loading masks unsupported service facts and Account Billing values', () => {
  const result = maskAccountBillingFacts(model, 'loading')
  assert.deepEqual(result.facts[0], ['Internet', 'Pending integration'])
  assert.deepEqual(result.facts[1], ['Wi-Fi', 'Pending integration'])
  assert.deepEqual(result.facts[2], ['Bill', 'Loading…'])
  assert.deepEqual(result.facts[3], ['Next payment', 'Loading…'])
})

test('unavailable masks unsupported service facts and Account Billing prototype values', () => {
  const result = maskAccountBillingFacts(model, 'unavailable')
  assert.deepEqual(result.facts[0], ['Internet', 'Pending integration'])
  assert.deepEqual(result.facts[1], ['Wi-Fi', 'Pending integration'])
  assert.deepEqual(result.facts[2], ['Bill', 'Unavailable'])
  assert.deepEqual(result.facts[3], ['Next payment', 'Unavailable'])
})
