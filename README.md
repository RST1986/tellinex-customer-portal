# MyTellinex Customer Portal

Customer-facing Tellinex web application targeting `my.tellinex.com`.

## Current status

This repository is a **prototype / legacy implementation**, not a production-authorised customer portal. The current UI demonstrates the intended customer experience, but it is not yet bound to governed production contracts for authentication, accounts, billing, network status, Wi-Fi management, support or engineer tracking.

## Platform policy

- Web hosting: **Cloudflare Pages only**.
- Netlify configuration, APIs, deploy commands, dependencies and environment variables are prohibited.
- Supabase integration must use the governed Tellinex production/staging contracts and Row Level Security before any production release.

## Cloudflare Pages build

- Repository root: `/`
- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`
- Intended custom domain: `my.tellinex.com`

The versioned `wrangler.toml` and `public/_redirects` provide the Pages build/output and SPA fallback contract. Connecting the repository, custom domain, DNS and production environment variables still requires authorised access to the Cloudflare account.

## Local development

```bash
npm ci
npm run verify
npm run dev
```

## Production blockers

1. Implement customer authentication and account-to-tenant binding.
2. Replace all mock/static values with governed Supabase/API contracts.
3. Add authorisation, audit logging, rate limiting and privacy controls.
4. Add automated unit, integration, accessibility and end-to-end tests.
5. Complete staging verification, deployment-SHA attestation and release approval.
