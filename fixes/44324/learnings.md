# Learnings — update-branch PR #44324

- **The configured `rebase` strategy was not viable and I used `merge` instead.** The
  branch was 39 commits ahead / 330 behind, and `git rebase origin/main` conflicted on
  the *first* replayed commit across 6 files — comparable conflicts would have repeated
  across all 37 non-merge commits, each resolved against a different intermediate tree.
  The branch also already contained two main-merge commits, so it was never linear.
  A merge resolved the same divergence in one auditable pass. Rationale and the safety
  ref (`backup/pre-rebase-44324`) are recorded in `report.md`.

- **The dangerous conflicts were the ones git did *not* report.** Each side had deleted
  helpers the other still used (`getDisplayName` deleted by main; `deriveTpslType` and
  `buildPerpsVipTrackingData` deleted by the branch), and those deletions auto-merged
  silently. Taking the obvious "union of both import lists" on the *reported* conflicts
  produced imports of symbols that no longer existed. Checking real usage in the merged
  bodies — not just the conflict hunks — was what caught it.

- **Main re-added client-side analytics the PR exists to remove.** Three hunks in
  `close-position-modal.tsx` were main emitting `PerpsPositionCloseTransaction`
  client-side. Since the whole point of the PR is that the controller owns those events
  (documented on the branch: "Emitting it client-side would double-count"), the branch
  side won. This is the resolution most worth a human eye — it is a behavioural choice,
  not a textual one.

- **Not every constant main added was actually new.** In `perps-events.ts` main added
  five entries; four (`LIMIT_PRICE`, `FEES`, `PNL_DOLLAR`, `RECEIVED_AMOUNT`) were
  already supplied by the controller spread with identical string values, but
  `SOURCE.BOTTOM_NAV_BAR` was not in the controller contract and had live consumers.
  Verifying each against `@metamask/perps-controller`'s `.d.cts` was the difference
  between a clean merge and a compile break.

- **`yarn lint` here includes full `tsc`**, so the green gate independently confirmed the
  import surgery. Worth knowing: it is a much stronger signal than `lint:changed`.
  Separately, all 133 prettier "code style" warnings were framework-injected paths
  (`.omx/`, `.omc/`, `temp/`) — surfaced, not silenced, per the agent rules.
