const NETWORK_HEALTH_COLUMNS = [
  'state',
  'summary',
  'started_at',
  'estimated_resolution_at',
  'updated_at',
].join(',')

function assertClient(client) {
  if (!client?.auth?.getClaims || !client?.from) {
    throw new Error('A configured Supabase client is required.')
  }
}

export async function loadAuthenticatedNetworkHealth(client) {
  assertClient(client)

  const { data: claimsData, error: claimsError } = await client.auth.getClaims()
  if (claimsError) throw claimsError

  const userId = claimsData?.claims?.sub
  if (!userId) throw new Error('Authenticated user identity could not be verified.')

  const result = await client
    .from('customer_network_health')
    .select(NETWORK_HEALTH_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle()

  if (result.error) throw result.error
  return result.data ?? null
}

export function toCustomerHealthModel(row) {
  if (!row || row.state === 'unknown') {
    return {
      state: 'unknown',
      tone: 'warning',
      health: 'Service health pending integration',
      summary: row?.summary ?? null,
      estimatedResolutionAt: null,
      startedAt: null,
      updatedAt: row?.updated_at ?? null,
    }
  }

  if (row.state === 'healthy') {
    return {
      state: 'healthy',
      tone: 'success',
      health: row.summary || 'Your Tellinex service is healthy',
      summary: row.summary ?? null,
      estimatedResolutionAt: null,
      startedAt: null,
      updatedAt: row.updated_at ?? null,
    }
  }

  if (row.state === 'outage') {
    return {
      state: 'outage',
      tone: 'danger',
      health: row.summary || 'An outage is affecting your service',
      summary: row.summary ?? null,
      estimatedResolutionAt: row.estimated_resolution_at ?? null,
      startedAt: row.started_at ?? null,
      updatedAt: row.updated_at ?? null,
    }
  }

  return {
    state: 'degraded',
    tone: 'warning',
    health: row.summary || 'Your service is degraded',
    summary: row.summary ?? null,
    estimatedResolutionAt: row.estimated_resolution_at ?? null,
    startedAt: row.started_at ?? null,
    updatedAt: row.updated_at ?? null,
  }
}
