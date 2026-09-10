# Step 5 comment fetch

## Actionable review comments (top-level, in_reply_to_id == null)
1. cursor[bot] review_comment 3919978743 ui/pages/perps/perps-order-entry-page.tsx:887
   Unfunded CTA shown while balance loads (hasNoAvailableBalance / isSubmitDisabled dropped isLoadingAccount)
   Existing reply: abretonc7s 3920260514 — Fixed in 002b882c. Thread resolved.
2. cursor[bot] review_comment 3920285641 ui/components/app/perps/order-entry/components/amount-input/amount-input.tsx:425
   Row CTA ignores account loading (labeled Add funds while stream hydrates)
   Existing reply: abretonc7s 3920425023 — Fixed in 948c4315. Thread resolved.

## CHANGES_REQUESTED reviews
none

## Issue comments skipped as status-only automation (6)
- 5518479240 github-actions[bot] CLA
- 5518480911 metamask-ci[bot] codeowners
- 5518669669 metamask-ci[bot] builds ready c45015c
- 5519215424 metamask-ci[bot] builds ready 002b882
- 5519441272 sonarqubecloud[bot] quality gate
- 5519515819 metamask-ci[bot] builds ready 948c431 + benchmarks

Skipped: 6. Replied-to review threads: 2. New human comments: 0.
