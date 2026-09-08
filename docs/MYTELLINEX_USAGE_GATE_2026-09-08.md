# MyTellinex Usage Gate — 2026-09-08

Status: `BLOCKED_BY_USAGE_TELEMETRY`.

## Decision

Do not display monthly data consumption, quota progress, daily usage, household traffic totals or usage-based recommendations in live MyTellinex until Tellinex has an authoritative customer-scoped usage producer with explicit period semantics.

The USAGE tab must remain pending rather than reuse unrelated tables or infer consumption from speed tests.

## Production discovery

Candidate production sources were inspected for customer/user ownership and traffic-like metrics.

Observed row counts at audit time:
- `wifi_routers`: 0 total, 0 for the linked customer Auth user
- `speed_test_history`: 0 total, 0 for the linked customer
- `speed_tests`: 0 total, 0 for the linked customer
- `fwa_subscribers`: 0 total, 0 for the linked customer

## Candidate rejection

### `speed_test_history` / `speed_tests`

These tables represent point-in-time speed measurements. Download/upload Mbps is throughput measured during a test, not data consumed during a billing or calendar period. They must not be converted into monthly usage.

### `fwa_subscribers.data_used_gb`

This is an FWA-specific domain table and currently contains no rows. It is not an approved source for the FTTH MyTellinex customer experience.

### `wifi_routers.wan_rx_bytes` / `wan_tx_bytes`

The schema exposes WAN byte counters and user-scoped RLS, but there are currently zero router rows. More importantly, a raw cumulative counter is not sufficient for monthly usage unless the producer contract defines:
- counter origin and reset behavior
- sampling cadence
- monotonicity / rollover handling
- billing-period boundaries
- missing/stale sample behavior
- router replacement behavior
- aggregation across multiple CPE devices

Without those semantics, subtracting counters could create incorrect customer billing/usage claims.

## Existing security posture

Customer policies already exist for user-scoped speed-test reads and `wifi_routers` reads. That is useful for future integration but does not make these datasets a valid monthly-usage truth source.

## Required unlock

Before enabling live USAGE:
1. choose the authoritative usage producer (BNG/AAA/IPFIX/OLT/CPE or another governed source);
2. bind usage deterministically to the Auth/customer ownership bridge;
3. define ingress/egress byte semantics and unit conversion;
4. define immutable time buckets and customer billing/calendar periods;
5. define reset, rollover, replacement and stale-data rules;
6. retain enough history for reproducible monthly totals;
7. expose only a customer-safe projection with RLS;
8. pass owner-positive and cross-customer-negative tests;
9. validate calculated totals against the network source of truth;
10. render missing data as `Unavailable` / `Pending`, never as zero or estimated usage.

## UI behavior until unlock

The USAGE tab remains a pending approved live contract. MyTellinex must not show prototype monthly consumption when any live customer-data mode is enabled.

This gate does not block Account/Billing, Service, Support or future verified Network Health work.
