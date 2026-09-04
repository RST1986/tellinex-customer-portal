# Tellinex Customer Portal — legacy web preview

This repository contains the older browser-based customer portal prototype.

The canonical **MyTellinex** product is maintained in [`RST1986/tellinex-customer-app`](https://github.com/RST1986/tellinex-customer-app) as an Expo / React Native application with a web target. This repository must not be treated as the production MyTellinex authority without an explicit product decision.

## Hosting policy

- Hosting provider: **Cloudflare Pages only**.
- Netlify configuration has been removed from this repository.
- Cloudflare Pages project name: `tellinex-customer-portal`.
- Build command: `npm run build`.
- Build output directory: `dist`.
- Root directory: repository root.
- SPA fallback: `public/_redirects`.

No production deployment, DNS change, custom-domain assignment, Supabase change, or provider-account cancellation is performed by this repository change.

## Local development

```bash
npm ci
npm run dev
```

## Release hold points

Before assigning `my.tellinex.com` or another production hostname, confirm all of the following:

1. Decide whether this legacy web portal is being retired, retained as a preview, or replaced by the web build of the canonical MyTellinex application.
2. Replace prototype data and interactions with authenticated Supabase-backed services.
3. Add automated tests, security headers, observability, accessibility checks, and a production release gate.
4. Create and verify separate Cloudflare preview and production environments.
5. Remove any live Netlify site, deploy hook, DNS record, OAuth connection, environment variable, and billing subscription in the Netlify and Cloudflare dashboards.
