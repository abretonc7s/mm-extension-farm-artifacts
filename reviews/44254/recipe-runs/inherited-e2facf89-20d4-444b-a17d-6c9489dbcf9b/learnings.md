# Learnings — Review of PR #44254 (perps order book)

## Runner / harness contract drift (fix TASK.md template)

- **`mm-harness manifest` does not exist** in the installed runner (v on this slot). Valid commands:
  `status, checklist, execution-template, actions, stop, call, run, last, doctor, check,
  recipe-quality, provision, install, verify, cleanup, launch, logs, debug, update, fixtures`.
  Use `actions --raw --adapter extension --json` (as `recipe-quality.md` says), not `manifest`.
- **`run` has no `--project-root`** — it's `--target`. The TASK.md template's copy-paste command fails.
- **`ui.screenshot` rejects `note`.** TASK.md and `recipe-quality.md` both say captions go in `note`;
  the live action manifest declares `category, label, path, timeout_ms`. Captions must go in **`label`**.
  `--plan` catches this instantly (`recipe.unknown_param`), so always `--plan` before a live run.
- **`--launch-existing-dist` / `--slot` fail on this slot**: `--launch-existing-dist` alone gives
  "no configured slot maps to this repo", and `--slot mini-mme-2` gives "Extension slot lookup requires
  a local host checkout". What works when the browser is already up:
  `run <recipe> --adapter extension --artifacts-dir <dir> --target <repo> --json --cdp-port 7666
  --runtime-dir temp/recipe/runtime --heal off`. This attaches instead of launching, which is also what
  the read-only review rule wants.

## The `mark` script counts *every* checkbox in TASK.md

`mark N` resolves N as the Nth `- [ ]`/`- [x]` line in the whole file — including the PR body's
**7 pre-merge author/reviewer checkboxes**. So visible checklist step N = `mark (N+7)` on this task.
`mark 2` silently re-marked "I've completed the PR template" instead of step 2. Always verify with
`grep -n '^\- \[.\] \*\*<N>\.' TASK.md` after marking. The two unchecked PR-body reviewer boxes also
mean `mark complete --mark-last` needs `--skip-checklist`.

## Verify an assertion is discriminating before trusting it

`jest -t "<title>"` with a **non-existent** title exits **0** and prints `Tests: N skipped, N total`.
So `assert_exit_code 0` alone on a name-filtered run proves nothing. Pairing it with
`assert_output contains "1 passed"` does discriminate — but only because I ran the negative case first
to confirm it. Do this for any command-based AC proof.

Related: **`jest -t` is a regex.** `-t "returns false when the flag is absent (default OFF)"` silently
matched zero tests because `(default OFF)` parsed as a capture group. Drop parenthesised suffixes or
escape them; the failure mode is a silent 0-match, not an error.

## Extension recipe selectors / navigation (perps order entry)

- Order entry route is `#/perps/trade/:symbol` (`PERPS_ORDER_ENTRY_ROUTE = '/perps/trade'`).
  `ui.navigate` has no named page for it — `page` only accepts `home|perps|perps-market` — so use
  `hash: "#/perps/trade/ETH"`. Verified working via `mm-harness call ui.navigate hash=...`.
- Navigate to `page: perps` **first**, then to the trade hash. Same-hash navigation won't remount, so
  without the bounce a previously-open panel stays open and a "collapsed by default" assertion is
  meaningless. (Two aborted runs left the panel open and the re-navigation still reset it — that
  accidentally became good evidence.)
- `ui.wait_for` supports `visible: false` for absence assertions — the clean way to prove
  "hidden by default" without an eval.
- Useful testids on this screen: `perps-order-book-toggle`, `perps-order-book`,
  `perps-order-book-resize-handle`, `perps-order-book-{ask,bid}-row-{0..4}[-price|-value]`,
  `perps-order-book-{spread,ratio,view-toggle,grouping-trigger,skeleton,connection-error,reconnecting}`,
  and form-side `order-type-{toggle,market,limit}`, `limit-price-input`, `amount-input-field`,
  `leverage-slider`, `auto-close-toggle`, `submit-order-button`.
