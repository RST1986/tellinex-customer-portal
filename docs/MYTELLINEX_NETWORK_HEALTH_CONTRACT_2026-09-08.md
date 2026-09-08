# MyTellinex Customer Network Health Contract — 2026-09-08

Status: RLS CONTRACT PASS; FRESHNESS CONTRACT PASS; OPERATIONAL PRODUCER NOT YET LIVE.

## Why this exists

MyTellinex must answer whether *this customer's* service is healthy. Existing NOC/global surfaces such as `network_incidents`, `network_customer_impact`, `incident_impact`, `network_health_summary` and `v_network_health` do not provide a customer-authorized Auth-to-incident contract suitable for direct browser use.

At review time production contained one unresolved `network_incidents` row, but zero evidence that the incident affected the current MyTellinex customer. No such impact was inferred.

## Customer-safe snapshot

Production contains `public.customer_network_health` with one row per Auth/customer identity pair. The table is system-managed and customer read-only.

Allowed states:
- `unknown`
- `healthy`
- `degraded`
- `outage`

Fields used by the browser adapter:
- `state`
- `summary`
- `started_at`
- `estimated_resolution_at`
- `updated_at`
- `valid_until`

The browser does not read NOC/global incident tables.

## Authorization

- identity pair is constrained to `customer_auth_links(user_id, customer_id)`
- RLS enabled
- `authenticated`: SELECT only
- `anon`: no grants
- customer INSERT/UPDATE/DELETE: not granted
- own-row policy requires `user_id = (select auth.uid())`

Production isolation proof:
- owner: 1 visible row
- non-owner: 0 visible rows

## Truthfulness and freshness rule

A missing producer, missing snapshot or `unknown` snapshot must never be interpreted as healthy.

Every non-`unknown` snapshot must declare an explicit expiry in `valid_until`. Production enforces:

`state = 'unknown' OR (valid_until IS NOT NULL AND valid_until > updated_at)`

The browser then applies two independent fail-closed checks before rendering `healthy`, `degraded` or `outage`:
1. `updated_at` must still satisfy the existing freshness window and clock-skew checks;
2. `valid_until` must be a valid future timestamp and later than `updated_at`.

If either check fails, the result becomes `unknown` / `Service health data is temporarily unavailable`. Any stale previous summary is discarded so a message such as `Healthy` cannot survive after its evidence expires.

The existing customer row remains:
- `state = 'unknown'`
- `valid_until = NULL`
- no false healthy state.

## Producer audit

At this review point there is no database-resident producer for `customer_network_health`:
- no non-internal trigger on the table
- no stored function/procedure referencing the table
- no view referencing the table
- no pg_cron job referencing network health

An external producer could still be added in future, but it must satisfy this contract before activation.

## Activation gate

This contract alone does **not** authorize enabling live Home health. Before activation, an authoritative operational producer must update the snapshot from deterministic customer-impact evidence and must prove:
1. healthy is positively established, not inferred from absence of incidents;
2. outage/degraded state is linked to the affected customer/service;
3. ETR belongs to that customer-impact event;
4. every non-unknown update declares a bounded `valid_until` and refreshes before expiry;
5. stale, expired, missing or invalid producer data degrades to unknown;
6. owner-positive and cross-customer-negative tests remain green.

Until that producer exists, the Home health sentence remains pending integration.

## Security Advisor

No new advisor finding was introduced by the customer-safe snapshot. Existing estate-level findings remain separate, including `public.spatial_ref_sys` with RLS disabled and the broad historical authenticated `SECURITY DEFINER` surface.
