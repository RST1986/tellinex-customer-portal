# MyTellinex Account + Billing RLS Evidence — 2026-09-08

Status: PASS for the current production ownership contract.

## Scope

Production Supabase project: `egztpclpcnizcdtfugsv`.

Tables tested:
- `public.customer_profiles`
- `public.customer_bills`

No rows, policies, schemas, users, or credentials were created or mutated for this test.

## Dataset sufficiency

At test time:
- customer profile rows: 1
- distinct profile owners: 1
- customer bill rows: 2
- distinct bill owners: 1
- Auth users: 4
- profile rows matching Auth users: 1
- bill rows matching Auth users: 2

This provided one real owning Auth identity and at least one real non-owning Auth identity without creating production fixtures.

## Read-only authenticated simulation

The test used a transaction marked read-only, set the JWT subject for an existing Auth identity, switched to the `authenticated` database role, counted visible rows, and rolled back.

### Owning identity

Expected: owner can see their own Account + Billing rows.

Observed:
- visible `customer_profiles`: 1
- visible `customer_bills`: 2

Result: PASS.

### Non-owning identity

Expected: another authenticated user cannot see the owner's Account + Billing rows.

Observed:
- visible `customer_profiles`: 0
- visible `customer_bills`: 0

Result: PASS.

## Release decision

The RLS ownership gate for read-only Account + Billing is satisfied for the current production contract.

This does **not** authorize:
- Service data exposure
- Support data exposure
- Network Health exposure
- write/update operations
- service-role use in the browser
- bypassing Auth/RLS

Live Account + Billing rendering must remain behind an explicit feature flag until the UI integration passes CI and authenticated browser validation.
