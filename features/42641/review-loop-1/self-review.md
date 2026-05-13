# Worker: Self-Review

> Automated quality gate. Runs after worker completes, before human review.
> Same repo, same slot — full codebase + CDP access.

> **Signal file:** Write `temp/tasks/feat/tat-1043-0513-160437/SELF-REVIEW-SIGNAL.json` when done. The orchestrator watches this for instant completion detection.

**CRITICAL: Never pause or wait for user input. Complete ALL steps in a single uninterrupted run. Do NOT use `/review` or any shortcut review command; execute this checklist directly, write `artifacts/review-feedback.md`, then write `SELF-REVIEW-SIGNAL.json` and exit with `/exit`.**

---

You are an autonomous self-review agent. The worker just finished a fix or feature on this repo. Your job is to review the diff, verify correctness, and write a verdict. You have full codebase access — use it.

## Task

```
TASK_DIR: temp/tasks/feat/tat-1043-0513-160437
REPO: /Users/deeeed/dev/metamask/metamask-extension-2
PLATFORM: chrome-extension
WATCHER_PORT: 9012
CDP_PORT: 
SESSION: mme-2
RUNTIME_DIR: temp/runtime
TICKET: TAT-1043
STATUS: working
```

---

## Checklist

Execute top-to-bottom. Every step is mandatory.

**When updating STATUS or checkboxes, make the edit idempotent.** If a line is already `[x]`, do not try to patch it again; verify the file state and continue.

**After completing each step you MUST:**
1. Edit this file (`temp/tasks/feat/tat-1043-0513-160437/SELF-REVIEW.md`) to mark the checkbox `[x]`
2. Immediately proceed to the next step — never pause for user input

### Understand the change (steps 1-3)

- [x] **1. Update Status** — edit the Task block above: set `STATUS: working`.
- [x] **2. Get the diff overview:**
  ```bash
  git diff main...HEAD --stat
  ```
  Print the summary. Count files changed, additions, deletions.
- [x] **3. Read every changed file in full** — not just diff hunks. Understand the complete context:
  ```bash
  git diff main...HEAD
  ```
  Also read the worker's report if available:
  ```bash
  cat temp/tasks/feat/tat-1043-0513-160437/artifacts/report.md 2>/dev/null
  ```

### Verify correctness (steps 4-7)

- [x] **4. Run type checking:**
  ```bash
  yarn lint:tsc 2>&1 | tail -30
  ```
  This must match the repo's own TypeScript gate. Treat any failure here as a blocker.
- [x] **5. Run affected tests:**
  ```bash
  # Find test files for changed code
  git diff main...HEAD --name-only | grep -E '\.tsx?$' | while read f; do
    base=$(basename "$f" .tsx); base=$(basename "$base" .ts)
    find . -path "*/__tests__/*${base}*" -o -path "*/${base}.test.*" -o -path "*/${base}.spec.*" 2>/dev/null
  done | sort -u | head -10
  ```
  Run any found tests:
  ```bash
  yarn jest <test-files> --no-coverage 2>&1 | tail -30
  ```
  If no tests exist for changed code, note it.
- [x] **6. Review test quality against project guidelines:**
  For every new or modified test file in the diff, check:
  - No "should" in test names (hard rule, zero exceptions)
  - AAA pattern with blank line separation
  - Async state updates wrapped in `act()`
  - Assertions are specific (not just `toBeTruthy()`/`toBeDefined()`)
  - Tests do not duplicate i18n/user-facing copy as raw hardcoded strings when the component already uses a message key/helper
  Before flagging this, quote the exact assertion line and confirm it uses a real string literal (for example `'Add funds'`) rather than an existing message/helper reference such as `messages.addFunds.message`, `t('addFunds')`, or a shared constant. If the assertion already uses the message source, do NOT flag it.
  Before flagging this, quote the exact assertion line and confirm it uses a real string literal (for example `'Add funds'`) rather than an existing message/helper reference such as `messages.addFunds.message`, `t('addFunds')`, or a shared constant. If the assertion already uses the message source, do NOT flag it.
  Flag every violation with file:line.
- [x] **7. Review against extension domain anti-patterns:**
  Read `temp/runtime/extension-review-antipatterns.md` (synced from project fixtures). Check the diff against every category:
  - **Import boundaries** — cross-package imports that bypass `@metamask/` scope, reaching into `app/` from `ui/` or vice versa
  - **Controller usage** — direct controller state mutation from UI, missing selector abstractions
  - **LavaMoat policy** — new dependencies or changed imports that require `lavamoat/browserify/` policy updates
  - **MV3 patterns** — long-running operations in service worker without `keepAlive`, sync storage access in hot paths
  - **Shared state** — mutable module-level state, missing defensive copies
  - **Error handling — no swallowed exceptions.** Every new `catch` block must rethrow or surface user-visible state (`displayWarning`, toast, store action). `log.error()` / `console.error()` / `Sentry.captureException()` followed by silent return is still a swallow. Bare `catch (e) {}` and `.catch(() => {})` are violations. **Exception:** intentional swallows are allowed only when an inline comment on the line above the `catch` explains why recovery is correct (expected error, retried elsewhere, fire-and-forget cleanup). No comment ⇒ flag with file:line.
  - **testIDs** — interactive elements without testID
