# MyTellinex customer portal

Customer self-service interface for `my.tellinex.com`.

## Current status

This repository contains a React/Vite prototype with simulated service, billing, Wi-Fi, support and network-status data. It is **not yet a production customer system**. Production readiness requires authenticated tenancy, customer-scoped APIs, real billing/support/network integrations, privacy and audit controls, degraded/stale-data states, automated tests and an approved release receipt.

## Local development

```bash
npm ci
npm run dev
```

## Build

```bash
npm ci
npm run build
```

The build output is `dist/`.

## Hosting authority

Cloudflare Pages is the only approved hosting platform for this repository. The source configuration is `wrangler.toml`.

Recommended Pages settings:

- production branch: `main`
- build command: `npm run build`
- output directory: `dist`
- production custom domain: `my.tellinex.com`
- preview deployments: pull requests and non-production branches

Do not add Netlify configuration, deploy hooks, functions, domains or environment variables. Provider-side Cloudflare deployment and Netlify cancellation must be verified separately from this source repository.

See `docs/CLOUDFLARE_MIGRATION_2026-09-04.md` for the controlled cutover checklist.
