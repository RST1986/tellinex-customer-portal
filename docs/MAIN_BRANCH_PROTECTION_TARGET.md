# MyTellinex `main` branch protection target

## Observed baseline

- Repository: `RST1986/tellinex-customer-portal`
- Default branch: `main`
- Baseline main SHA for this control change: `a406d5220a09acc1f7e6d65dfcbee574fd0b2def`
- GitHub branch metadata reports `protected=false` and status-check enforcement off at the baseline.
- The baseline commit nevertheless has nine successful CI checks. CI presence is not enforcement.

## Required-check design

Wave 10 introduces a stable aggregate check, `mytellinex-next-gate`, which depends on every build in the MyTellinex feature-state matrix. Branch protection should not pin all six matrix-generated check names individually.

The intended required status checks are:

1. `mytellinex-next-gate` — aggregate gate for legacy default, Next prototype, account/billing, service, support and combined customer-core build variants.
2. `contract-tests` — audit, data-contract tests and production build.
3. `build` — five-state home build contract.
4. `boundary` — central UI Registry / approved-blob / support-feedback boundary.

`boundary` is deliberately configured to run on every pull request targeting `main`; a required check must not disappear merely because a patch does not match a path filter.

## Target branch policy

Configure repository branch protection or an equivalent ruleset so that:

- direct accidental updates to `main` are prevented in normal engineering flow;
- the four required checks above must succeed before merge;
- required checks are evaluated against an up-to-date pull-request head;
- force pushes are blocked;
- branch deletion is blocked;
- unresolved review conversations block merge when review conversations exist;
- bypass is limited to explicit repository administration/recovery use, not normal delivery;
- Copilot review may remain advisory and is not a substitute for deterministic checks.

For the current single-owner operating model, do not invent a human-approval requirement that cannot be satisfied by an independent reviewer. Add mandatory approval count when a genuine second reviewer/maintainer is assigned.

## Evidence states

- `CI_CHECKS_PRESENT=YES` does not mean `MAIN_PROTECTED=YES`.
- `WAVE_10_MERGED=YES` will not mean `MAIN_PROTECTED=YES` until GitHub branch/ruleset readback proves enforcement.
- Only direct provider readback may change the protection classification.

## Activation sequence

1. Merge Wave 10 after CI is green.
2. Configure branch protection/ruleset using the four stable required checks.
3. Read back `main` protection/ruleset state from GitHub.
4. Open a disposable governance test PR and prove a failing required check prevents merge.
5. Record the provider evidence in the controlled ecosystem state document.
