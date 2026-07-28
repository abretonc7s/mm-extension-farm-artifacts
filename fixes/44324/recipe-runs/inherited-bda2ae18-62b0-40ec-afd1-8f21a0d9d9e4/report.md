# MANUAL-000001 Report

## Summary

Extension now depends on `@metamask/perps-controller@9.2.1` and consumes the TAT-3463 analytics contract from MetaMask/core#9311. Local event/property mirrors were replaced with controller imports (plus a thin Extension alias layer), attribution APIs are wired through the background + UI provider, and duplicate client Trade/Close/Cancel/Risk transaction emissions were removed so TradingService owns submitted + terminal events.

## Ticket

MANUAL-000001 — Consume perps controller analytics contract in MetaMask Extension  
References: https://consensyssoftware.atlassian.net/browse/TAT-3463 · https://github.com/MetaMask/core/pull/9311

## Changes

- `package.json` / `yarn.lock` — bump `@metamask/perps-controller` to `^9.2.1`
- `shared/constants/perps-events.ts` — controller re-export + Extension compatibility aliases
- `app/scripts/messenger-client-init/perps-controller-init.ts` — expose attribution APIs
- `ui/providers/perps/PerpsAttributionContext.tsx`, `ui/hooks/perps/usePerpsAttribution.ts` — entry/discovery/UTM + trackingData builders
- `ui/pages/perps/perps-layout.tsx`, `market-list/index.tsx` — provider + flow attribution
- Order lifecycle UI — remove duplicate transaction analytics; pass `trackingData` with attribution
- `test/mocks/metamask-perps-controller.js` — sync stub with contract (`timestamp`, attribution keys, SUBMITTED)

## Test plan

- Recipe: `mm-harness run artifacts/recipe.json` — PASS
- Unit: perps-controller-init, usePerpsAttribution, usePerpsEventTracking, order-entry, cancel/close/reverse/tpsl modals, perps-view, market-list, infrastructure — PASS
- Coverage analyze: VERDICT PASS (new code ≥80%)
- Lint gate: `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check` — PASS

## Evidence-fit

| AC | Proof mode | Primary evidence | Screenshots |
|---|---|---|---|
| AC1 package version | state | recipe `ac1-assert-package-version` | omitted (non-visual) |
| AC2 controller imports | state | recipe `ac2-*` file asserts | omitted |
| AC3 attribution wiring | state | recipe `ac3-*` | omitted |
| AC4 submitted/terminal ownership | state | trackingData builder + unit tests | omitted |
| AC5 no duplicate client events | state | recipe `ac5-*` source asserts | omitted |

## Artifacts

- `artifacts/recipe.json`, `recipe-run/`, `recipe-coverage.md`, `recipe-quality.json`
- `artifacts/approach.md`, `implementation.md`, `pr-description.md`

## Self-Review Fixes

- `ui/providers/perps/PerpsAttributionContext.tsx:105` — Moved fire-and-forget rationale comment to the line immediately above `.catch(` for the intentional attribution swallow.
- `shared/constants/perps-events.ts` / `ui/components/app/perps/reverse-position/reverse-position-modal.tsx:94` — Restored Extension `SCREEN_TYPE.FLIP_POSITION = 'flip_position'` alias and used it for flip screen-viewed analytics (was incorrectly remapped to `increase_exposure`).
- `test/mocks/metamask-perps-controller.js` — Added `FLIP_POSITION` to the Jest stub so mock enums stay aligned with the Extension alias.
- `app/scripts/controllers/perps/infrastructure.ts` / `perps-controller-init.ts` — Wire `mergeAttributionContext` into `trackPerpsEvent` so stored UTM reaches MetaMetrics on controller-emitted lifecycle events (AC3).
- `ui/components/app/perps/cancel-order/cancel-order-modal.tsx` — Pass `trackingData` from `buildTrackingData` on cancel so entry/discovery survive after client cancel tracks were removed.
- `ui/pages/perps/perps-order-entry-page.tsx` — Include `hlFeeRate` on place and modify `trackingData` (parity with close).
- `ui/components/app/perps/reverse-position/reverse-position-modal.tsx` — Include `hlFeeRate: feeRate` on flip `trackingData`.
- Recipe — Added AC3 UTM-merge + AC4 cancel/hlFeeRate source asserts; re-run PASS.
- `lavamoat/browserify/*/policy.json` + `lavamoat/webpack/mv2/*/policy.json` — Grant `@metamask/perps-controller>@nktkas/hyperliquid>decimal.js` (crypto/define globals) after hyperliquid 0.33.1; `yarn lavamoat:webapp:auto` could not regenerate because Browserify fails resolving a broken `file:///home/runner/.../mod.ts` path from `@nktkas/hyperliquid` / `standaloneInfoClient.cjs`, so the grant was added manually to match the existing nested-package pattern.