- **`limit-price-input` is the wrapper `<div>`, not the `<input>`.** Reading `.value` off it returns
  `undefined`; you need `wrapper.querySelector('input').value`. The inner input has no testid, which
  is why the prefill value could only be shown in a screenshot, not asserted in trace.

## Reading live extension state read-only

A ~30-line node script (`fetch http://127.0.0.1:7666/json/list` → `WebSocket` →
`Runtime.evaluate`) is enough to read `window.stateHooks.store.getState()` from the `home.html` target.
Node 24 has a global `WebSocket`, so no dependency needed. This is how I confirmed
`remoteFeatureFlags.perpsOrderBookEnabled = { enabled: true, minimumVersion: "13.0.0" }` on this slot
before committing to a `generate-ui` decision — worth doing early, since a flag-off fixture would have
made every UI AC untestable.

## Coverage gaps and why

- **AC5 (compact popup layout) was UNTESTABLE.** The CDP session exposes only `home.html`,
  `offscreen.html`, snaps and the service worker — no popup/notification target. Resizing the window
  via `Browser.setWindowBounds` would have faked it but mutates the orchestrator-owned browser, so I
  didn't. The compact **width math** was still provable via the `order-book.utils` clamp tests; only
  the real popup rendering is unverified. Pattern: when an AC names two environments and only one is
  reachable, prove the reachable half visually, prove the unreachable half's logic by test, and
  escalate explicitly rather than rounding up to PROVEN.
- **Duplicate screenshots are a real risk with panel UIs.** AC2/AC4/AC5 all captured the same screen
  differing only in live tick values. Grouped into one image, omitted the other two per the evidence
  contract. Worth planning for at draft time — for a single-screen feature, one strong capture plus
  DOM/text assertions beats one capture per AC.

## Review findings worth generalising

- **Long-lived branches with many `Merge branch 'main'` commits duplicate things.** This PR had ~50
  commits including 8 merges, and produced **two** duplicate-key defects from merge resolutions:
  a computed key in a `Record<PerpsErrorCode, string>` (which TypeScript *does* catch — TS1117) and a
  JSON fixture key (which nothing catches). Always run `yarn lint:tsc` and a
  `json.load(..., object_pairs_hook=<dup detector>)` pass on merge-heavy perps branches.
  ESLint's `no-dupe-keys` does **not** flag computed keys, so `lint:tsc` is the only gate that fires.
- **Validate before flagging — three of my concerns died on inspection**, and would have been noise:
  (1) per-connection `AggregatedOrderBookConnection` looked like it might open a socket per UI surface —
  the library creates it lazily on first subscribe; (2) `connectionStatus` looked like it might never
  reach `connected` if a socket were reused, since the library binds an `open` listener — but
  `connected` is actually emitted when the subscribe promise resolves, independent of `open`;
  (3) the unguarded `subscribe()` in `#addDynamicSubscription` can throw per the library contract, but
  the channel is torn down first and teardown releases the payload synchronously, so it's unreachable.
  Only the third was worth even a sentence, as a latent note.
- **Check whether a "divergence" from mobile is actually mobile being the outlier.** The `'--'` vs
  `'—'` fallback glyph looked like extension drift; the canonical
  `PERPS_CONSTANTS.FallbackDataDisplay` in `@metamask/perps-controller` is `'--'`, so mobile's
  order-book-local em dash is the deviation. Same for `proLayoutPreferences.orderBookExpanded` — it
  exists in controller state and looked like something the extension failed to use, but **neither**
  client consumes it.
- **Baseline console noise on this slot:** repeated resource `404`s and `Unknown action Object` show up
  in `diagnostics.json` as non-blocking errors. Neither matched anything in this diff and all nodes
  passed, so they were reported as observed rather than as findings — matches the CLAUDE.local.md
  guidance about unknown-action noise.
