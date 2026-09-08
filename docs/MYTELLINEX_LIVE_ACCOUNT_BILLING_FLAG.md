# MyTellinex Live Account + Billing Feature Flag

## Flag

`VITE_MYTELLINEX_LIVE_ACCOUNT_BILLING=false` by default.

## When disabled

MyTellinex Next remains the five-state prototype and does not initialise Account/Billing reads.

## When enabled

The browser client uses only:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The authenticated adapter verifies `auth.getClaims()` and reads only the current user's rows from:
- `public.customer_profiles`
- `public.customer_bills`

Only these Home surfaces may become live in this slice:
- customer first name in greeting
- Bill
- Next payment

Internet, Wi-Fi, Devices, Usage, health sentence, outages, engineer state and other operational facts remain prototype data and are labelled as such.

## Failure behaviour

If live Account/Billing is enabled but still loading, Bill and Next payment show `Loading…`.
If the authenticated read is unavailable or fails, they show `Unavailable`.
Prototype billing values are never displayed while the live flag is active but unresolved.
Raw Supabase errors are not rendered to the customer.

## Security evidence

Production RLS isolation was verified read-only on 2026-09-08 using one existing owning Auth identity and one existing non-owning Auth identity:
- owner: 1 visible profile, 2 visible bills
- non-owner: 0 visible profiles, 0 visible bills

See `docs/MYTELLINEX_ACCOUNT_BILLING_RLS_EVIDENCE_2026-09-08.md`.

## Explicitly out of scope

No Service, Support or Network Health live binding.
No browser secret/service-role key.
No database mutation.
No production flag enablement in this change.
