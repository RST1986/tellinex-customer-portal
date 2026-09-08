const SUPPORT_COLUMNS = [
  'id',
  'subject',
  'ticket_type',
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

export async function loadAuthenticatedSupportTickets(client) {
  assertClient(client)

  const { data: claimsData, error: claimsError } = await client.auth.getClaims()
  if (claimsError) throw claimsError

  const userId = claimsData?.claims?.sub
  if (!userId) throw new Error('Authenticated user identity could not be verified.')

  const result = await client
    .from('customer_tickets')
    .select(SUPPORT_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (result.error) throw result.error
  return result.data ?? []
}
