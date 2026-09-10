# MyTellinex Customer Portal — Copilot build instructions

GitHub Copilot is a bounded source-code builder and reviewer for this repository. It is not an autonomous production, billing, identity or database operator.

## Delivery lane

`issue -> bounded build -> tests/evidence -> PR -> one meaningful AI review -> specialist escalation if needed -> human GO for high-impact runtime operations`

## Build scope

Copilot may implement well-scoped repository-local work including:

- customer portal UI and account flows;
- validation, error/empty/loading states and accessibility;
- customer usage and billing presentation logic;
- tests, type safety and regression coverage;
- client/server API boundary hardening;
- source-only security improvements;
- CI and dependency improvements;
- documentation and runbooks.

Do not broaden a bounded issue into unrelated cleanup.

## Customer and data authority rules

- Fail closed on missing user identity, tenant/customer binding, entitlement, billing state or backend evidence.
- Never infer customer authority from client-controlled fields, presentation state, email strings or unverified claims.
- Preserve Supabase RLS/RPC boundaries and tenant isolation; browser code must not hold service-role credentials.
- Treat payment, webhook and reconciliation input as untrusted until server-side validation is proven.
- Do not fabricate balances, invoices, usage, payment success, service status or customer eligibility.
- Repository state proves source only. Mark external/runtime assumptions `NEEDS_RUNTIME_VERIFICATION`.
- Minimise exposure and persistence of PII and customer data.

## Escalate instead of guessing

Escalate to Codex/Claude/human engineering review for subtle authentication/authorisation, tenant isolation, RLS/SECURITY DEFINER chains, payment/webhook/reconciliation semantics, complex migrations, cross-system architecture, destructive actions or runtime drift that cannot be proved from source.

## Human GO boundary

Without separate explicit Rui GO, do not:

- mutate production/staging Supabase data, schema, RLS, ACLs or migrations;
- change payment-provider or billing configuration;
- deploy production/staging runtimes;
- mutate Cloudflare, DNS, domains, bindings or environment variables;
- create, rotate or delete secrets/credentials;
- perform destructive external-system actions.

Source, tests, runbooks and readiness evidence may be prepared when the issue explicitly says source-only.

## Testing and evidence

For customer, auth, billing and tenant changes, add negative tests where practical. Every implementation PR must state scope/non-goals, files changed, checks actually run, runtime effects, remaining verification needs and safe-revert notes where material.

## AI cost control

- Do not request a new automatic Copilot review on every `synchronize`/push.
- Automatic review belongs at `opened`, `reopened` and `ready_for_review` lifecycle boundaries.
- Re-request review manually only after substantive remediation.
- Prefer one bounded agent task over repeated broad prompts.

## Pull requests

Work on a branch, respect repository checks and never merge solely because an AI review is green.

Default boundary:

`PRODUCTION_MUTATION = NONE`
`STAGING_MUTATION = NONE`
`RUNTIME_DEPLOYMENT = NONE`
