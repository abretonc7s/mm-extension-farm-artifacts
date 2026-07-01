# Reviewer-driven learnings — PR #44002 (TAT-3461)

- Partial flow mirroring: reviewer caught that the expanded trade panel mirrored the order-entry submit flow's *param passing* (maxSlippageBps into formStateToOrderParams) but omitted the *pre-submit guard* (block when estimatedSlippageBps > maxSlippageBps) — when mirroring a submit flow, enumerate every guard/branch the source path runs, not just the happy-path arguments.

- Shared-component gap: the order-entry slippage guard lives in the page, not in the shared OrderEntry component, so wrapping OrderEntry does NOT inherit it — fix-bug should treat page-level guards around a shared form as separate obligations that each caller must re-implement.

- Leaf-panel state can be lifted safely: covering the guard required snapshotting form state via onFormStateChange, which the "no top-level price-lift" perf design initially avoided — local snapshot in an already-memoized leaf panel is fine (re-renders stay local); the perf constraint is about the page tree, not the panel itself.

- Formatting gate is a real CI blocker: the branch failed CI Test lint purely on oxfmt (lint:format) with no source edits committed — fix-bug should run `yarn lint:format:fix` (oxfmt), not just eslint/prettier, before considering a perps PR green.

- Coverage guards can be unreachable: handleExpandClick's `!decodedSymbol` early return is dead-defensive (page redirects before the button renders), so component tests cannot hit it — derive coverage targets from reachable branches and flag defensively-unreachable lines instead of chasing 100%.