- [x] **8. Compare with mobile equivalent (if perps change):**
  Check if the diff touches perps components, hooks, or utils:
  ```bash
  git diff main...HEAD --name-only | grep -i perps | head -10
  ```
  If yes, consult the mobile-extension map:
  ```bash
  cat temp/runtime/perps-mobile-extension-map.md
  ```
  For each changed perps file, find the mobile equivalent using section 6 of the map and read it:
  ```bash
  ls /Users/deeeed/dev/metamask/metamask-mobile-ref/app/components/UI/Perps/Views/ 2>/dev/null | head -20
  ```
  Check for:
  - **Behavioral alignment** — does the extension fix match how mobile handles the same scenario?
  - **Formatting divergence** — any new `.toFixed(2)` or `{min:2, max:2}`? (mobile uses `formatPerpsFiat` — see section 3 of map)
  - **Pattern drift** — did the worker introduce a pattern mobile already solved better?
  - **Missing constants** — inline `0`, `0.03`, `5000` instead of named constants that mobile uses
  If `/Users/deeeed/dev/metamask/metamask-mobile-ref` is empty or the change is not perps-related, write "N/A" and proceed.
- [x] **9. Assess diff minimality:**
  - Are there unnecessary changes? (reformatting, import reordering, unrelated modifications)
  - Is debug code left in? (`console.log`, commented-out code, TODO without ticket)
  - Could the fix be simpler?
  - **Value parity** — when the diff changes a formatter, sign rule, rounding, or threshold for a *displayed* value (price, RoE, margin, size, leverage, fees), enumerate every render path of that value before declaring done. Run `git grep -n <symbol-or-format-fn>` on the changed callers and verify preset/blur/recalc/summary/card/list paths all apply the same rule. Flag if **any** path was missed — partial parity is a regression.
