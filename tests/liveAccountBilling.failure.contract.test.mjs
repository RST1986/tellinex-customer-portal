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

test('loading masks Account and Billing values without touching service facts', () => {
  const result = maskAccountBillingFacts(model, 'loading')
  assert.deepEqual(result.facts[0], model.facts[0])
  assert.deepEqual(result.facts[1], model.facts[1])
  assert.deepEqual(result.facts[2], ['Bill', 'Loading…'])
  assert.deepEqual(result.facts[3], ['Next payment', 'Loading…'])
})

test('unavailable masks Account and Billing prototype values', () => {
  const result = maskAccountBillingFacts(model, 'unavailable')
  assert.deepEqual(result.facts[2], ['Bill', 'Unavailable'])
  assert.deepEqual(result.facts[3], ['Next payment', 'Unavailable'])
})
