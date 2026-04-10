# Report: Extension AgenticService (mobile parity)

## Summary

Exposes 3 dev-only hooks on `window.stateHooks` gated behind `process.env.METAMASK_DEBUG`, giving CDP automation full read/write access to the extension's internals: Redux store, background controller RPC, and live perps stream data. This closes the gap with mobile's `globalThis.__AGENTIC__` bridge using zero abstraction — just 3 property assignments on an existing hook object.

## Changes

| File | Change |
|---|---|
| `ui/index.js` | Import `submitRequestToBackground`; add 5-line `METAMASK_DEBUG` block in `setupStateHooks()` exposing `store`, `submitRequestToBackground`, `getPerpsStreamManager` |
| `types/global.d.ts` | Add 3 optional properties to `StateHooks` type |

## Test Plan

- **Recipe validation**: 9/9 nodes pass against live browser via CDP (store exists, state readable, messengerCall works for AccountsController, stream manager has channels, perpsGetAccountState callable)
- **TypeScript**: `yarn lint:tsc` passes with 0 errors
- **Prettier**: No formatting changes needed
- **No unit tests**: 3 property assignments with no logic; recipe provides end-to-end validation

## Evidence Artifacts

- `recipe.json` — 10-node validation workflow
- `evidence-agentic-hooks-validated.png` — screenshot after all assertions pass

## Ticket

[TAT-2902](https://consensyssoftware.atlassian.net/browse/TAT-2902)
