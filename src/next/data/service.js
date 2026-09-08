const LINK_COLUMNS = 'customer_id'
const SERVICE_COLUMNS = [
  'plan_name',
  'speed_down_mbps',
  'speed_up_mbps',
  'status',
].join(',')

function assertClient(client) {
  if (!client?.auth?.getClaims || !client?.from) {
    throw new Error('A configured Supabase client is required.')
  }
}

export async function loadAuthenticatedService(client) {
  assertClient(client)

  const { data: claimsData, error: claimsError } = await client.auth.getClaims()
  if (claimsError) throw claimsError

  const userId = claimsData?.claims?.sub
  if (!userId) throw new Error('Authenticated user identity could not be verified.')

  const linkResult = await client
    .from('customer_auth_links')
    .select(LINK_COLUMNS)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (linkResult.error) throw linkResult.error
  const customerId = linkResult.data?.customer_id
  if (!customerId) return null

  const serviceResult = await client
    .from('subscriptions')
    .select(SERVICE_COLUMNS)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (serviceResult.error) throw serviceResult.error
  return serviceResult.data ?? null
}

export function toServiceSummary(service) {
  if (!service) return null

  return {
    planName: service.plan_name ?? null,
    speedDownMbps: service.speed_down_mbps ?? null,
    speedUpMbps: service.speed_up_mbps ?? null,
    status: service.status ?? null,
  }
}
