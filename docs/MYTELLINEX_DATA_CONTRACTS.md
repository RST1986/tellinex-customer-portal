# MyTellinex Data Contracts

Status: DESIGN GATE

This document defines the minimum authenticated data contracts required before MyTellinex Next replaces any simulated or placeholder customer data.

## Principles

- Browser clients use `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` only.
- No `service_role` or secret key is permitted in client code.
- Identity is verified with Supabase Auth; authorization is enforced by RLS and ownership predicates.
- `TO authenticated` alone is not sufficient authorization.
- Every exposed table/view used by MyTellinex must have verified RLS and negative tests for cross-customer access.
- Do not infer table names or columns from UI labels. Runtime schema is the authority.
- Missing/unknown data renders as unavailable or pending integration; never synthesize production values.

## Required domains

### Account
Required: customer identity reference, display name, account status, contact-safe display fields.
Ownership invariant: authenticated user can read only their customer/account relationship.

### Service
Required: service identifier, product/plan label, lifecycle state, access technology, provisioned speed profile where authoritative.
Ownership invariant: service is reachable only through an account relationship owned by the authenticated user.

### Billing
Required: current balance or next bill amount, currency, due date, payment/autopay state, statement references.
Ownership invariant: billing rows are scoped to the authenticated customer/account.

### Network health
Required: current service-impact state and authoritative timestamp/source.
No random uptime, speed, latency, outage count or maintenance status may be generated in the frontend.

### Support
Required: ticket/case identifier, status, created/updated timestamps, safe summary, approved support actions.
Ownership invariant: ticket belongs to the authenticated customer/account.

## Auth gate

Frontend identity gate should use `supabase.auth.getClaims()` for verified JWT claims where supported, with auth-state refresh handling. `getSession()` must not be used as the sole authorization basis.

## Runtime verification before implementation

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

## Current repository finding

The customer portal currently has no committed Supabase client integration on `main`. Therefore this branch documents the contract and security gates first rather than guessing runtime table names or introducing unverified queries.
