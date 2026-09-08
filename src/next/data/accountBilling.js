const ACCOUNT_COLUMNS = [
  'full_name',
  'plan_name',
  'plan_speed',
  'plan_status',
  'account_id',
  'auto_pay_enabled',
].join(',')

const BILL_COLUMNS = [
  'amount',
  'currency',
  'status',
  'due_date',
].join(',')

function assertClient(client) {
  if (!client?.auth?.getClaims || !client?.from) {
    throw new Error('A configured Supabase client is required.')
  }
}

export async function loadAuthenticatedAccountBilling(client) {
  assertClient(client)

  const { data: claimsData, error: claimsError } = await client.auth.getClaims()
  if (claimsError) throw claimsError

  const userId = claimsData?.claims?.sub
  if (!userId) throw new Error('Authenticated user identity could not be verified.')

  const [profileResult, billsResult] = await Promise.all([
    client
      .from('customer_profiles')
      .select(ACCOUNT_COLUMNS)
      .eq('user_id', userId)
      .maybeSingle(),
    client
      .from('customer_bills')
      .select(BILL_COLUMNS)
      .eq('user_id', userId)
      .order('due_date', { ascending: false })
      .limit(12),
  ])

  if (profileResult.error) throw profileResult.error
  if (billsResult.error) throw billsResult.error

  return {
    account: profileResult.data ?? null,
    bills: billsResult.data ?? [],
  }
}

export function toHomeBillingFacts(accountBilling) {
  const latestBill = accountBilling?.bills?.[0] ?? null

  return {
    customerName: accountBilling?.account?.full_name ?? null,
    accountId: accountBilling?.account?.account_id ?? null,
    planName: accountBilling?.account?.plan_name ?? null,
    planSpeed: accountBilling?.account?.plan_speed ?? null,
    planStatus: accountBilling?.account?.plan_status ?? null,
    billAmount: latestBill?.amount ?? null,
    billCurrency: latestBill?.currency ?? null,
    billStatus: latestBill?.status ?? null,
    billDueDate: latestBill?.due_date ?? null,
    autoPayEnabled: accountBilling?.account?.auto_pay_enabled ?? null,
  }
}
