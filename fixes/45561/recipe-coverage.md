# PR #45561 — Recipe AC coverage (post-rebase re-validation)

This is a **re-validation** pass, not a fresh authoring pass. The recipe is family-inherited from
`tat-3763-0815-072210` and was re-run against `branch + origin/main` merged and rebuilt
(`dist` git id `edba2504fc`). Source of truth: `recipe-run/trace.json` — **24/24 nodes `ok: true`**.

## Matrix

| # | AC (verbatim) | Proof mode | Primary evidence | Recipe nodes (IDs) | Visual file if any | Evidence verdict | Justification |
|---|---------------|------------|------------------|---------------------|--------------------|------------------|---------------|
| 1 | "The available to trade percentage should display as a clean, rounded number on initial load — consistent with the value shown after user interaction." (+ *Steps to reproduce* 4: "Observe the *available to trade percentage* on initial load — it shows a truncated decimal such as `22...`") | mixed | state (live DOM probe) + screenshot | `ac1-wait-percent-pill`, `ac1-probe-initial-load`, `ac1-assert-percent-is-whole-number`, `ac1-assert-percent-not-clipped`, `ac1-assert-slider-on-step-grid`, `ac1-screenshot-initial-load-percent` | `revalidation-ac1-initial-load-percent.png` | **PROVEN** | `probe-initial-load.json` records `percentValue "0"`, `percentIsInteger true`, `percentIsClipped false` (`scrollWidth == clientWidth == 45`), `sliderIsOnStepGrid true`. The screenshot shows a clean, fully visible `0 %` pill. On the unfixed tree the parent run's baseline recipe recorded `"0.44"` / `false` / `true` (scrollWidth 50 > clientWidth 45) / `false`, so reverting the one-line fix flips all three AC1 assertions. |
| 2 | "Move the slider" / "Observe the value now displays correctly" (*Steps to reproduce* 5-6) — non-regression of the already-working interaction path | state | state (live DOM probe after trusted UI input) + test | `ac2-press-slider`, `ac2-key-increment-1..3`, `ac2-wait-percent-pill`, `ac2-probe-after-interaction`, `ac2-assert-percent-value`, `ac2-assert-percent-is-whole-number`, `ac2-assert-percent-not-clipped` | `revalidation-ac2-after-slider-interaction.png` (orientation only; **not** the primary proof) | **PROVEN** | The slider is driven by a real `ui.press` plus three trusted `ui.key_press` ArrowRight events — no injected values. `ac2-wait-percent-pill` gates on `input[type="range"][aria-valuenow="3"]`, then `probe-after-interaction.json` records `percentValue "3"`, integer, unclipped. Also covered by `usePerpsOrderForm.test.ts` (41 passing at the rebased HEAD). |

Overall recipe coverage: 2/2 ACs PROVEN (untestable: none, weak: 0, missing: 0)

## Re-validation notes

- **Recipe ported, not modified.** The inherited recipe's `command` and `assert_json` nodes still
  referenced the parent task dir (`tat-3763-0815-072210`). Ten path references were repointed to this
  task's artifacts dir so the run would not overwrite the parent run's evidence. The node graph, action
  set, assertions, and asserted values are byte-for-byte unchanged.
- **Before/after pair lives in the parent run.** This pass re-validates the fixed state only, so its two
  captures are post-fix. The honest before/after comparison
  (`before-evidence-ac1-initial-load-percent.png` → `after-ac1-initial-load-percent.png`) belongs to
  `tat-3763-0815-072210`, where a baseline recipe asserting the buggy values passed on the unfixed tree.
- **Capture provenance.** Both screenshots record `provider=capture-helper` in
  `recipe-run/artifact-manifest.json` — no `Page.captureScreenshot`, `extension-dom-raster`, or
  `macos-screencapture` fallback.

## Forbidden-pattern scan

Unchanged from the parent audit and re-verified against the ported file: no `switch`, no `wait` nodes,
no skip-reason strings, no `manual` action, no UNTESTABLE rows, every node ID prefixed
`ac<N>-`/`setup-`/`gate-` (plus the terminal `done`), the clipping claim backed by a real geometry read
**and** a screenshot, and no UI value injection — the CDP probe is a read-only `Runtime.evaluate` and all
input flows through `ui.press` / `ui.key_press`.
