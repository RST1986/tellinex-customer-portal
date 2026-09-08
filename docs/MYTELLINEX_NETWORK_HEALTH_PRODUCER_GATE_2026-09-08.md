# MyTellinex Network Health Producer Gate — 2026-09-08

Status: CUSTOMER SNAPSHOT CONTRACT EXISTS; OPERATIONAL PRODUCER NOT READY.

## Current customer-safe surface

`public.customer_network_health` remains the only browser-facing Network Health surface for MyTellinex. It is customer read-only, RLS-scoped and initialized to `unknown` rather than inferring health from the absence of incidents.

## Candidate operational sources audited

The production schema contains several tables that could become deterministic producer inputs because they carry a `customer_id` or an ONT/router binding:
- `ont_inventory`
- `optical_power_readings`
- `router_health_readings`
- `service_control_log`
- `provisioning_queue`

For the currently linked MyTellinex customer, the audit observed:
- ONT inventory rows: 0
- optical power readings: 0
- router health readings: 0
- service-control events: 0
- provisioning rows: 0

Therefore there is currently no positive operational evidence from these candidate sources that can establish `healthy`, `degraded` or `outage` for this customer.

## Truthfulness decision

The current snapshot must remain `unknown`.

Do not derive customer health from:
- absence of a global incident
- location proximity alone
- aggregate NOC health
- an incident without authoritative customer/service impact linkage
- contracted plan speed
- stale telemetry

## Consumer freshness rule

The browser projection now fails closed when a non-`unknown` snapshot is stale or has an invalid timestamp.

Default maximum snapshot age: 5 minutes.

A snapshot also fails closed when its `updated_at` is more than 60 seconds in the future relative to the browser clock.

On freshness failure the customer receives an `unknown` state with a temporary-unavailability message; stale `healthy`, `degraded` or `outage` states are never presented as current truth.

The five-minute limit is a consumer safety boundary, not the final producer SLA. Before activation, the operational producer must publish at a cadence comfortably inside this window and have its own heartbeat/monitoring.

## Producer activation gate

A production producer may be activated only after all of the following are true:
1. the customer has an authoritative service/ONT/CPE binding;
2. at least one approved operational source produces fresh deterministic evidence;
3. `healthy` is positively established, not inferred from silence;
4. `degraded` and `outage` are tied to this customer/service;
5. incident ETR is tied to the same customer-impact event;
6. producer failure or staleness forces `unknown`;
7. owner-positive and cross-customer-negative RLS tests remain green;
8. the producer writes only the customer-safe snapshot and the browser never queries NOC/global tables directly.

## Release decision

`READY_FOR_LIVE_HOME_HEALTH = NO`.

The next operational task is to populate the missing customer-to-ONT/router/service telemetry binding and define the deterministic producer state machine. No synthetic or inferred health state should be written merely to make the UI appear complete.
