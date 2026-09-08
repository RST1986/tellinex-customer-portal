# MyTellinex Live Preview Build Gate

This gate proves the MyTellinex Next bundle compiles with the live Account + Billing code path enabled before any authenticated preview deployment.

It does not contact Supabase and does not use production credentials.

The CI build uses placeholder browser-safe values only:
- a non-production Supabase-shaped URL
- a dummy publishable-key-shaped value

Required build combinations:
1. legacy/default (`VITE_MYTELLINEX_NEXT=false`, live Account/Billing off)
2. MyTellinex Next prototype (`VITE_MYTELLINEX_NEXT=true`, live Account/Billing off)
3. MyTellinex Next live Account/Billing bundle (`VITE_MYTELLINEX_NEXT=true`, `VITE_MYTELLINEX_LIVE_ACCOUNT_BILLING=true`)

Passing this gate authorizes only a controlled authenticated preview validation. It does not enable production live data or authorize Service, Support, Network Health or writes.
