import { createClient } from '@supabase/supabase-js'

let browserClient = null

export function readSupabaseBrowserConfig(env = import.meta.env) {
  const url = env?.VITE_SUPABASE_URL?.trim()
  const publishableKey = env?.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url) {
    throw new Error('VITE_SUPABASE_URL is required before enabling live MyTellinex data.')
  }

  if (!publishableKey) {
    throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY is required before enabling live MyTellinex data.')
  }

  return { url, publishableKey }
}

export function createSupabaseBrowserClient(config) {
  if (!config?.url || !config?.publishableKey) {
    throw new Error('Supabase browser client requires URL and publishable key.')
  }

  return createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

export function getSupabaseBrowserClient(env = import.meta.env) {
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient(readSupabaseBrowserConfig(env))
  }

  return browserClient
}

export function resetSupabaseBrowserClientForTests() {
  browserClient = null
}
