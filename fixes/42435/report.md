## Summary

Fixed the Perps partial-close minimum-notional warning so it no longer tells Extension users to set a slider to 100%. The warning now directs users to increase the close amount or close the full position.

## Root cause

`ui/components/app/perps/close-position/close-position-modal.tsx:210` maps `ORDER_SIZE_MIN` and inline partial-close minimum-notional validation to `perpsClosePartialMinNotional`, whose English source at `app/_locales/en/messages.json:5791` referenced setting the slider to 100%. That copy was visible in the Extension close-position modal even though the expected action is to close the full position.

## Changes

- `app/_locales/*/messages.json` — updated `perpsClosePartialMinNotional` copy to remove slider references and direct users to close the full position.
- `ui/components/app/perps/close-position/close-position-modal.test.tsx` — updated the expected warning copy and added assertions that the warning does not contain slider/slide text.

## Test plan

- `node validate-flow-schema.js ../tasks/fix/tat-2849-0506-074700/artifacts/recipe.json`
- `node validate-recipe.js --recipe ../tasks/fix/tat-2849-0506-074700/artifacts/recipe.json --dry-run`
- `node validate-recipe.js --recipe ../tasks/fix/tat-2849-0506-074700/artifacts/recipe.json --cdp-port 6662 --skip-manual --artifacts-dir ../tasks/fix/tat-2849-0506-074700/artifacts` — passed `8/8`
- `yarn lint:changed && yarn verify-locales --quiet && yarn circular-deps:check`
- `yarn jest ui/components/app/perps/close-position/close-position-modal.test.tsx --no-coverage`
- `node temp/runtime/coverage-analyze.js`

Manual Gherkin:

```gherkin
Given the wallet is unlocked and Perps has an open ETH position
When I open the close-position modal
And I enter a partial close amount below the minimum notional
Then the warning does not reference the slider or slide
And the warning says to increase the close amount or close the full position
```

## Evidence

- `temp/tasks/fix/tat-2849-0506-074700/artifacts/before.mp4`
- `temp/tasks/fix/tat-2849-0506-074700/artifacts/after.mp4`
- `temp/tasks/fix/tat-2849-0506-074700/artifacts/before-ac1-partial-close-warning.png`
- `temp/tasks/fix/tat-2849-0506-074700/artifacts/after-ac2-partial-close-warning.png`
- `temp/tasks/fix/tat-2849-0506-074700/artifacts/recipe-coverage.md`

## Ticket

TAT-2849: https://consensyssoftware.atlassian.net/browse/TAT-2849

## Self-Review Fixes

- `ui/components/app/perps/close-position/close-position-modal.test.tsx:99` — derived the partial-close warning expectation from the English i18n test helper instead of duplicating the localized copy in a raw regex.
