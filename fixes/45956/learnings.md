# Learnings — PR 45956 (TAT-3848 / TAT-3854)

- **`yarn lint:changed` does not cover JSON, so locale edits go unchecked.** CI's `yarn lint` runs
  Prettier across the repo and failed on key ordering in `app/_locales/en` and `en_GB` after I edited
  them with a Python script. The changed-file gate passed the whole time. Any task touching
  `messages.json` needs `npx prettier --check` (or `--write`) on those files before pushing — the
  documented gate will not catch it.

- **`IconName` can carry a name that has no renderable icon, and `Icon` fails silently.** MMDS `Icon`
  logs `Icon name is required` and returns `null` when the name resolves to `undefined`. Locally
  `IconName.Clear` and `IconName.Arrow2Down` both resolved at the pinned versions (`design-system-react`
  0.38.1 / `design-system-shared` 0.34.0); on the install CI resolves they did not, so the active pill
  shipped **without its clear control** and only a unit test caught it. Prefer long-standing names
  (`CircleX`, `ArrowDown`), and assert that a glyph actually renders rather than only asserting its
  colour — a colour assertion on a missing element reports a confusing length mismatch instead.

- **`ButtonFilter`'s active state does not reach an `Icon` child.** It sets `bg-icon-default` plus
  `text-icon-inverse` on the button, but an `Icon` defaults to `icon-default` — which on the active
  fill is the fill colour, so the glyph is invisible. Pass `IconColor.IconInverse` explicitly when
  active. Same trap applies to a `Dropdown` trigger styled as active.

- **Do not run two `mm-harness run` invocations at once.** Backgrounding a run and starting the next
  before it finishes gives `No extension page target found on CDP port 6663`, `Click target readiness
  timed out`, and a sandbox-lock error naming "the current owner". It looks like runtime instability
  and is not. Run recipes serially; if state looks wrong, `mm-harness stop` then one `launch --verify`.

- **Counting Chrome processes by `--remote-debugging-port` overcounts.** Renderer/helper processes
  inherit the parent's command line, so one browser looks like five. Filter out `--type=` or check
  `lsof -iTCP:<port> -sTCP:LISTEN` before concluding that instances are leaking.

- **Compare live wallet data against the network the wallet is actually on.** A testnet wallet
  (`store.getState().metamask.isTestnet`) was diffed against the *mainnet* Hyperliquid API, which made
  correct data look corrupted and produced a confident but wrong Core bug report. On HL testnet 68 of
  70 HIP-3 markets have zero 24h volume, and `hasVolume` in `usePerpsLiveMarketData` filters them out,
  so whole categories look empty. `perpsToggleTestnet` plus `streamManager.markets.refresh()` moves the
  slot to mainnet (70 → 119 `xyz` markets; Stocks 1 → 44).

- **Figma MCP could not enumerate this file's pages** — `get_metadata` with no `nodeId` returned only
  `📔 Cover`, so designs were only reachable via node ids supplied by the operator. Ask for a node link
  rather than concluding a frame does not exist; two of my "not in Figma" claims were wrong that way.

- **Read the design before implementing, and re-read when a directive contradicts it.** Two operator
  directives (drop the overflow, remove the rail from Perps home) were later overturned by
  `13192:28387` and `12602:45702`, costing a full implement-revert-reimplement cycle. The design gives
  the two surfaces deliberately different layouts: the tab wraps, the market list overflows into
  `More`.

- **`mms-recipe-evidence` gotchas.** Its packager sweeps **every** `recipe-run*` directory under
  `artifacts/`, including archived failures — it published a screenshot of a reverted design until the
  superseded runs were moved out of the task dir. It also regenerates `pr-desc.md` as a placeholder
  each time, so a hand-written description must be re-merged before every upload; an upload run after
  a failed merge step will happily push "This PR addresses the linked task" over a good body.

- **Verify assertions about text that wraps.** Grepping the live PR body for a phrase that spans a
  newline reported it missing when it was present, which sent me re-uploading unnecessarily. Normalise
  whitespace before asserting.

- **Framework tooling bugs found (not patched, surfaced here).**
  `mms-recipe-evidence/scripts/repository-policy.js:57` rejects an SSH alias remote that resolves to
  github.com (`git@github.com-abretonc7s:...`); `package-pr-evidence.js:238` resolves
  `../../recipe-cook/scripts/resolve-harness` while the skill installs as `mms-recipe-cook`. Both were
  worked around temporarily (origin retargeted and restored, symlink created and removed) rather than
  patched into the repo.
