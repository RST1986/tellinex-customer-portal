# MyTellinex WAN Usage Counter Contract — 2026-09-09

Status: COUNTER-DELTA PRIMITIVE READY; MONTHLY USAGE PRODUCER NOT READY.

## Purpose

Define safe arithmetic and identity semantics for cumulative WAN byte counters without claiming that the current `wifi_routers` table is an authoritative monthly-usage source.

The current production FTTH customer has no router rows and Tellinex does not yet expose a BNG/AAA/RADIUS/IPFIX/NetFlow accounting source in the public schema.

## Safe delta contract

Two cumulative counter samples may produce a usage delta only when all of the following are true:
- both samples are authoritative;
- both samples are explicitly customer-scoped;
- customer identity is unchanged;
- device identity is unchanged;
- counter generation is unchanged and explicit;
- timestamps are valid and strictly increasing;
- RX/TX counters are non-negative exact integers;
- RX and TX are monotonic non-decreasing.

If any requirement fails, the result is `unavailable`; the implementation never guesses a reset, rollover or replacement delta.

## Exact integer handling

WAN counters can grow beyond JavaScript's safe integer range. Counter arithmetic therefore uses integer-safe `BigInt` conversion and returns byte deltas as decimal strings.

Decimal GB conversion uses 1 GB = 1,000,000,000 bytes and also returns a decimal string. This avoids silent floating-point rounding in the producer primitive.

## Rebaseline rules

The producer primitive refuses to bridge:
- router replacement;
- counter-generation change;
- counter decrease/reset/rollover.

A future upstream collector must establish a new baseline after these events. Missing usage during an unmeasured boundary must remain missing unless an authoritative accounting source can reconstruct it.

## What this does not solve

This contract does not yet define:
- sampling cadence;
- immutable usage bucket storage;
- billing/calendar period boundaries;
- complete-period coverage checks;
- multi-router/CPE aggregation;
- authoritative network accounting source;
- customer-safe RLS projection;
- retention/reconciliation policy.

Therefore it must not be used to display a monthly total in MyTellinex today.

## Next Usage gate

The next safe implementation step is an immutable time-bucket contract that consumes only validated deltas, explicitly records coverage gaps, and refuses to publish a complete period when required intervals are missing.

`READY_FOR_LIVE_USAGE = NO` remains unchanged.
