# MyTellinex Support RLS Evidence — 2026-09-08

Status: PASS for authenticated customer ticket read/create isolation.

## Production project

Supabase project: `egztpclpcnizcdtfugsv`.

## Ownership model

`public.customer_tickets` now keeps the Auth identity and the domain customer identity distinct:
- `user_id` identifies the Supabase Auth user
- `customer_id` identifies the domain/CRM customer
- `public.customer_auth_links` proves the one-to-one Auth user -> domain customer relationship

Customer access requires both identities to agree through the ownership bridge. `customer_id` is not treated as an Auth ID.

## Customer SELECT policy

Customer reads require all of:
- `auth.uid()` is present
- `user_id = auth.uid()`
- `customer_id IS NOT NULL`
- an RLS-visible `customer_auth_links` row maps that same `auth.uid()` to the ticket's `customer_id`

Staff SELECT remains separately authorized through `is_tellinex_staff()`.

## Customer INSERT policy

Customer creation requires the same dual ownership proof and additionally constrains customer-controlled workflow state:
- `status = open`
- `priority = normal`
- `assigned_to IS NULL`
- `resolution IS NULL`
- `resolved_at IS NULL`
- `data_source = my_tellinex_app`
- `created_at` must be within the policy's fresh server-time window

Staff INSERT remains separately authorized. UPDATE remains staff-only.

## Browser contract

`src/next/data/support.js`:
- verifies identity with `auth.getClaims()`
- resolves the owned domain customer through `customer_auth_links`
- submits both the verified `user_id` and owned `customer_id`
- pins `priority` to `normal`
- pins `data_source` to `my_tellinex_app`

Customer-facing reads select only:
- id
- subject
- ticket_type
- priority
- status
- created_at
- resolved_at

The browser does not select staff assignment, resolution text, customer contact fields, or other internal workflow data in this slice.

## Positive insert proof

A transaction-only test assumed the real owning Auth identity and created a temporary normal `general` ticket through the production RLS path.

Observed before rollback:
- inserted rows: 1
- status = `open`: PASS
- priority = `normal`: PASS
- assigned_to/resolution/resolved_at all null: PASS
- data_source = `my_tellinex_app`: PASS

The transaction was rolled back.

## Cross-customer negative proof

A distinct existing Auth identity without the ownership link was used for negative testing.

First, under that identity the ownership bridge itself exposed zero rows, so a normal bridge-driven insert produced no candidate customer.

A stronger adversarial probe then deliberately supplied the real foreign `customer_id` while setting `user_id` to the non-owner Auth identity. PostgreSQL rejected the insert with SQLSTATE `42501`: new row violates row-level security policy for `customer_tickets`.

Result: PASS.

## Persistence check

After both probes, production contained zero rows with either test subject. No test ticket was persisted.

## Release boundary

This evidence authorizes the current MyTellinex customer Support read/create contract only. It does not authorize customer-side UPDATE, reassignment, priority escalation, resolution editing, staff fields, or bypassing `customer_auth_links`.

The SUPPORT surface may use this contract behind its feature gate. Home remains a customer health summary rather than a helpdesk dashboard.

Existing project-wide Supabase findings remain separate work and are not waived by this PASS.
