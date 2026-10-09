# Comment triage

Runtime recovered after Chromium disabled the unpacked extension. Developer mode was enabled only in the isolated prepared profile.

| Source | Author | File | Triage | Action |
|---|---|---|---|---|
| review_comment 4219694382 | Prithpal-Sooriya | lavamoat/webpack/mv2/beta/policy.json:1388 | OUT OF SCOPE, informational | Policy reviewer confirms paths and policies look okay; no change requested. |
| review_comment 4219765805 | michalconsensys | ui/components/app/perps/close-position/close-all-positions-modal.tsx:outdated | REAL, already fixed | Already addressed in the current branch: every preview supplies notional; resolved discounts use controller quote metadata. Existing replies retained. |
| review_comment 4219765815 | michalconsensys | ui/hooks/perps/usePerpsOrderFees.ts:outdated | REAL, already fixed | Already addressed in the current branch: every preview supplies notional; resolved discounts use controller quote metadata. Existing replies retained. |

Lead feedback in inputs/lead-feedback.md is REAL: consolidate USD notional derivation and share the hook's local fallback discount function with close-all. Add helper tests, preserve behavior, rerun the HUD proof, and update the description bullets.

Six status-only issue comments skipped. Two existing author replies retained. No changes-requested review bodies. GitHub replies and thread mutations are disabled by the lead instruction.

Local validation: fast gate PASS, 13 suites and 631 tests. Coverage PASS, 95% overall and 100% helper coverage. Final gate rerun passed after removing a dead export and restricting trigger inputs to pairs. Existing remote check-pr-max-lines fails at 1268 counted lines against 1000 before this extraction; scope remains the requested minimal helper extraction.

Recipe re-validation PASS: root 14/14 and current fee preview 21/21 with HUD. Native images inspected; BTC100 $0.15, BTC1000 $1.45, SOL close-all $0.02. No order, close or signature submitted. See recipe-coverage.md for limits.

Step 12 is suppressed by the lead instruction: no GitHub comment replies, top-level comments, review submissions, or thread-resolution mutations. Existing replies were inspected in the step-5 snapshot. PR description bullets were updated through the pull-request body endpoint only.

## Final result

- Triaged 9 GitHub root/conversation comments: 2 REAL already fixed on the incoming branch, 0 FALSE POSITIVE, 7 OUT OF SCOPE/informational. Six status-only bot comments and two existing author replies received no reply. No changes-requested review bodies.
- Lead feedback: REAL, fixed by 85d5ffc530703d9609099dc965db5a7443600e92. One notional helper serves every preview and one fallback-discount function is shared by the hook and close-all.
- Integration: rebased cleanly onto origin/main 3d1dc9c3c2; immutable dependency installation passed. Remote lease checked before the single push.
- Commit: 85d5ffc530703d9609099dc965db5a7443600e92, refactor(perps): share fee preview helpers. Pushed once. Working tree is clean.
- Validation: 13 suites / 631 tests pass, final harness fast gate passes, overall coverage 95%, helper coverage 100%, lint/locale/circular parity gates pass. Full repo TypeScript was not rerun for this pure extraction.
- Runtime: controller20 root recipe PASS 14/14; fee preview PASS 21/21 with HUD. Both live fee hooks quote current USD100/USD1000, with resolved rate 0.00145 and no active discount. Inspected screenshot fees: $0.15, $1.45, and existing SOL close-all $0.02. No trade or signature submitted.
- Claude closeout: APPROVE against 28e90b0126 plus this patch, no actionable blockers. Optional suggestions to replace the existing basis-point constant or change submission-size math were deferred to preserve the lead's minimal extraction scope.
- PR description: updated two Description bullets, preserving the remaining body.
- GitHub comments/threads: no mutations, as instructed.
- CI snapshot after push: {"SKIPPED": 4, "SUCCESS": 9, "IN_PROGRESS": 16, "FAILURE": 1}. check-pr-max-lines remains a non-required failure; counted source changes are now 1426 against 1000. This failure predates the follow-up and is outside the requested minimal extraction. Current main rules require only Block stable-main-X.Y.Z to main, which passed. Remaining CI is running; no final-green claim is made.

Changed files:
- ui/components/app/perps/close-position/close-all-positions-modal.tsx
- ui/components/app/perps/close-position/close-position-modal.tsx
- ui/components/app/perps/order-entry/components/auto-close-section/auto-close-section.tsx
- ui/components/app/perps/order-entry/order-entry.tsx
- ui/components/app/perps/reverse-position/reverse-position-modal.tsx
- ui/components/app/perps/update-tpsl/update-tpsl-modal-content.tsx
- ui/hooks/perps/perps-fee-utils.test.ts
- ui/hooks/perps/perps-fee-utils.ts
- ui/hooks/perps/usePerpsOrderFees.ts
- ui/hooks/perps/usePerpsOrderForm.ts
- ui/pages/perps/perps-order-entry-page.tsx
