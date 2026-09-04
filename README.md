# MyTellinex customer portal

MyTellinex is the customer self-service interface intended for `my.tellinex.com`.

## Current status

The repository contains an interactive React/Vite product prototype. It is not yet a production-authorised customer portal: authentication, current customer/account data contracts, billing execution, network-control integrations, observability and release evidence still require implementation and verification.

## Hosting policy

The only permitted web runtime is **Cloudflare Pages**.

- Build command: `npm ci && npm run build`
- Build output: `dist`
- Pages configuration: `wrangler.toml`
- SPA fallback: `public/_redirects`
- Local preview: `npm run preview`

The source migration removes Netlify configuration and generated Netlify artefacts. Live custom-domain, DNS, environment-variable and provider-account changes are separate controlled operations and must be verified in Cloudflare before production is claimed.

## Development

```bash
npm ci
npm run dev
```

Run the release verification locally with:

```bash
npm run verify
```
