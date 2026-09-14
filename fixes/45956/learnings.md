# Reviewer-driven learnings (PR #45956)

- Controller as source of truth: reviewer rejected a UI-side category list even after it was "derived" with the design order layered on top — when a core constant exists (`MARKET_CATEGORIES`), consume it as-is and check what mobile and the sibling surface (market list rail) already do before inventing a local order.
- Half-fixes read as duplication: appending unknown controller categories to a hand-kept list still leaves a list to maintain — the reviewer's concern is future edits, so remove the list, not just the drift.
- Auto-resolved bot threads are not fixes: cursor[bot] resolved the skeleton-height thread because the lines moved, but the bug was still there — re-check resolved-without-reply threads against HEAD.
- Loading skeletons must mirror the loaded layout per variant: a shared single-row skeleton broke once one surface switched to taller, wrapping pills — key skeleton height/wrap off the same variant/layout props the real rail uses.
- Stale inherited recipes: selectors and helper test paths drift as the design changes; re-author a narrow proof recipe for the current fix instead of trusting the family recipe.
