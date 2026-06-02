# Recipe Coverage — PR #42613 (close-all-positions confirmation modal)

Source: linked ticket TAT-2852 (AC1–AC5). Recipe decision: **skip-smoke-strategy** (RECIPE_STRATEGY=smoke).
Validation layers this run:
- **Smoke regression** `perps-lifecycle.recipe.json`: status=pass, 19/19 trace nodes ok:true (open/close ETH testnet position, market nav). No gating console issues.
- **Opportunistic live AC proof** (non-destructive, confirm never pressed): AC1/AC2/AC4 captured + image-reviewed on the PR branch.
- **Unit tests**: close-all-positions-modal.test.tsx + perps-view.test.tsx → 45/45 pass.
- **Code path review** + **mobile parity** (usePerpsCloseAllCalculations.ts).

| # | AC (verbatim) | Target env | Evidence | Verdict | Justification |
|---|---------------|------------|----------|---------|---------------|
| 1 | AC1 — Given an Active Trader with at least one open position, When they open the Perps tab, Then the "Close All" button is visible. | fullscreen | evidence-ac1-close-all-button-visible.png | PROVEN (live) | Screenshot shows "Close all" control beside the Positions header with an open ETH 2x long position ($10.84). Live on PR branch. |
| 2 | AC2 — Given the "Close All" button is visible, When the user taps it, Then a confirmation screen appears showing the expected outcome of closing all open positions. | fullscreen | evidence-ac2-confirmation-modal.png | PROVEN (live) | Modal "Close all positions" shows description + Margin $5.20 (incl P&L −$0.3718), Fees −$0.02, You'll receive $5.18 ($5.20−$0.02=$5.18 reconciles exactly), with Keep positions / Close all buttons. |
| 3 | AC3 — Given the confirmation screen is displayed, When the user confirms, Then all open positions are submitted for closure. | fullscreen | unit test + code | UNTESTABLE (live) — PROVEN via unit test | Confirming triggers a real, irreversible market close on the live account → intentionally not executed (read-only review). perps-view.test.tsx "calls batch close after confirmation and applies a single positions snapshot" asserts `submitRequestToBackground('perpsClosePositions',[{closeAll:true}])` fires only after modal submit. |
| 4 | AC4 — Given the confirmation screen is displayed, When the user cancels, Then no positions are closed and the user returns to the Perps tab. | fullscreen | evidence-ac4-cancelled-positions-intact.png | PROVEN (live) | "Keep positions" dismissed the modal; ETH position remained ($10.83) and Perps tab still shown. No close fired. Also covered by unit test "does not execute close all when confirmation is cancelled". |
| 5 | AC5 — Given a trader with no open positions, When they view the Perps tab, Then the "Close All" button is either hidden or disabled. | fullscreen | code + unit test | UNTESTABLE (live) — PROVEN via code + unit test | Live account had ≥1 position; zero-position state unreachable non-destructively. perps-positions-orders.tsx renders the Close All button only inside `{hasPositions && (…)}`, and the component returns `null` when `!hasPositions && !hasOrders` → button hidden. Modal test "disables submit button when positions array is empty" covers the disabled branch. |

Overall recipe coverage: 3/5 ACs PROVEN live (AC1, AC2, AC4); untestable-live: AC3 (irreversible market close — proven via unit test asserting `perpsClosePositions([{closeAll:true}])`), AC5 (cannot zero positions on live account — proven via code path + unit test). weak: 0, missing: 0.

All ACs are either PROVEN in-browser or explicitly UNTESTABLE-live with a concrete safety/state rationale AND backed by passing unit-test/code evidence. No WEAK or MISSING rows.
