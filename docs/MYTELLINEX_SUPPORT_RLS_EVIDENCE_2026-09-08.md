# MyTellinex Support RLS Evidence — 2026-09-08

Status: PASS for the current Support ownership contract.

## Identity correction

`public.customer_tickets.customer_id` previously had ambiguous ownership semantics: customer policies compared it directly with `auth.uid()`, while the customer service domain uses `public.customers.id`.

The production contract is now explicit:
- `user_id` is a foreign key to `auth.users.id`
- `customer_id` is a foreign key to `public.customers.id`
- customer ownership is verified through `public.customer_auth_links`

## Production policy behavior

Final customer policies require both:
- `user_id = (select auth.uid())`
- `customer_id` belongs to that same Auth identity through `customer_auth_links`

Staff policies remain separate:
- staff SELECT via `is_tellinex_staff()`
- staff INSERT via `is_tellinex_staff()`
- staff UPDATE unchanged

No customer UPDATE or DELETE policy was added.

Final table privileges:
- `anon`: no grants
- `authenticated`: INSERT, SELECT, UPDATE
- authenticated DELETE, REFERENCES and TRIGGER privileges revoked

## Proof

The table had 0 persisted rows at test time, so authorization was tested transactionally without leaving fixtures.

Owner probe:
- valid `user_id` for the signed-in identity
- valid `customer_id` from that identity's Auth-to-customer bridge
- valid `ticket_type='general'`
- valid `data_source='my_tellinex_app'`
- INSERT succeeded and the owner could read the row
- transaction rolled back

Non-owner probe:
- a distinct authenticated identity attempted to insert against the owner's `customer_id`
- INSERT was rejected with Postgres `42501` row-level security violation

Post-test verification:
- persisted tickets: 0
- permissive customer policies were consolidated so weaker duplicate policies cannot bypass the bridge predicate

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

The browser query explicitly filters by both `customer_id` and `user_id`; RLS remains the authorization boundary.

It does not expose `assigned_to`, internal resolution detail, customer email/name, or other internal fields.

## Release boundary

`VITE_MYTELLINEX_LIVE_SUPPORT=false` by default.

This slice exposes read-only customer ticket history only. Although INSERT authorization has been proved, the customer-facing create-ticket control is deliberately not exposed by this slice.
