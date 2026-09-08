import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const envExample = await readFile(new URL('../.env.example', import.meta.url), 'utf8')
const homeSource = await readFile(new URL('../src/next/MyTellinexNext.jsx', import.meta.url), 'utf8')
const tabsSource = await readFile(new URL('../src/next/CustomerTabs.jsx', import.meta.url), 'utf8')

 test('live customer surfaces remain off by default', () => {
  assert.match(envExample, /^VITE_MYTELLINEX_LIVE_ACCOUNT_BILLING=false$/m)
  assert.match(envExample, /^VITE_MYTELLINEX_LIVE_SERVICE=false$/m)
  assert.match(envExample, /^VITE_MYTELLINEX_LIVE_SUPPORT=false$/m)
  assert.match(envExample, /^VITE_MYTELLINEX_LIVE_NETWORK_HEALTH=false$/m)
})

test('Support tab is gated by the dedicated feature flag', () => {
  assert.match(homeSource, /VITE_MYTELLINEX_LIVE_SUPPORT === 'true'/)
  assert.match(homeSource, /<SupportTab enabled=\{liveSupportEnabled\}/)
})

test('Network tab is gated by the customer-safe health flag', () => {
  assert.match(homeSource, /VITE_MYTELLINEX_LIVE_NETWORK_HEALTH === 'true'/)
  assert.match(homeSource, /<NetworkTab enabled=\{liveNetworkHealthEnabled\}/)
  assert.match(tabsSource, /loadAuthenticatedNetworkHealth/)
})

test('Network tab treats unknown and unavailable telemetry as non-healthy', () => {
  assert.match(tabsSource, /Not yet verified/)
  assert.match(tabsSource, /Missing telemetry is never interpreted as healthy service/)
  assert.match(tabsSource, /does not yet have enough authoritative telemetry to verify your live service health/)
})

test('live Network mode suppresses prototype Home operational truth', () => {
  assert.match(homeSource, /liveAccountBillingEnabled \|\| liveServiceEnabled \|\| liveNetworkHealthEnabled/)
  assert.match(homeSource, /Service health pending integration/)
})
