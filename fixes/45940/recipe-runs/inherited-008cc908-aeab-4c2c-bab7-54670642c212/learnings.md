# Learnings — TAT-3851

- **The ticket's "MMDS gap" premise was half wrong.** It claimed neither `SegmentedControl` nor
  `FilterButtonGroup` exists and told me to hand-style the toggle. `ButtonFilter` *does* exist in
  0.38.0 with an `isActive` prop that handles selected styling. Checking the package exports
  before trusting the ticket's technical notes saved a hand-rolled component.
- **`test/mocks/metamask-perps-controller.js` is a hand-maintained partial, not a passthrough.**
  `PERPS_EVENT_VALUE.SOURCE_SECTION` exists in the real package but was absent from the mock, so
  correct production code threw `Cannot read properties of undefined` only in tests. Any new perps
  analytics property needs a mock entry — worth generating this file from the package instead.
- **`perps-view.test.tsx` mocks the stream module as an explicit whitelist.** Adding a section
  that reads a stream hook the whitelist omits breaks all 44 existing cases with an opaque
  "is not a function" behind a React Router error boundary. The failure looks nothing like its
  cause.
- **`ui.wait_for … visible: true` really does mean on-screen.** The section was in the DOM with
  all eight pills but sat at y=542 in a 657px viewport, so the first recipe run timed out. A
  declared `ui.scroll … scroll_into_view` node before each visibility assertion fixed it — and the
  distinction is the point, since a DOM-presence assertion would have passed on invisible content.
- **The recipe intent validator rejects generic verbs.** "Capture the …" and "Wait until …" were
  both refused with `workflow.invalid_intent`; intents have to state the human-visible goal
  ("The Perps tab has finished loading, so the ranking reflects real market data"). Two rounds of
  rewording; worth phrasing intents that way from the start.
