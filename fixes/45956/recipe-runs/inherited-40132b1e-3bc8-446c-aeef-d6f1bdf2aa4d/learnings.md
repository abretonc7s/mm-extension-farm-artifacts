# Learnings — TAT-3848

- **`ui.wait_for expected: visible` really means in-viewport.** The first recipe run failed on
  `ac1-wait-category-rail` even though the rail was in the DOM — it sat below Top movers, off
  screen. That failure was useful twice: it was the empirical "would a revert fail this recipe?"
  check, and it exposed that a discovery rail buried under three sections is a weak feature. Moving
  it under the balance actions fixed both. Add the `ui.scroll` + `scroll_into_view` node before any
  visual assertion on a section that is not in the first screenful.

- **The extension serves from a `runtime-dist` snapshot, not from webpack's live `dist`.** Webpack
  rebuilding on save is not enough — every source edit needs a `mm-harness launch --verify` before
  the recipe sees it. Two of the three relaunches this run existed only because of this; one
  relaunch also failed mid-`rsync` ("move_file: 7727.js: No such file") because the snapshot raced
  a rebuild, and simply re-running it succeeded.

- **`--profile fast` skips typecheck, and that is exactly where this change was going to break.**
  The fast gate was green while `marketMatchesCategory(market, category)` had a genuinely wrong
  parameter type: the controller exports `MarketCategory` as a TypeScript *enum*, not a string
  union, so the `MARKET_CATEGORIES` tuple element type was not assignable to it. `MarketType`
  (`\`${MarketCategory}\``) is the string-literal union. When a change turns on union narrowing
  through a `switch` default, run `--profile full` before believing the gate.

- **`yarn verify-locales` requires `en_GB` to be byte-identical to `en`.** A new key in
  `app/_locales/en/messages.json` alone fails the gate. The changed-file lint gate does not catch
  this — it has to be run separately.

- **Jest as recipe evidence needs two guards, not one.** `jest -t "<title>"` exits 0 when the title
  filter matches nothing, so `assert_exit_code: 0` alone is vacuous. Every jest-backed AC node here
  pairs it with `assert_output contains "1 passed"`. Also worth knowing: recipe `intent` strings are
  validated — "Wait until the Perps tab loads" was rejected as restating the action; it has to say
  what the human-visible goal is.
