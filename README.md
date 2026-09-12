# MyTellinex Customer Portal

MyTellinex is the customer self-service portal for `my.tellinex.com`. The repository contains the legacy interface and the feature-gated MyTellinex Next experience.

## Local development

Use a clean checkout and install the exact dependency graph from `package-lock.json`:

```bash
npm ci
npm run dev
```

`node_modules/` and `dist/` are generated locally and must never be committed. The contract test suite enforces this repository boundary.

## Validation

Run the same baseline checks used by continuous integration before opening a pull request:

```bash
npm ci
npm audit --audit-level=high
node --test tests/*.test.mjs
npm run build
```

The GitHub Actions workflows also build the supported MyTellinex feature-state matrix. Browser-facing Supabase configuration must contain only a project URL and a publishable key; privileged keys belong exclusively in controlled server-side environments.

## Feature flags

`VITE_MYTELLINEX_NEXT` selects the Next interface. Live account, billing, service, support and network-health capabilities are controlled independently. A successful build verifies only source compatibility; it does not authorise a production rollout or the activation of live data paths.

## Release governance

Changes follow this sequence:

> isolated branch → clean dependency install → automated tests → build evidence → security review → human approval → controlled promotion

No pull request, test result or preview deployment is production approval. Production configuration, Supabase policies and deployment promotion remain outside this repository workflow unless explicitly authorised for a specific operation.