- [x] **10. Assess fix quality — "Is this the best fix?"**
  For each non-trivial code change, evaluate:

  **Best approach:**
  - Is this the minimal, most correct fix? Or is there a simpler/more elegant approach?
  - Distinguish: "best long-term fix" vs "pragmatic fix for this PR" — document both if they differ
  - Would you ship this? If not, state what you would not ship and why
  - If a better approach exists, describe it with file:line references

  **Test quality:**
  - Do tests assert the *right thing*, not just pass? (e.g., asserting mock was called with specific args, not just `mockReturnValue(true)`)
  - Are failure paths tested? (what happens when the fix condition is NOT met?)
  - Could tests pass even if the fix is reverted? If yes, tests are insufficient

  **Brittleness:**
  - Does the fix rely on import-time evaluation, module-level constants, or frozen values that won't update?
  - Does it create mock coupling (changing a mock in `beforeEach` won't affect already-evaluated code)?
  - Does it leave the data model "confusing and easy to break again"?

### Recipe validation (step 11)

- [x] **11. Check recipe quality and re-run it** (if `temp/tasks/feat/tat-1043-0513-160437/artifacts/recipe.json` exists):
  ```bash
  cat temp/tasks/feat/tat-1043-0513-160437/artifacts/recipe.json 2>/dev/null
  cat temp/tasks/feat/tat-1043-0513-160437/artifacts/recipe-quality.json 2>/dev/null
  ```
  If a recipe exists, you must also re-run it against the current code. Reload the extension first because webpack does not hot-reload the active page:
  ```bash
  cd /Users/deeeed/dev/metamask/metamask-extension-2/temp/recipes
  npx tsx status.ts --cdp-port 
  ```
  If the extension is unresponsive or blocked:
  ```bash
  bash temp/runtime/reopen-browser.sh --slot-id mme-2 --repo /Users/deeeed/dev/metamask/metamask-extension-2 --cdp-port  --runtime-dir temp/runtime --watcher-port 9012
  npx tsx status.ts --cdp-port 
  ```
  Then execute the recipe and inspect the resulting trace:
  ```bash
  node validate-recipe.js --recipe temp/tasks/feat/tat-1043-0513-160437/artifacts/recipe.json --cdp-port  --skip-manual
  cat temp/tasks/feat/tat-1043-0513-160437/artifacts/trace.json 2>/dev/null
  ```
  - Does it test the **actual fix**, not just "app boots"?
  - Did the re-run actually pass? If not, verdict must be `ISSUES`.
  - Does `trace.json` show the AC-bound nodes executing successfully, not just a drafted recipe on disk?
  - Does it **seed its own data**? If the fix depends on specific state (e.g. order/funding transactions), the recipe must create or inject that data — a recipe that passes on an empty wallet is trivially true and does not validate the fix. Flag as `weak` if it relies on pre-existing wallet state.
  - Does it use `call` for existing flows instead of raw steps?
  - Are assertions meaningful (specific testID checks, not just `not_null`)?
  - If `recipe-quality.json` is missing for a task that wrote a recipe, verdict should usually be `ISSUES`, not a silent pass.
  - If no recipe exists, note it.

- [x] **11b. Manifest gate** — any `FAIL_EMPTY` or `MISSING:` ⇒ verdict ISSUES.
  ```bash
  grep -qE '\| (visual|mixed) \|' temp/tasks/feat/tat-1043-0513-160437/artifacts/recipe-coverage.md && \
    [ "$(jq '(.before_after_pairs // []) + (.standalone // []) | length' temp/tasks/feat/tat-1043-0513-160437/artifacts/evidence-manifest.json 2>/dev/null || echo 0)" -eq 0 ] && echo FAIL_EMPTY
  jq -r '[.before_after_pairs[]?.before, .before_after_pairs[]?.after, .standalone[]?.file] | flatten | .[] | strings' temp/tasks/feat/tat-1043-0513-160437/artifacts/evidence-manifest.json 2>/dev/null | while read f; do [ -s "temp/tasks/feat/tat-1043-0513-160437/artifacts/$f" ] || echo "MISSING:$f"; done
  ```

### LavaMoat policy check (step 12)

- [x] **12. Check LavaMoat policy consistency:**
  ```bash
  git diff main...HEAD --name-only | grep -q 'lavamoat/browserify/' && echo "POLICY_CHANGED" || echo "NO_POLICY_CHANGE"
  ```
  If deps were added/changed in the diff but no policy files changed, flag it — `yarn lavamoat:auto` may be needed.
  If policy files changed, verify they correspond to actual dependency changes (not spurious regeneration).

### Write verdict (steps 13-14)

- [x] **13. Write `temp/tasks/feat/tat-1043-0513-160437/artifacts/review-feedback.md`:**

  ```markdown
  # Self-Review: TAT-1043

  ## Verdict: PASS

  (or)

  ## Verdict: ISSUES

  ## Summary
  <1-3 sentences: what the worker did, whether it's correct>

  ## Type Check
  - Result: PASS | FAIL
  - New errors: <count in changed files, or "none">

  ## Tests
  - Result: PASS | FAIL | NO_TESTS
  - Details: <which tests ran, any failures>

  ## Test Quality
  - Findings: <list with file:line, or "none found">

  ## Domain Anti-Patterns
  - Findings: <list with file:line, or "none found">

  ## Mobile Comparison
  - Status: N/A | ALIGNED | DIVERGES
  - Details: <if diverges, describe with file:line — what mobile does differently and whether it matters>

  ## LavaMoat Policy
  - Status: OK | NEEDS_UPDATE | N/A
  - Details: <explanation if needs update>

  ## Fix Quality
  - Best approach: yes | no — <if no, describe the better approach with file:line>
  - Would not ship: <items that should block, or "none">
  - Test quality: good | weak | insufficient — <rationale>
  - Brittleness: none | <concerns>

  ## Diff Quality
  - Minimal: yes | no — <unnecessary changes if any>
  - Debug code: none | <list>

  ## Recipe
  - Present: yes | no
  - Quality: good | weak | missing — <rationale>

  ## Visual Evidence
  - Status: OK | EMPTY | MISSING_FILES — <rationale>

  ## Issues
  - **file.ts:42** — description of the problem
  - **other.ts:10** — another issue

  (empty if verdict is PASS)
  ```

  **Verdict rules:**
  - `PASS` — no issues found.
  - `ISSUES` — any of: type errors in changed files, test failures, domain anti-pattern violations, logic bugs, missing test coverage for behavioral changes, LavaMoat policy inconsistencies, **or easy-fix nitpicks** (unused imports, missing testIDs, inconsistent naming, stale comments). If the worker can fix it in under 2 minutes, flag it — cheap quality wins add up.

- [ ] **14. Write SELF-REVIEW-SIGNAL.json and exit** — run: `echo '{"status":"complete","outcome":"success","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > temp/tasks/feat/tat-1043-0513-160437/SELF-REVIEW-SIGNAL.json`
  Then immediately: `/exit`
