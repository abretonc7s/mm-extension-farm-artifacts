# mm-harness check diff

Verdict: pass
Profile: fast
Fix: no
Base: origin/main (github-pr: main)
Changed files: 12

## Checks

- PASS policy-suppressions (/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/45960-0902-195803/artifacts/check-diff/policy-suppressions.log)
- PASS eslint (/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/45960-0902-195803/artifacts/check-diff/eslint.log)
- PASS oxfmt (/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/45960-0902-195803/artifacts/check-diff/oxfmt.log)
- PASS jest (/Volumes/FD/dev/metamask/metamask-extension-3/temp/tasks/fix/45960-0902-195803/artifacts/check-diff/jest.log)
- SKIP typecheck — profile=fast; run with --profile full for repo-wide typecheck

## Changed Files

- package.json
- test/e2e/mock-e2e.js
- test/e2e/tests/metrics/state-snapshots/errors-after-init-opt-in-ui-state.json
- test/e2e/tests/perps/mocks/websocketPositionMocks.ts
- test/e2e/tests/perps/perps-fixture-config.ts
- test/e2e/tests/perps/perps-tpsl.spec.ts
- test/e2e/tests/settings/state-logs.json
- test/mocks/metamask-perps-controller.js
- ui/components/app/perps/utils/translate-perps-error.test.ts
- ui/components/app/perps/utils/translate-perps-error.ts
- ui/selectors/perps-controller.test.ts
- yarn.lock
