# MyTellinex Support Identity + RLS Evidence — 2026-09-08

Status: PASS for the current customer Support ownership contract. Frontend ticket creation remains a separate gate.

## Identity defect found

`public.customer_tickets.customer_id` had no explicit identity contract. Existing RLS compared `customer_id` directly with `auth.uid()`, while Tellinex GDPR processors already treated `customer_tickets.customer_id` as a customer-record identifier alongside other customer-owned tables.

The table had 0 rows, so the model could be corrected before any production ticket data required migration.

## Canonical identity contract

`customer_tickets` now uses two distinct identity fields:
- `customer_id` -> `public.customers.id`
- `user_id` -> `auth.users.id`

Both foreign keys are present. `customer_id` remains compatible with the existing TCC/GDPR customer-record workflows; `user_id` records the authenticated portal identity when a MyTellinex customer creates a ticket.

## RLS ownership rule

Customer read/insert requires all of the following:
- authenticated `auth.uid()` exists
- `customer_tickets.user_id = auth.uid()`
- `customer_tickets.customer_id` is non-null
- `customer_auth_links` proves the same Auth user owns that customer record

Staff retains separate staff read/insert/update policies. No customer UPDATE policy was introduced.

## Production proof

Using existing production Auth identities:
- owner insert into own `(user_id, customer_id)` pair: PASS inside transaction rollback
- non-owner insert against another customer's `customer_id`: REJECTED by RLS
- ticket rows after tests: 0

No fixture users and no persistent test tickets were created.

## Data-source contract

MyTellinex-originated tickets must use the existing governed data source `my_tellinex_app`.

## Frontend release boundary

This evidence closes the database identity ambiguity but does not yet authorize a customer-facing ticket composer. Before enabling writes in the UI, add a minimal adapter with explicit fields, validation, rate/abuse controls as appropriate, contract tests, error-safe UX, and a controlled feature flag.

## Estate-level security caveat

This Support PASS does not close unrelated Supabase estate findings, including the existing `spatial_ref_sys` RLS finding and the broad historical `SECURITY DEFINER` callable surface.
