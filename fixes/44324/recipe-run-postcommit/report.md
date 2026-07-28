# MetaMask Recipe Run

Status: pass
Duration: 15s
Nodes: 15/15 passed

## Side findings
- REVIEW 9 distinct application warning/error event(s) (non-blocking; expanded below and stored in diagnostics.json)

## Steps
- PASS gate-repo-root (assert_file, 559ms): path=package.json
- PASS ac1-assert-package-version (command, 1.4s): exitCode=0, stdout=perps-controller 9.2.1

- PASS ac2-assert-controller-reexports (assert_file, 374ms): path=shared/constants/perps-events.ts
- PASS ac2-assert-no-local-timestamp-mirror (command, 873ms): exitCode=0, stdout=re-export ok

- PASS ac3-assert-attribution-api-wiring (assert_file, 214ms): path=app/scripts/messenger-client-init/perps-controller-init.ts
- PASS ac3-assert-attribution-provider (assert_file, 297ms): path=ui/providers/perps/PerpsAttributionContext.tsx
- PASS ac3-assert-layout-provider (assert_file, 45ms): path=ui/pages/perps/perps-layout.tsx
- PASS ac3-assert-metrics-merge-utm (command, 838ms): exitCode=0, stdout=utm merge wired

- PASS ac4-assert-tracking-data-builder (assert_file, 365ms): path=ui/hooks/perps/usePerpsAttribution.ts
- PASS ac4-assert-cancel-tracking-data (command, 985ms): exitCode=0, stdout=cancel trackingData ok

- PASS ac4-assert-place-hl-fee-rate (command, 758ms): exitCode=0, stdout=hlFeeRate parity ok 3

- PASS ac5-assert-no-duplicate-order-entry-close (command, 1.5s): exitCode=0, stdout=order-entry deduped

- PASS ac5-assert-no-duplicate-cancel (command, 1.5s): exitCode=0, stdout=cancel deduped

- PASS ac5-assert-no-duplicate-close-modal (command, 785ms): exitCode=0, stdout=close modal deduped

- PASS teardown-end (end, 0ms)
