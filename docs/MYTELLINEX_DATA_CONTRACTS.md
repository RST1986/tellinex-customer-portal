# MyTellinex Data Contracts

Status: RUNTIME-MAPPED / ACCESS GATED

This document defines the authenticated data contracts required before MyTellinex Next replaces any simulated or placeholder customer data. Runtime verification below is against the connected production Tellinex Command Centre Supabase project `egztpclpcnizcdtfugsv`.

## Principles

- Browser clients use `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` only.
- No `service_role` or secret key is permitted in client code.
- Identity is verified with Supabase Auth; authorization is enforced by RLS and ownership predicates.
- `TO authenticated` alone is not sufficient authorization.
- Every exposed table/view used by MyTellinex must have verified RLS and negative tests for cross-customer access.
- Runtime schema is the authority. Missing/unknown data renders as unavailable or pending integration; never synthesize production values.

## Verified runtime mapping

### Account — READY FOR CLIENT CONTRACT AFTER NEGATIVE TEST
Primary candidate: `public.customer_profiles`.
Verified customer-facing fields include `user_id`, `full_name`, `phone`, `address`, `plan_name`, `plan_speed`, `plan_price`, `plan_status`, `account_id`, `region`, `auto_pay_enabled`.
RLS is enabled. `cp_select` restricts SELECT to `auth.uid() = user_id`; UPDATE uses the same ownership predicate with `WITH CHECK`; INSERT also requires `auth.uid() = user_id`.

Do not use `public.customers` as the browser-facing account source: its SELECT policy is governance/staff-role based and tenant-scoped, not direct customer ownership.

### Service — BLOCKED ON CUSTOMER READ POLICY
Primary candidate: `public.subscriptions`.
Verified fields include `customer_id`, `plan_name`, `plan_type`, `speed_down_mbps`, `speed_up_mbps`, `monthly_price_usd`, `currency`, `billing_cycle`, `status`, `start_date`, `next_billing_date`.
RLS is enabled, but the current policy surface is `subscriptions_staff` (`ALL` for authenticated where `is_tellinex_staff()`). There is no verified customer-owned SELECT policy.

The browser must not query `subscriptions` until a narrowly scoped ownership policy is designed, migrated and negative-tested. Do not weaken `subscriptions_staff`.

### Billing — READY FOR CLIENT CONTRACT AFTER NEGATIVE TEST
Primary candidate: `public.customer_bills`.
Verified fields include `user_id`, `amount`, `currency`, `status`, `due_date`, `paid_date`, `period_start`, `period_end`, `invoice_pdf_url`, `description`, `line_items`, `tenant_id`.
RLS is enabled. `bills_sel` restricts SELECT to `auth.uid() = user_id`; staff retains a separate governed policy.

Sensitive provider identifiers such as Stripe IDs are not required by the MyTellinex UI contract and should not be selected by the browser.

### Support — READY FOR CLIENT CONTRACT AFTER NEGATIVE TEST
Primary candidate: `public.customer_tickets`.
Verified fields include `id`, `customer_id`, `ticket_type`, `subject`, `description`, `status`, `priority`, `resolution`, `created_at`, `resolved_at`.
RLS is enabled. `tickets_read_own_or_staff` restricts SELECT to `customer_id = auth.uid()` or staff. `tickets_insert_own_or_staff` applies the same ownership rule on INSERT. Customer UPDATE is not permitted; staff owns ticket updates.

The `customer_id = auth.uid()` naming/identity convention must be confirmed with positive and cross-customer negative tests before frontend binding.

### Network health — NOT CUSTOMER-READY
Candidates inspected: `public.network_health_summary` and `public.v_network_health`.
`network_health_summary` has RLS enabled but its authenticated SELECT policy resolves only for Tellinex staff. `v_network_health` is `security_invoker=true`, which is correct, but it represents aggregate asset health rather than a verified customer-service impact contract.

MyTellinex must continue to render network health as pending integration until a customer-safe service-impact source is identified and ownership/impact semantics are proven. No random uptime, speed, latency, outage count or maintenance status may be generated in the frontend.

### Customer 360 view — SAFE VIEW MODE, NOT YET SAFE CONTRACT
`public.customer_360` is `security_invoker=true`, which prevents the view from silently bypassing underlying RLS. It contains useful account/service/billing summary columns, including `user_id`, plan details, subscription identifiers, next billing date, open tickets and outstanding balance.

However, because service data depends on underlying relations whose customer SELECT access is not yet verified, do not use `customer_360` as the primary client contract until end-to-end owned-user and cross-user tests pass.

## Auth gate

Frontend identity gate should use `supabase.auth.getClaims()` for verified JWT claims where supported, with auth-state refresh handling. `getSession()` must not be used as the sole authorization basis.

## Required verification before implementation

For each candidate table/view/function:
1. confirm exact schema/name/columns from the connected Supabase project;
2. confirm Data API exposure/grants where applicable;
3. confirm RLS enabled;
4. inspect all SELECT policies and ownership predicates;
5. inspect views for `security_invoker` behavior or revoke exposed access;
6. inspect any `SECURITY DEFINER` function before client use;
7. run positive test as the owning user;
8. run negative cross-customer test;
9. only then bind the contract in the frontend.

## Current decision

The first live MyTellinex data integration slice should bind only Account (`customer_profiles`), Billing (`customer_bills`) and Support (`customer_tickets`) after authenticated positive/negative tests. Service (`subscriptions`) and Network Health remain blocked until purpose-built customer-safe access contracts exist.
