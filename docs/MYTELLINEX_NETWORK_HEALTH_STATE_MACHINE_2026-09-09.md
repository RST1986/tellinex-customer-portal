# MyTellinex Network Health Producer State Machine — 2026-09-09

Status: DETERMINISTIC STATE MACHINE READY; PRODUCTION PRODUCER STILL DISABLED.

## Purpose

Prepare the customer-safe Network Health producer logic without fabricating telemetry while the current linked customer has no ONT/router/service telemetry rows.

The state machine is pure application logic. It does not query NOC tables, write `customer_network_health`, or enable a production feature flag.

## Inputs

The state machine consumes normalized signals. Every accepted signal must be:
- tied to an authoritative customer/service binding;
- explicitly `authoritative=true`;
- explicitly `customerScoped=true`;
- classified as `unknown`, `healthy`, `degraded`, or `outage` by an approved source adapter;
- timestamped with `observedAt`;
- bounded by a future `validUntil` greater than `observedAt`;
- no more than 60 seconds in the future relative to producer time.

Raw optical power, packet loss, CPU, temperature or other telemetry thresholds are intentionally not defined here. Those thresholds require source-specific operational approval and calibration.

## Required-source model

The producer accepts an explicit `requiredSources` list. This prevents a single healthy source from silently standing in for other evidence that the production design later requires.

Example future policy: `['ont', 'router']`. This is an example only, not an activated production policy.

## State precedence

1. Missing authoritative customer binding -> `unknown`.
2. No fresh approved evidence -> `unknown`.
3. Any required source missing -> `unknown`.
4. Any required source explicitly `unknown` -> `unknown`.
5. Fresh authoritative customer-scoped `outage` evidence -> `outage`.
6. Otherwise, fresh authoritative customer-scoped `degraded` evidence -> `degraded`.
7. `healthy` only when every required source has fresh positive `healthy` evidence.
8. Anything else -> `unknown`.

Absence of incidents is never evidence of health.

## Candidate source adapters

Production schema candidates remain:
- `ont_inventory`
- `optical_power_readings`
- `router_health_readings`
- `service_control_log`
- `provisioning_queue`

At the current production audit, the linked MyTellinex customer has no rows in these sources, so the snapshot must remain `unknown`.

## Activation work still required

Before any producer may write a non-`unknown` snapshot:
1. populate and verify customer-to-ONT/router/service bindings;
2. define approved source-specific normalization rules and thresholds;
3. decide the production `requiredSources` policy;
4. define producer cadence and heartbeat comfortably inside the consumer five-minute freshness limit;
5. ensure producer failure writes or expires to `unknown`;
6. test healthy/degraded/outage transitions with real or controlled operational telemetry;
7. repeat owner-positive and cross-customer-negative RLS checks;
8. enable only through a controlled authenticated preview before production Home activation.

`READY_FOR_LIVE_HOME_HEALTH = NO` remains unchanged.
