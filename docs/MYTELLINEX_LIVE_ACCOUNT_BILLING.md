# MyTellinex Live Account + Billing Gate

## Default

`VITE_MYTELLINEX_LIVE_ACCOUNT_BILLING=false`

The default MyTellinex Next experience remains prototype-only for Home facts.

## When enabled

The browser creates the Supabase client only from:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The authenticated adapter verifies `auth.getClaims()` and reads only the current user's RLS-scoped `customer_profiles` and `customer_bills` rows.

Only these Home values may be replaced by live data in this slice:
- customer first name for greeting
- Bill
- Next payment

Internet, Wi-Fi, devices, usage, health sentence, outage, engineer state and contextual actions remain prototype state and must not be represented as production telemetry.

## RLS evidence

Production read-only isolation test on 2026-09-08:
- owning authenticated identity: 1 profile, 2 bills visible
- non-owning authenticated identity: 0 profiles, 0 bills visible

See `MYTELLINEX_ACCOUNT_BILLING_RLS_EVIDENCE_2026-09-08.md`.

## Still blocked

This feature gate does not authorize Service, Support, Network Health, writes, service-role keys, checkout, or any other production integration.
