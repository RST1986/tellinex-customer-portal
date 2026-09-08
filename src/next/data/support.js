const LINK_COLUMNS = 'customer_id'
const TICKET_COLUMNS = [
  'id',
  'ticket_type',
  'subject',
  'status',
  'priority',
  'created_at',
  'resolved_at',
].join(',')

function assertClient(client) {
  if (!client?.auth?.getClaims || !client?.from) {
    throw new Error('A configured Supabase client is required.')
  }
}

export async function loadAuthenticatedSupport(client) {
  assertClient(client)

  const { data: claimsData, error: claimsError } = await client.auth.getClaims()
  if (claimsError) throw claimsError

  const userId = claimsData?.claims?.sub
  if (!userId) throw new Error('Authenticated user identity could not be verified.')

  const linkResult = await client
    .from('customer_auth_links')
    .select(LINK_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle()

  if (linkResult.error) throw linkResult.error
  const customerId = linkResult.data?.customer_id
  if (!customerId) return []

  const ticketsResult = await client
    .from('customer_tickets')
    .select(TICKET_COLUMNS)
    .eq('customer_id', customerId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (ticketsResult.error) throw ticketsResult.error
  return ticketsResult.data ?? []
}

export function toSupportSummary(tickets) {
  return (tickets ?? []).map((ticket) => ({
    id: ticket.id,
    type: ticket.ticket_type ?? null,
    subject: ticket.subject ?? null,
    status: ticket.status ?? null,
    priority: ticket.priority ?? null,
    createdAt: ticket.created_at ?? null,
    resolvedAt: ticket.resolved_at ?? null,
  }))
}
