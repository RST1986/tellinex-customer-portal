const ACCOUNT_COLUMNS = [
  'full_name',
  'phone',
  'address',
  'plan_name',
  'plan_speed',
  'plan_price',
  'plan_status',
  'account_id',
  'region',
  'auto_pay_enabled',
  'auto_pay_last_attempt_at',
  'auto_pay_last_error',
].join(',')

const BILL_COLUMNS = [
  'id',
  'amount',
  'currency',
  'status',
  'due_date',
  'paid_date',
  'period_start',
  'period_end',
  'invoice_pdf_url',
  'description',
  'line_items',
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
    billAmount: latestBill?.amount ?? null,
    billCurrency: latestBill?.currency ?? null,
    billStatus: latestBill?.status ?? null,
    billDueDate: latestBill?.due_date ?? null,
    autoPayEnabled: accountBilling?.account?.auto_pay_enabled ?? null,
  }
}
