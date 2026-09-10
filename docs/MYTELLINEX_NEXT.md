# MyTellinex Next

## Purpose

MyTellinex Next is the governed TXS / Quiet Instrument migration path for the Tellinex customer portal.

## Safety model

- The existing `App.jsx` remains the default application.
- The new modular dashboard is opt-in only with `VITE_MYTELLINEX_NEXT=true`.
- No production deployment is changed by this branch.
- No synthetic speed, outage, uptime, billing-state, or support-ticket data should be presented as live operational truth.
- `21st.dev -> production` and `21st.dev -> product branch` direct imports are prohibited; external candidates must first become approved Tellinex UI Registry source.

## Architecture

The migration slice lives under `src/next/` and separates:

- TXS design tokens (`txs.css`)
- governed UI Registry copies (`src/next/registry/`)
- service summary (`ServiceCard`)
- network health (`NetworkHealth`)
- billing summary (`BillSummary`)
- composed MyTellinex dashboard (`MyTellinexNext`)

Wave 01 has started consuming approved source from `RST1986/tellinex-frontend/ui-registry`. `ServiceCard` now composes the approved `TlxSurfaceCard` primitive instead of maintaining its own duplicate surface implementation. `TlxButton` and `TlxStatusBadge` are staged for the next low-risk replacements. `src/next/registry/ADOPTION.json` pins source blobs and records consumption state so drift can be reviewed rather than copied blindly.

GitHub remains the source of truth. 21st.dev is a candidate-discovery/private-distribution layer only; it does not define Tellinex product identity or authority semantics.

## Platform direction

Netlify configuration has been removed from this branch. Tellinex production direction is Cloudflare-first. Cloudflare deployment configuration should be added only after the exact Pages project, production branch, build command, output directory, custom domain and required environment bindings are verified.

## Next integration gates

1. Validate local build with the feature flag off and on.
2. Replace the remaining safe local primitives with approved registry copies, beginning with buttons, status badges and navigation.
3. Replace preview placeholders with authenticated Supabase-backed customer data contracts.
4. Add routing and decompose Billing, Support, Network, Wi-Fi and Account into separate modules.
5. Add accessibility and responsive regression coverage.
6. Verify Cloudflare Pages project and bindings before deployment configuration is committed.
7. Merge only after review; production remains unchanged until an explicit release decision.
