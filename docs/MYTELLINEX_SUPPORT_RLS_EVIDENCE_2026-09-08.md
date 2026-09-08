# MyTellinex Support RLS Evidence — 2026-09-08

Status: PASS for authenticated customer ticket ownership; UI release remains read-only.

## Canonical ownership model

Production uses two explicit identities for each customer ticket:
- `customer_tickets.user_id` -> `auth.users.id` (`ON DELETE SET NULL`)
- `customer_tickets.customer_id` -> `public.customers.id` (`ON DELETE SET NULL`)

The Auth-to-domain relationship is independently constrained through `public.customer_auth_links`, which is one-to-one for `user_id` and `customer_id`.

Customer authorization deliberately requires both identities to agree. This prevents either an Auth ID alone or a domain customer ID alone from becoming sufficient authority.

## Customer policies

Customer SELECT requires:
- a signed-in `auth.uid()`
- `customer_tickets.user_id = auth.uid()`
- non-null `customer_id`
- a matching `(user_id, customer_id)` row in `customer_auth_links`

Customer INSERT requires the same ownership proof and additionally requires a safe initial state:
- `status = 'open'`
- `priority = 'normal'`
- `assigned_to IS NULL`
- `resolution IS NULL`
- `resolved_at IS NULL`
- `data_source = 'my_tellinex_app'`
- creation timestamp within the policy's permitted current-time window

Staff SELECT/INSERT/UPDATE remain separately authorized. No customer UPDATE or DELETE policy is added.

## Isolation proof

Rollback-only production probes using existing Auth identities:
- owner insert with matching Auth + customer ownership: PASS
- distinct non-owner insert against the owner's customer: rejected with Postgres `42501` RLS violation — PASS
- persisted probe tickets after testing: 0

## Browser contract

Read fields are limited to:
- `id`
- `subject`
- `ticket_type`
- `priority`
- `status`
- `created_at`
- `resolved_at`

The creation adapter now resolves the authenticated user's `customer_id` from `customer_auth_links`, then pins both `user_id` and `customer_id`, plus `status='open'`, `priority='normal'` and `data_source='my_tellinex_app'`. It does not trust customer input for initial priority or status.

## UI boundary

`VITE_MYTELLINEX_LIVE_SUPPORT=false` by default.

The current UI slice exposes only read-only Support history on the dedicated SUPPORT tab. It does not expose create, edit, close, assignment or resolution controls. MyTellinex Home remains a customer health summary rather than a helpdesk dashboard.
