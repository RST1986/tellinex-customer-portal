# MyTellinex Account + Billing — RLS isolation evidence

Date: 2026-09-08
Project: Tellinex production Supabase (`egztpclpcnizcdtfugsv`)
Scope: read-only verification only

## Preconditions
- `public.customer_profiles` has RLS enabled.
- `public.customer_bills` has RLS enabled.
- Customer policies scope authenticated reads with `auth.uid() = user_id`.
- No production rows, policies, users, or schema objects were mutated for this verification.

## Dataset shape at verification time
- customer_profiles: 1 row / 1 distinct user_id
- customer_bills: 2 rows / 1 distinct user_id
- auth.users: 4 users
- profile rows matching auth.users: 1
- bill rows matching auth.users: 2

## Positive owner test
A transaction-scoped authenticated context was set to the owner user ID and run read-only.

Expected:
- visible profiles: 1
- visible bills: 2

Observed:
- visible profiles: 1
- visible bills: 2

Result: PASS

## Negative cross-customer test
A different existing authenticated user ID, with no ownership of the profile/bills, was used in a separate read-only transaction.

Expected:
- visible profiles: 0
- visible bills: 0

Observed:
- visible profiles: 0
- visible bills: 0

Result: PASS

## Decision
Account + Billing customer isolation is proven at the RLS layer for the currently populated production dataset.

This evidence authorizes the next controlled step: wiring Account + Billing into MyTellinex behind an explicit live-data feature flag. It does not authorize Service, Support, Network Health, commerce checkout, or any other customer-data surface.
