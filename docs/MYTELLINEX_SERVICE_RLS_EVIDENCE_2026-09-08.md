# MyTellinex Service RLS Evidence — 2026-09-08

Status: PASS for the current read-only Service ownership contract.

## Production project

Supabase project: `egztpclpcnizcdtfugsv`.

## Problem closed

`public.subscriptions.customer_id` references `public.customers.id`, while MyTellinex authenticates customers through Supabase Auth. The previous schema had no authoritative Auth-to-customer bridge and therefore `subscriptions` remained staff-only.

## Ownership bridge

Production now contains `public.customer_auth_links` with:
- `user_id` -> `auth.users.id`
- `customer_id` -> `public.customers.id`
- RLS enabled
- `authenticated`: SELECT only
- `anon`: no grants
- no customer-side INSERT, UPDATE or DELETE grants
- unique `user_id`
- unique `customer_id`

The initial link was backfilled only after the existing production dataset proved an unambiguous 1:1 match through `customer_profiles.account_id = customers.account_number`. An independent Auth-email match agreed with the same customer relationship.

Pre-migration integrity checks observed:
- duplicate customer account numbers: 0
- duplicate profile account IDs: 0
- duplicate profile user IDs: 0
- unmatched profiles: 0
- ambiguous profile links: 0

## Subscription policy

`subscriptions_customer_select` permits SELECT to `authenticated` only when an owned row exists in `customer_auth_links` for the requesting `(select auth.uid())` and the subscription's `customer_id`.

The existing staff policy remains unchanged. No customer write policy was added.

## Isolation proof

Read-only authenticated simulation using existing production Auth identities:
- owner: 1 visible ownership link, 1 visible subscription — PASS
- non-owner: 0 visible ownership links, 0 visible subscriptions — PASS

No test users or fixture subscriptions were created.

## Browser contract

The MyTellinex Service adapter is limited to:
- `plan_name`
- `speed_down_mbps`
- `speed_up_mbps`
- `status`

Provider/internal IDs, Stripe identifiers, pricing metadata and other subscription fields are not selected by this slice.

## Truthfulness boundary

Contracted plan speed is not live network telemetry. It must be shown in a dedicated Service summary and must not replace the Home `Internet` health fact. Network health, Wi-Fi quality, devices, usage, outages and engineer state remain pending approved live contracts.

## Global Supabase findings still open

The Service bridge introduced no new Security Advisor finding. Existing estate-level findings remain outside this slice, including:
- `public.spatial_ref_sys` reported with RLS disabled
- broad authenticated exposure of existing `SECURITY DEFINER` functions
- PostGIS / pg_net extension placement warnings

This PASS authorizes read-only Service data for the controlled MyTellinex feature gate only; it is not a statement that the entire Supabase project is security-clean.
