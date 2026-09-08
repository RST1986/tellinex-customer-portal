const SUPPORT_COLUMNS = [
  'id',
  'subject',
  'ticket_type',
  'priority',
  'status',
  'created_at',
  'resolved_at',
].join(',')

const ALLOWED_TICKET_TYPES = new Set([
  'outage',
  'slow_speed',
  'billing',
  'installation',
  'general',
])

function assertClient(client) {
  if (!client?.auth?.getClaims || !client?.from) {
    throw new Error('A configured Supabase client is required.')
  }
}

async function verifiedUserId(client) {
  const { data, error } = await client.auth.getClaims()
  if (error) throw error
  const userId = data?.claims?.sub
  if (!userId) throw new Error('Authenticated user identity could not be verified.')
  return userId
}

async function ownedCustomerId(client, userId) {
  const result = await client
    .from('customer_auth_links')
    .select('customer_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (result.error) throw result.error
  const customerId = result.data?.customer_id
  if (!customerId) throw new Error('Customer ownership link is unavailable.')
  return customerId
}

export async function loadAuthenticatedSupportTickets(client, limit = 20) {
  assertClient(client)
  const userId = await verifiedUserId(client)

  const result = await client
    .from('customer_tickets')
    .select(SUPPORT_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (result.error) throw result.error
  return result.data ?? []
}

export async function createAuthenticatedSupportTicket(client, input) {
  assertClient(client)
  const userId = await verifiedUserId(client)

  const subject = input?.subject?.trim()
  if (!subject) throw new Error('Support ticket subject is required.')

  const customerId = await ownedCustomerId(client, userId)
  const requestedType = input?.ticketType || 'general'
  const ticketType = ALLOWED_TICKET_TYPES.has(requestedType) ? requestedType : 'general'

  const payload = {
    customer_id: customerId,
    user_id: userId,
    subject,
    ticket_type: ticketType,
    priority: 'normal',
    description: input?.description?.trim() || null,
    data_source: 'my_tellinex_app',
  }

  const result = await client
    .from('customer_tickets')
    .insert(payload)
    .select(SUPPORT_COLUMNS)
    .single()

  if (result.error) throw result.error
  return result.data
}
