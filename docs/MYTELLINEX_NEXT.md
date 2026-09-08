# MyTellinex Next

## Purpose

MyTellinex Next is the governed TXS / Quiet Instrument migration path for the Tellinex customer portal.

## Safety model

- The existing `App.jsx` remains the default application.
- The new modular dashboard is opt-in only with `VITE_MYTELLINEX_NEXT=true`.
- No production deployment is changed by this branch.
- No synthetic speed, outage, uptime, billing-state, or support-ticket data should be presented as live operational truth.

## Architecture

The first migration slice lives under `src/next/` and separates:

- TXS design tokens (`txs.css`)
- service summary (`ServiceCard`)
- network health (`NetworkHealth`)
- billing summary (`BillSummary`)
- composed MyTellinex dashboard (`MyTellinexNext`)

These components mirror the approved private Tellinex UI registry primitives and are intended to be replaced by direct governed registry consumption once package/install conventions for the customer portal are finalized.

## Platform direction

Netlify configuration has been removed from this branch. Tellinex production direction is Cloudflare-first. Cloudflare deployment configuration should be added only after the exact Pages project, production branch, build command, output directory, custom domain and required environment bindings are verified.

## Next integration gates

1. Validate local build with the feature flag off and on.
2. Replace preview placeholders with authenticated Supabase-backed customer data contracts.
3. Add routing and decompose Billing, Support, Network, Wi-Fi and Account into separate modules.
4. Add accessibility and responsive regression coverage.
5. Verify Cloudflare Pages project and bindings before deployment configuration is committed.
6. Merge only after review; production remains unchanged until an explicit release decision.
