# MyTellinex Network Health Gate — 2026-09-08

Status: `BLOCKED_BY_TELEMETRY_BINDING`.

## Decision

Do not expose a live MyTellinex network-health sentence, outage state, measured Internet speed, Wi-Fi quality, device count or maintenance impact until the authenticated customer can be deterministically connected to the relevant live network telemetry and incident topology.

## Existing views are not sufficient

The current security-invoker views named `network_customer_impact`, `incident_impact` and `neighbourhood_impact` use address, city, parish or region text matching to infer customer impact. `network_customer_impact` also exposes a global active-incident count rather than proving that an incident affects a particular customer.

These may be useful operational aids, but they are not an acceptable truth source for the MyTellinex promise: “outage that affects you”.

## Physical schema available

The production schema contains the components needed for a future deterministic chain:
- `customer_auth_links`: Auth user -> domain customer
- `ont_inventory.customer_id -> customers.id`
- `optical_power_readings.customer_id -> customers.id`
- `optical_power_readings.olt_id -> olt_devices.id`
- `olt_devices.asset_id -> network_assets.id`
- `network_incidents.root_cause_asset_id -> network_assets.id`
- router-health and service-control tables with customer identifiers

## Current production data readiness

For the currently linked customer, the audit observed:
- assigned ONTs: 0
- router-health readings: 0
- optical-power readings: 0
- service-control rows: 0
- Wi-Fi routers resolvable through ONT serial: 0
- OLT devices in the project: 0

Incident state at the same point in time:
- active/investigating/planned incidents: 1
- those with `root_cause_asset_id`: 0

Therefore there is no deterministic customer -> physical service -> affected asset -> incident path to validate today.

## Required unlock

Before enabling live Network Health:
1. provision authoritative customer-to-ONT/CPE bindings;
2. provision OLT/network-asset relationships;
3. ingest customer-scoped router/optical/availability telemetry with freshness timestamps;
4. require incidents to carry a root-cause/affected-asset relationship suitable for topology traversal;
5. derive a customer-impact projection from topology, not fuzzy location text;
6. enforce Auth/RLS isolation on the customer projection;
7. pass owner-positive and cross-customer-negative tests;
8. define stale/missing telemetry behavior as `Unavailable` or `Pending`, never `Healthy`;
9. validate deterministic health-state precedence for outage, WAN fault, Wi-Fi issue, engineer appointment and billing collision.

## UI behavior until unlock

MyTellinex must display `Pending integration` / `Network health pending` for live customer-data modes. Prototype health states remain permitted only in explicit prototype mode and must never be represented as production telemetry.
