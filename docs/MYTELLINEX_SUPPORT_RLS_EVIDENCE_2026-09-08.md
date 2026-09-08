# MyTellinex Support RLS Evidence — 2026-09-08

Status: PASS for the current Support ownership contract.

## Identity correction

`public.customer_tickets.customer_id` had no foreign key and its existing customer policies compared that column directly with `auth.uid()`. Internal GDPR export code classifies `customer_tickets` as a customer-ID table alongside `subscriptions`, establishing the intended namespace as `public.customers.id`.

The SELECT and INSERT policies were therefore aligned to the existing `public.customer_auth_links` Auth-to-customer bridge. The staff UPDATE policy was left unchanged.

## Production policy behavior

- customer SELECT: own linked customer tickets only
- customer INSERT: only for own linked `customers.id`
- staff SELECT/INSERT remains allowed through `is_tellinex_staff()`
- staff UPDATE remains unchanged
- no customer UPDATE or DELETE policy added

## Proof

The table had 0 persisted rows at test time, so positive authorization was tested transactionally without leaving fixtures.

Owner probe:
- valid `customer_id` from the owner's Auth-to-customer bridge
- valid `ticket_type='general'`
- valid `data_source='my_tellinex_app'`
- INSERT succeeded
- transaction rolled back

Non-owner probe:
- same customer ID captured before switching to a distinct authenticated identity
- INSERT rejected with Postgres `42501` row-level security violation

Result: PASS.

## Frontend read contract

The Support adapter may select only:
- `id`
- `ticket_type`
- `subject`
- `status`
- `priority`
- `created_at`
- `resolved_at`

It does not expose `assigned_to`, internal resolution detail, customer email/name, or other internal fields.

## Release boundary

`VITE_MYTELLINEX_LIVE_SUPPORT=false` by default.

This slice prepares read-only customer ticket history. Although INSERT authorization has been proved, the customer-facing create-ticket control is deliberately not exposed by this slice.
