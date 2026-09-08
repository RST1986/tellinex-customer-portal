import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createSupabaseBrowserClient,
  readSupabaseBrowserConfig,
  resetSupabaseBrowserClientForTests,
} from '../src/next/data/supabaseClient.js'

test('requires URL and publishable key', () => {
  assert.throws(() => readSupabaseBrowserConfig({}), /VITE_SUPABASE_URL/)
  assert.throws(
    () => readSupabaseBrowserConfig({ VITE_SUPABASE_URL: 'https://example.supabase.co' }),
    /VITE_SUPABASE_PUBLISHABLE_KEY/,
  )
})

test('accepts only the browser-safe config shape', () => {
  const config = readSupabaseBrowserConfig({
    VITE_SUPABASE_URL: ' https://example.supabase.co ',
    VITE_SUPABASE_PUBLISHABLE_KEY: ' sb_publishable_example ',
    SUPABASE_SERVICE_ROLE_KEY: 'must-not-be-consumed',
  })

  assert.deepEqual(config, {
    url: 'https://example.supabase.co',
    publishableKey: 'sb_publishable_example',
  })
})

test('creates a Supabase client from publishable config', () => {
  const client = createSupabaseBrowserClient({
    url: 'https://example.supabase.co',
    publishableKey: 'sb_publishable_example',
  })

  assert.equal(typeof client.auth.getClaims, 'function')
  assert.equal(typeof client.from, 'function')
  resetSupabaseBrowserClientForTests()
})
