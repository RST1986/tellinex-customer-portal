const SUPPORT_COLUMNS = [
  'id',
  'subject',
  'ticket_type',
  'priority',
  'status',
  'created_at',
  'resolved_at',
].join(',')

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

  const payload = {
    user_id: userId,
    subject,
    ticket_type: input?.ticketType || 'general',
    priority: input?.priority || 'normal',
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
