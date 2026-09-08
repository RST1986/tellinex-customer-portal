import test from 'node:test'
import assert from 'node:assert/strict'
import { readSupabaseBrowserConfig } from '../src/next/data/supabaseClient.js'

test('live Account Billing config requires only browser-safe Supabase values', () => {
  const config = readSupabaseBrowserConfig({
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
    VITE_SUPABASE_SERVICE_ROLE_KEY: 'must-not-be-used',
  })

  assert.deepEqual(config, {
    url: 'https://example.supabase.co',
    publishableKey: 'sb_publishable_example',
  })
})
