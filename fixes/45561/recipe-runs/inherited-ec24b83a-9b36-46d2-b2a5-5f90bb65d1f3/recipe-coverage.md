# TAT-3763 — Recipe AC coverage matrix

Source of truth for node execution: `recipe-run/trace.json` (verify run, 24/24 nodes `ok: true`)
and `baseline-run/trace.json` (baseline run against the unfixed tree, 24/24 nodes `ok: true`).

## Matrix

| # | AC (verbatim) | Proof mode | Primary evidence | Recipe nodes (IDs) | Visual file if any | Evidence verdict | Justification |
|---|---------------|------------|------------------|---------------------|--------------------|------------------|---------------|
| 1 | "The available to trade percentage should display as a clean, rounded number on initial load — consistent with the value shown after user interaction." (+ *Steps to reproduce* 4: "Observe the *available to trade percentage* on initial load — it shows a truncated decimal such as `22...`") | mixed | state (live DOM probe) + screenshot | `ac1-wait-percent-pill`, `ac1-probe-initial-load`, `ac1-assert-percent-is-whole-number`, `ac1-assert-percent-not-clipped`, `ac1-assert-slider-on-step-grid`, `ac1-screenshot-initial-load-percent` | `before-evidence-ac1-initial-load-percent.png` → `after-ac1-initial-load-percent.png` | **PROVEN** | Baseline run on the unfixed tree recorded `percentValue: "0.44"`, `percentIsInteger: false`, `percentIsClipped: true` (scrollWidth 50 > clientWidth 45), `sliderIsOnStepGrid: false`. Verify run on the fixed tree records `"0"`, `true`, `false`, `true`. Screenshots show the pill changing from a clipped `0...` to a clean `0 %`. Reverting the one-line fix flips all three assertions to failing. |
| 2 | "Move the slider" / "Observe the value now displays correctly" (*Steps to reproduce* 5-6) — non-regression of the already-working interaction path | state | state (live DOM probe after trusted UI input) + test | `ac2-press-slider`, `ac2-key-increment-1..3`, `ac2-wait-percent-pill`, `ac2-probe-after-interaction`, `ac2-assert-percent-value`, `ac2-assert-percent-is-whole-number`, `ac2-assert-percent-not-clipped` | `after-ac2-after-slider-interaction.png` (orientation only; **not** the primary proof) | **PROVEN** | The slider is moved through a real `ui.press` plus three trusted `ui.key_press` ArrowRight events — no injected values. `ac2-wait-percent-pill` gates on `input[type="range"][aria-valuenow="3"]`, then the probe asserts `percentValue === "3"`, integer, unclipped. Identical results before and after the fix, which is precisely the required non-regression signal. Also covered by `usePerpsOrderForm.test.ts` (41 passing). |

Overall recipe coverage: 2/2 ACs PROVEN (untestable: none, weak: 0, missing: 0)

## Before/after delta check (step 26.1)

- **AC1** — before `0...` (clipped fractional) vs after `0 %` (clean whole). Delta matches the
  bug → fix described in TASK.md. The baseline recipe asserts the buggy values and passes on the
  unfixed tree, so the before capture is honest rather than an artefact of a failed run.
- **AC2** — before and after are deliberately **identical** (`3 %`). This is the correct expectation:
  the ticket states "The value resets correctly when the user interacts with the slider", so the
  interaction path was never broken. An identical pair here is evidence of non-regression, not weak
  evidence — which is why AC2's primary evidence is the trace assertion, not the image, and why the
  redundant AC2 pair is listed under `omit` in `evidence-manifest.json`.

## Forbidden-pattern scan (step 11 / step 26.6)

| # | Pattern | Result |
|---|---------|--------|
| 1 | `switch` with `default` routing around an AC assertion | Absent — no `switch` node in the recipe |
| 2 | read-only check returning a "skip reason" string | Absent — the probe only ever emits measured DOM values |
| 3 | `wait` > 500ms substituting for `wait_for` | Absent — zero `wait` nodes; all synchronisation via `ui.wait_for` |
| 4 | DOM-only assertion for a visual claim | Absent — the clipping claim is backed by a real geometry read (`scrollWidth` vs `clientWidth`) **and** a capture-helper screenshot |
| 5 | Node ID not prefixed `ac<N>-` / `setup-` / `gate-` / `teardown-` | Absent — verified programmatically; only the terminal `done` node is unprefixed |
| 6 | Missing screenshot for a visual/mixed AC; screenshot as sole proof of a state AC | Absent — AC1 (mixed) has a screenshot; AC2 (state) is proven by assertions, with the image as orientation only |
| 7 | `end` node claiming UNTESTABLE for buildable state | Absent — no UNTESTABLE rows; required state already satisfied by the live account |
| 8 | UI value injection | Absent — the probe performs a read-only `Runtime.evaluate` with no assignment; all input flows through `ui.press` / `ui.key_press` |

Additional check: no `manual` action anywhere, and every screenshot artifact records
`provider=capture-helper` in the run `artifact-manifest.json` (no `Page.captureScreenshot`,
`extension-dom-raster`, or `macos-screencapture` fallback).
