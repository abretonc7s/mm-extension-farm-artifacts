# Review learnings — PR #45956 / TAT-3848

- **Static review contract:** When `Validation depth: static-code` is set, skip CDP/recipe live runs and audit inherited parent artifacts against frozen HEAD instead of manufacturing new browser proof.
- **Post-review drift:** Commit `40ec3706` replaced horizontal scroll with `useCategoryRailOverflow` + More dropdown and deleted `FilterSelect`. Inherited recipe nodes targeting `overflow-x-auto` and `filter-select-button` fail on HEAD even though parent run reported 25/25.
- **Unit tests as design documentation:** `never turns the rail into a horizontal scroller` encodes the intentional web UX divergence from mobile and from original ticket wording — use tests to detect doc/recipe staleness.
- **Shared rail pattern:** `PerpsCategoryRail` serves both Perps tab (navigate-only, no `onClear`) and market list (toggle/clear on active pill). `MARKET_FILTER_LABEL_KEYS` prevents label drift.
- **Category predicate:** `marketMatchesCategory` keeps Extension crypto semantics (`isCryptoMarket` / `marketSource` rule) rather than controller `matchesCategory` — documented divergence from mobile/core.
- **Skeleton gating:** Five `h-8` skeleton pills reserve rail height in both tab loading branch and rail `isLoading` path — pair of tests pins count and height.
- **Keyboard proof:** Focusability is asserted via real `ButtonFilter` buttons; inherited recipe CSS selector approach still valid, but tab-count tests are fragile.
- **E2E hygiene (out of diff):** `test/e2e/page-objects/pages/perps/perps-market-list-page.ts` still references `filter-select-button` after component removal — flag for follow-up.
- **Prior review loop:** geositta CHANGES_REQUESTED on horizontal scroll was addressed in a subsequent commit; verify PR body/recipe updated in the same PR before merge.
- **Affected test command:** Six suites (90 tests) cover the changed surface; sufficient static gate when live recipe is skipped.
