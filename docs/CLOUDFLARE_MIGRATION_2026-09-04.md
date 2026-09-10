# MyTellinex — Cloudflare Pages migration and Netlify retirement

Date: 2026-09-04

## Scope of this repository change

- remove `netlify.toml`;
- remove tracked `node_modules/` build dependencies;
- correct `.gitignore`;
- add `wrangler.toml` for Cloudflare Pages;
- add a CI guard that rejects active Netlify configuration;
- document the cutover and evidence requirements.

This change does not deploy, change DNS, move secrets, cancel a provider account or claim that `my.tellinex.com` is live.

## Cloudflare Pages target

| Setting | Required value |
| --- | --- |
| Repository | `RST1986/tellinex-customer-portal` |
| Production branch | `main` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Custom domain | `my.tellinex.com` |
| Preview policy | Pull requests and non-production branches |

## Controlled cutover

1. Create or select the Cloudflare Pages project and connect only the required GitHub repository.
2. Configure the build values above and keep privileged secrets out of the browser and repository.
3. Deploy the migration branch as a preview.
4. Verify install, build, asset loading, direct navigation/refresh, mobile layouts, accessibility and browser smoke tests.
5. Record the preview URL, Cloudflare project/account identifiers, exact Git SHA, build log and test evidence.
6. Merge only after review and green CI; deploy the exact approved `main` SHA.
7. Attach `my.tellinex.com`, verify Cloudflare-managed DNS and valid TLS, and prove that the domain serves the approved SHA.
8. Only after Cloudflare verification, disable Netlify automatic builds and deploy hooks; detach the custom domain; remove environment variables; revoke repository/API access and tokens; retain required evidence; delete or archive the former site; stop paid billing.
9. Confirm no DNS record, callback, badge, GitHub check, deploy hook, documentation or application URL still targets `netlify.app`, the Netlify API or Netlify Functions.

## Acceptance receipt

Migration is complete only when one receipt contains:

- Cloudflare Pages project and account identifiers;
- production and preview URLs;
- exact deployed Git SHA;
- custom-domain, DNS and TLS proof;
- build and smoke-test results;
- redacted environment-variable inventory;
- former Netlify site identifier and closure timestamp;
- confirmation that domains, hooks, tokens, GitHub access, environment variables and billing were removed;
- rollback reference and named approval.

## Product boundary

Hosting migration does not make MyTellinex production-ready. Replace simulated values with customer-scoped services, implement authenticated tenancy and authorisation, integrate billing/payments/support/network status through governed APIs, add audit/privacy controls and automated tests, and define honest stale/degraded states before public launch.
