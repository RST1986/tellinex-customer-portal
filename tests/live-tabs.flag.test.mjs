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
})

test('Support tab is gated by the dedicated feature flag', () => {
  assert.match(homeSource, /VITE_MYTELLINEX_LIVE_SUPPORT === 'true'/)
  assert.match(homeSource, /<SupportTab enabled=\{liveSupportEnabled\}/)
})

test('Network Health remains explicitly pending rather than inferred', () => {
  assert.match(tabsSource, /Pending telemetry binding/)
  assert.match(tabsSource, /will not infer outages from a city, parish or address match/)
})
