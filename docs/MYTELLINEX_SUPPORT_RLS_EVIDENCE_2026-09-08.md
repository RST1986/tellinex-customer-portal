# MyTellinex Support RLS Evidence — 2026-09-08

Status: PASS for authenticated customer ticket read/create contract.

## Previous ambiguity

`public.customer_tickets.customer_id` had no foreign key but customer RLS policies compared it directly with `auth.uid()`. That conflated a domain customer identifier with an Auth user identifier without schema evidence.

At normalization time:
- ticket rows: 0
- functions referencing `customer_tickets`: 0
- views referencing `customer_tickets`: 0

This allowed the ownership model to be corrected before live customer ticket data existed.

## Normalized ownership

Production now includes:
- `customer_tickets.user_id uuid references auth.users(id) on delete set null`
- index on `(user_id, created_at desc)`
- customer INSERT policy requires `user_id = (select auth.uid())`
- customer SELECT policy requires `user_id = (select auth.uid())`
- staff INSERT/SELECT remain separately authorized by `is_tellinex_staff()`
- existing staff UPDATE policy remains staff-only

`customer_id` remains available for the domain/CRM customer relationship and is no longer used as the Auth ownership key.

## Data governance

Customer-created tickets use the existing governed source value `my_tellinex_app`, accepted by `is_valid_data_source()`.

Allowed ticket type and status constraints remain enforced by the existing database checks.

## Isolation proof

All tests used transactions that were rolled back, so no fixture ticket remained in production.

Observed:
- owner authenticated insert using their own `user_id`: PASS
- owner can read the inserted ticket: 1 visible
- separate authenticated non-owner against the same rolled-back fixture: 0 visible

## Browser contract

Read fields are limited to:
- id
- subject
- ticket_type
- priority
- status
- created_at
- resolved_at

Customer ticket creation pins `user_id` to the verified JWT subject and pins `data_source` to `my_tellinex_app`.

This contract does not authorize customer UPDATE, staff assignment, resolution mutation, or exposure of internal support workflow fields.

## UI boundary

The adapter is prepared for the SUPPORT surface. It is intentionally not wired into the Home screen because MyTellinex Home remains a customer health summary, not a helpdesk dashboard.
