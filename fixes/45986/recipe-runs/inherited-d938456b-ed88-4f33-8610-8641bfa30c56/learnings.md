# Reviewer-driven learnings — PR #45986 (TAT-3853)

What geositta's `CHANGES_REQUESTED` review caught that the original fix-bug worker missed.
All five are analytics/state-correctness classes, not style.

- **Default-value laundering hides "unknown" as a real value**: reviewer caught that
  `getTradeableBalance`'s `?? '0'` makes an absent balance field indistinguishable from a
  genuine zero, so enabling the CTA on that branch prompts a *funded* trader to deposit.
  When a fix converts a previously inert condition into an actionable one, fix-bug should
  first enumerate every state that reaches it and check that a defaulted value isn't
  masquerading as a measured one — add a raw accessor rather than widening the caller.

- **A funnel flag must encode the event, not the intent**: reviewer traced that a
  session flag written on *click* emits `trade_submitted_after_deposit` for a deposit that
  was abandoned, on a different account. Funnel state should be keyed to the subject
  (address) and advanced only by the confirming event, with explicit clears on the
  failure and abandonment paths — fix-bug wrote the optimistic path only.

- **Analytics emitted from a presentation effect double-counts**: reviewer spotted that
  an emit inside a toast effect whose deps include `t`/`entryPoint` re-fires when those
  change and replays on remount. Any event emitted from an effect needs a fire-once guard
  keyed on the subject's identity (here the transaction id), not on the rendering state.

- **Conditionally omitting a property silently breaks the downstream join**: reviewer
  noted that spreading `{}` for the funded case makes "funded" and "older client" the same
  row downstream. Boolean event properties should always be emitted; fix-bug used a
  conditional spread that read as tidy but destroyed the distinction the metric needs.

- **Two components deriving the same predicate will disagree**: reviewer found the page's
  `hasNoAvailableBalance` (order-mode and unknown-value aware) diverging from the child's
  raw threshold check, producing a visible CTA the page then tracked as funded. When a
  parent already owns a derived predicate, pass it down rather than re-deriving — and
  treat the same condition appearing in three places as the signal that it has one owner.
