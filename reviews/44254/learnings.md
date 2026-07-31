# Learnings — review of PR #44254 (perps order book)

## Harness / CLI drift (cost the most time — fix these in the task template)

- **`mm-harness manifest` does not exist** in the installed CLI. TASK.md steps 1, 5 and 12 all tell you to run it; the CLI answers `CLI_UNKNOWN_COMMAND` and lists the valid set. The documented replacement is `mm-harness actions --raw --adapter extension --json`, which is also what `recipe-quality.md` uses. Use `actions --raw` for the manifest and `actions --action <name> --json` for a single action's field schema (`--detail full` is also not a flag).
- **`mm-harness run --project-root` does not exist** — it is `--target`. TASK.md step 16 has the wrong flag.
- **`--launch-existing-dist` on `run` fails in this slot**: `no configured slot maps to this repo. Pass --slot <slot-id> or add the checkout to pool/*.json`. Dropping the flag runs fine against the already-launched browser, which is what you want in a review anyway.
- **`timeout` is not on PATH on macOS** — don't reach for it to bound a hanging command.

## capture-helper: the single biggest evidence trap

- `ui.screenshot` silently falls back to `Page.captureScreenshot` when capture-helper times out, and the fallback is **not valid review evidence** per the task rules. The fallback is only visible in `artifact-manifest.json` → `metadata.provider` / `fallbackFrom` — the run still reports `pass`. **Always audit `metadata.provider` per screenshot; never assume a green run means valid images.**
- Root cause of the timeouts: **orphaned `capture-helper` processes hold the macOS capture session**. A healthy snapshot takes ~0.1s; with orphans it hangs to the timeout.
- **`pkill` (SIGTERM) does not clear them — `pkill -9` does.** This is the whole fix. I lost two full recipe runs to SIGTERM-only cleanup.
- Practical recipe pattern: a `setup-clear-stale-capture-helpers` node plus a `pkill -9 -f 'capture-helper'` command node immediately before *every* `ui.screenshot`. That took the run from 0/9 → 6/9 valid captures; the residual flake was handled by re-driving the exact state and re-capturing out-of-band (`retake-screenshots.cjs`), which must then be disclosed in the coverage matrix since the retaken frames show the terminal `Recipe completed` HUD rather than the node intent.
- Background-running a capture-helper call and then killing the wrapper is what *creates* the orphans. Don't background it.

## Runner action gotchas

- **`ui.press` does not move DOM focus.** Pressing a `tabIndex={0}` element then sending `ui.key_press` delivers the key to whatever was focused before. Focus explicitly via a CDP `.focus()` command node first. (Worth checking whether the *product* focuses on click before reporting it — here a trusted click didn't either, which turned an automation annoyance into a real review finding.)
- `ui.wait_for` accepts a raw `selector`, so attribute assertions work directly: `[data-testid="…"][aria-valuenow="35"]` is a strict, cheap state assertion — much better than a DOM eval.
- `assert_output` on a jest node must assert **`1 passed`**, not just `assert_exit_code: 0`. `jest -t` with a title that matches nothing still exits 0, so exit-code-only proof is silently vacuous.
- There is no declared action for mouse drag or viewport control — drive those through `command` + a small CDP script, and gate them with `assert_exit_code` so a failure actually fails the run.

## Extension/CDP techniques worth reusing

- Read remote feature flags without any harness: `stateHooks.store.getState().metamask.remoteFeatureFlags`. Note `stateHooks.getCleanAppState()` returned an object with **no** `metamask` keys here — don't use it for flag checks.
- The slot fixture pins `perpsOrderBookEnabled: { enabled: true, minimumVersion: '13.0.0' }`, so the flag-ON path is free but the flag-OFF path is **not reachable live** — prove flag-OFF with the owning jest tests, and say so rather than marking the AC untestable.
- Compact/popup layout **is** testable from the fullscreen target: `Emulation.setDeviceMetricsOverride` to 360px gives the real compact layout. Chrome enforces a ~500px minimum *window* width, so pair `Browser.setWindowBounds` (for a sane OS-level capture frame) with the metrics override (for the true 360px layout). The previous run of this family marked the compact half UNTESTABLE — it isn't.
- `Emulation.clearDeviceMetricsOverride` did not always take effect from a fresh WS session; re-assert the viewport explicitly rather than trusting the clear.
- Perps order entry route is `#/perps/trade/<SYMBOL>`; testnet ETH and BTC both stream a full 5×5 aggregated ladder, so no fixture seeding is needed for order-book proof — it is entirely read-only (no position/order opened).

## Codebase patterns (perps / extension)

- **`useEffect(..., [])` + an early return is an anti-pattern in these pages.** `perps-order-entry-page.tsx` early-returns a skeleton while `marketsLoading`, so any `[]` effect that reads a ref on the main render tree silently never runs on the cold path. This is exactly how the ResizeObserver bug shipped — and why its unit test passes (RTL renders with markets already loaded, so the ref is populated on the first commit). **When reviewing a `[]` effect that touches a ref, check for early returns above the JSX that owns that ref, and test the loading→loaded transition, not just the loaded state.**
- Entry-path-dependent bugs need both paths probed: cold `Page.reload` vs warm SPA hash navigation gave opposite results here. A single-path probe would have missed it entirely.
- Mixing `component-library` Modal parts with `@metamask/design-system-react` primitives is the **house convention** in perps (8+ existing modals) — don't flag it as drift.
- Mobile parity: `app/components/UI/Perps/utils/orderBookGrouping.ts` is the counterpart to `order-book.utils.ts`; `getDepthRatio` and `formatSpreadPercent` are byte-identical, so diff them directly rather than eyeballing behaviour. Note the mobile ref checkout does **not** contain the `PERPS_CONSTANTS` definition (it has moved into the controller package) — don't conclude "mobile has no such constant" from a failed grep.
- Perps decimals rule: `toFixed` on a *percentage round* or a *precision clamp* is fine and matches mobile; the rule targets fiat price/value display. Diff-gate before flagging.

## Review-process notes

- `lint:tsc` is clean on this branch — the duplicate-key error an earlier reviewer hit is fixed. Re-verify baseline failures before repeating prior feedback; all 6 findings from the 2026-07-30 review were already resolved in `97dcb0cf`.
- The `mark` script counts **every** checkbox in TASK.md, and the PR body's own author/reviewer checklists sit above the real checklist — so step N is checkbox N+7 here. Verify with a first `mark` call and read back the echoed line before trusting the numbering. (Framework issue, not something to patch in the repo.)
