const NETWORK_HEALTH_COLUMNS = [
  'state',
  'summary',
  'started_at',
  'estimated_resolution_at',
  'updated_at',
  'valid_until',
].join(',')

export const DEFAULT_NETWORK_HEALTH_MAX_AGE_MS = 5 * 60 * 1000
const MAX_FUTURE_CLOCK_SKEW_MS = 60 * 1000

function assertClient(client) {
  if (!client?.auth?.getClaims || !client?.from) {
    throw new Error('A configured Supabase client is required.')
  }
}

function unknownModel(row, health = 'Service health pending integration', preserveSummary = true) {
  return {
    state: 'unknown',
    tone: 'warning',
    health,
    summary: preserveSummary ? row?.summary ?? null : null,
    estimatedResolutionAt: null,
    startedAt: null,
    updatedAt: row?.updated_at ?? null,
    validUntil: row?.valid_until ?? null,
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

export function toCustomerHealthModel(
  row,
  {
    nowMs = Date.now(),
    maxAgeMs = DEFAULT_NETWORK_HEALTH_MAX_AGE_MS,
  } = {},
) {
  if (!row || row.state === 'unknown') return unknownModel(row)

  const updatedAtMs = Date.parse(row.updated_at ?? '')
  const validUntilMs = Date.parse(row.valid_until ?? '')
  const ageMs = nowMs - updatedAtMs
  const freshTimestamp = Number.isFinite(updatedAtMs)
    && Number.isFinite(maxAgeMs)
    && maxAgeMs >= 0
    && ageMs <= maxAgeMs
    && ageMs >= -MAX_FUTURE_CLOCK_SKEW_MS
  const declaredValidity = Number.isFinite(validUntilMs)
    && validUntilMs > nowMs
    && validUntilMs > updatedAtMs

  if (!freshTimestamp || !declaredValidity) {
    return unknownModel(row, 'Service health data is temporarily unavailable', false)
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
      validUntil: row.valid_until ?? null,
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
      validUntil: row.valid_until ?? null,
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
    validUntil: row.valid_until ?? null,
  }
}
