# MyTellinex Customer Network Health Contract — 2026-09-08

Status: RLS CONTRACT PASS; OPERATIONAL PRODUCER NOT YET LIVE.

## Why this exists

MyTellinex must answer whether *this customer's* service is healthy. Existing NOC/global surfaces such as `network_incidents`, `network_customer_impact`, `incident_impact`, `network_health_summary` and `v_network_health` do not provide a customer-authorized Auth-to-incident contract suitable for direct browser use.

At review time production contained one unresolved `network_incidents` row, but zero `customer_notifications` and zero `customer_sla_credits`. Therefore no evidence existed that the incident affected the current MyTellinex customer. No such impact was inferred.

## Customer-safe snapshot

Production now contains `public.customer_network_health` with one row per Auth/customer identity pair. The table is system-managed and customer read-only.

Allowed states:
- `unknown`
- `healthy`
- `degraded`
- `outage`

Fields exposed to the browser adapter:
- `state`
- `summary`
- `started_at`
- `estimated_resolution_at`
- `updated_at`

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

## Truthfulness rule

A missing producer or an unpopulated snapshot must never be interpreted as healthy. The initial existing customer row was created as:

`state = 'unknown'`

with summary `Network health integration pending`.

The frontend mapping preserves `unknown` as `Service health pending integration`.

## Activation gate

This contract alone does **not** authorize enabling live Home health. Before activation, an authoritative operational producer must update the snapshot from deterministic customer-impact evidence and must prove:
1. healthy is positively established, not inferred from absence of incidents;
2. outage/degraded state is linked to the affected customer/service;
3. ETR belongs to that customer-impact event;
4. stale producer data degrades to unknown;
5. owner-positive and cross-customer-negative tests remain green.

Until that producer exists, the Home health sentence remains pending integration.

## Security Advisor

No new advisor finding was introduced by this table. Existing estate-level findings remain separate, including `public.spatial_ref_sys` with RLS disabled and the broad historical authenticated `SECURITY DEFINER` surface.
