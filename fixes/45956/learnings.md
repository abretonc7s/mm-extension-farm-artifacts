# Reviewer-driven learnings — PR #45956 (TAT-3848)

What the 2026-09-14 review round caught that the original fix-bug worker did not.

- **Measurement caches must key on what changes the measurement, not just what changes the list**: the width cache keyed on the category set, but a pill's width also changes when it becomes active and renders the clear glyph — so selecting the last pill that fits clipped the only control that clears the filter. When caching a measured value, enumerate every prop that alters the measured element's box, not just the ones that alter its identity.

- **A skeleton reserves the slot only if it mirrors the loaded tree's siblings too**: the Products skeleton matched Products exactly, but the loaded tree puts Watchlist above it and the loading tree had nothing there, so the very jump the skeleton existed to prevent still happened for any user with starred markets. Diff the loading tree against the loaded tree as whole trees, and reach for persisted state (not live data) to size the sections live data has not described yet.

- **A dependency-free `useLayoutEffect` is a per-render synchronous layout read**: on a surface re-rendering on every live market tick that is a measurable cost, and the ResizeObserver alongside it already covered the case the bare effect was guarding. When an effect and an observer overlap, decide which one owns which trigger rather than keeping both maximally broad.

- **Hooks called unconditionally still cost when a variant never uses their output**: the `Wrap` layout mounted the measuring hook, its observer and its layout effect for a layout that by design never overflows. A hook cannot be called conditionally, but its *input* can be neutered — passing an empty list made the no-op explicit instead of incidental.

- **Passing a pseudo-value through a typed prop pushes the special case into the callee**: handing the rail `'watchlist'` as a `selectedCategory` when watchlist is not a category made the rail responsible for knowing it. Map to `null` at the boundary and the callee's contract stays "a category or nothing". Worth noting the reviewer's stated symptom did not reproduce — verify the mechanism before writing the fix, then fix the real wart and say so.

- **Docs describing an abandoned approach are worse than no docs**: three separate comments landed on JSDoc that still described promote-the-active-pill and a deleted `filter-select`, because an earlier round changed the behaviour and left the prose. When a change reverses a documented decision, grep the doc comments for the old decision's vocabulary in the same commit.

- **Interpolated counts need a plural pair from the start**: `"$1 markets"` reads "1 markets" the moment a filter narrows to one, and the repo already had a Singular/Plural key convention to follow. Check every `$1`-prefixed count string against its own boundary values.
