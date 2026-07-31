# PR #45067 — review comment triage

## Triage table

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | app/scripts/messenger-client-init/perps-controller-init.ts:352 | REAL | Scope the retry `try/catch` to `controller.init()` only, so a throwing retried `cancelOrder` surfaces its real error instead of the original `ORDER_UNKNOWN_COIN` result |

Conversation comments (`issues/45067/comments`) were all non-actionable automation:

| ID | Author | Kind | Note |
|---|---|---|---|
| 5139204911 | abretonc7s | human (PR author) | Automated dev-run report posted by the PR author — no review request |
| 5139205415 | github-actions[bot] | ci | CLA signed |
| 5139207276 | metamask-ci[bot] | ci | CODEOWNERS file listing |
| 5139283732 | sonarqubecloud[bot] | ci | Quality gate **passed** (98.7% coverage on new code) |
| 5139348281 | metamask-ci[bot] | ci | Build artifacts + performance benchmarks (`onboardingNewWallet` regression is a known main-wide benchmark, untouched by this PR) |

No `CHANGES_REQUESTED` reviews. Only review on the PR is `cursor[bot]` (`COMMENTED`).

## Integration (step 3)

Rebased onto `origin/main` (`1bd5a8f781`). Three conflicts, all caused by main's
`feat(perps): consume perps controller analytics contract` (#44324) landing on the
same files:

- `ui/components/app/perps/cancel-order/cancel-order-modal.tsx` — main moved the
  cancel `Perp Order Cancel Transaction` event into the controller and stopped
  throwing on `result.success === false`. This branch's "already closed" quiet
  close and provider-error translation only ran in the `catch`. Reapplied both to
  the `!result?.success` branch so the PR's behaviour survives main's refactor.
- `shared/constants/perps-events.ts` — main now spreads the controller contract,
  which already provides `ERROR_MESSAGE_KEY.INSUFFICIENT_BALANCE` and
  `PerpsAnalyticsEvent`; dropped this branch's now-duplicate definitions and kept
  only the Extension-only `PERPS_EXTENSION_EVENT_PROPERTY`.
- `app/scripts/messenger-client-init/perps-controller-init.test.ts` — took main's
  shared `test/mocks/metamask-perps-controller.js` stub form (it already exports
  `PERPS_ERROR_CODES`), keeping this branch's new cancel-retry tests.
