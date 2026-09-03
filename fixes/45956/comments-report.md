# Comments report — PR 45956

## Context reload

Inherited context: family `40132b1e-3bc8-446c-aeef-d6f1bdf2aa4d` (TAT-3848).

Original family scope: add market category pills to Extension's Perps tab for direct category filtering.

Current trigger: pr-complete for `feat(perps): add market category pills to the Perps tab`.

Trusted recipe: family-inherited, already at `artifacts/recipe.json`. Recipe library is missing (not required to run).

Parent run landed the rail under the balance actions, 22+ tests, and a 25-node recipe that proved AC1–AC4. Recipe quality verdict was PASS. The inherited recipe still hardcodes `cdp_port: 7665` from the original slot; this slot uses `6663`. CLI `--cdp-port 6663` is the live override.

HEAD: `1917a67733` (`fix: address self-review feedback (TAT-3848)`), matches origin. CI on the PR is green.

`.prettierignore` is assume-unchanged in this worktree (`H` in `git ls-files -v`). No content diff. Left untouched.

## Live fetch (step 5)

- Inline review comments: 0
- Issue comments from humans: 0
- Issue comments from bots: 4 (CLA, codeowners, sonar, CI builds)
- Reviews: 1 `CHANGES_REQUESTED` from `geositta` (id 5096562114)

The preview dump that called all comments bot-noise missed this review because it is a review body, not an issue comment.

## Comment triage

| ID | Author | Kind | Classification | Action |
|---|---|---|---|---|
| 5096562114 | geositta | review, CHANGES_REQUESTED | OUT_OF_SCOPE | No product edit. Operator should reply on GitHub. |
| 5505277576 | github-actions[bot] | issue | OUT_OF_SCOPE | CLA bot. Ignore. |
| 5505278993 | metamask-ci[bot] | issue | OUT_OF_SCOPE | Codeowners ping. Ignore. |
| 5505411734 | sonarqubecloud[bot] | issue | OUT_OF_SCOPE | Quality gate passed. Ignore. |
| 5505478899 | metamask-ci[bot] | issue | OUT_OF_SCOPE | Builds-ready notice. Ignore. |

### geositta — review 5096562114 — OUT_OF_SCOPE

Request: drop horizontal overflow. Mobile-style swipe rails are a poor web pattern for mouse, keyboard, and low-vision users. Points at a Slack thread where Nikki intends a design that does not require overflow, and at TAT-3854 / Figma.

Why this is not a REAL code fix on this PR:

1. TAT-3848 AC 1 is explicit: "a horizontally-scrollable row of category pills". Shipping wrap, a "see more" menu, or a dropdown would fail the ticket this PR claims to close.
2. The replacement design is not in this ticket. TAT-3854 is a different surface (market-list filter, not the Perps tab). It is still To Do, assigned to Nikki Pham. Its written AC also still says "horizontally-scrollable pill row". The "first 3 categories + see more" note in that ticket is a design intent, not a shipped spec.
3. The current rail is native `ButtonFilter` buttons in a labelled `role="group"`. Tab reaches them, Enter navigates. That is the keyboard contract TAT-3848 asked for. Overflow scrolling is CSS `overflow-x-auto`; a focused pill is scrolled into view by the browser. There is no extra `tabIndex` trap on the scroller.
4. Live data currently yields four pills (All, Crypto, Stocks, Commodities). On the popup they often fit without overflowing. The review is about the pattern, not a reproduced overflow failure.

This review is a product/design hold, not a regression in the shipped code. Changing the rail here would expand family scope into TAT-3854 and contradict TAT-3848.

REAL issues to code: none.

## Validation this run

Recipe re-run on CDP 6663: pass, 25/25. AC1 screenshot shows All / Crypto / Stocks / Commodities / Forex on the Perps tab. AC2 screenshot shows the market list with Crypto already selected. Both captures are `capture-helper`, not the DOM fallback.

Live data currently yields five pills. On the fullscreen harness window they fit without overflowing. geositta's concern is still about the pattern (and popup width), not a missing rail.

## Suggested GitHub reply (do not post unless the operator asks)

```text
Thanks — the overflow concern is real for web, and I don't want to pretend the mobile rail maps 1:1.

This PR is TAT-3848, whose AC still requires a horizontally-scrollable ButtonFilter row on the Perps tab. The "first 3 + see more, no overflow" direction lives on TAT-3854 (market-list, still To Do, Nikki's design). That ticket's written AC also still says horizontally-scrollable pills, so there isn't a replacement spec I can implement here without inventing UI.

What this PR does ship: native ButtonFilter pills, Tab/Enter activation, role="group" + aria-label. Live data currently shows All / Crypto / Stocks / Commodities, which usually fits the popup without scrolling.

Two ways to go:
1. Land TAT-3848 as specified, follow up overflow/see-more on TAT-3854 once the Figma is current.
2. Close or pause this PR until the no-overflow design is ready, and rewrite TAT-3848's AC.

I will not redesign this rail in this PR without that call.
```
