## **Description**

The market list's category filter was a dropdown: to switch category you opened a menu, read the
options and picked one. This replaces it with a rail of pills, so every category is a single click
and the active one is visible without opening anything.

All categories are on the rail at once. It does not scroll horizontally and nothing moves into an
overflow menu — when the window is too narrow for one line the pills wrap onto the next. Both of
those patterns hide items behind an interaction a mouse user cannot see coming and a keyboard user
cannot Tab through, which is the objection raised in review. Wrapping spends vertical space instead.

The pills live on the market list only; the Perps tab is unchanged and is left free for the separate
Products design. Watchlist moved to a header star toggle (it is user state, not a market category),
search is behind a header icon so the categories and markets sit higher on a short popup, and a
market count label sits beside the sort control.

The active pill is also the control that clears the filter: pressing it returns the list to every
market. A category stays on the rail while it is active even if the live data stops offering it, so
a stale `?filter=new` link can never leave the list narrowed with nothing to clear.

The design system still ships no `ButtonFilterGroup` for web — checked the installed 0.35.1 and the
latest published 0.38.0 of `@metamask/design-system-react`, neither exports a group primitive — so
the rail is composed from `ButtonFilter` inside a `role="group"`. Worth raising with the
design-systems team.

## **Changelog**

CHANGELOG entry: Replaced the Perps market list category dropdown with a rail of category pills

## **Related issues**

Fixes: [TAT-3848](https://consensyssoftware.atlassian.net/browse/TAT-3848)

## **Manual testing steps**

1. Open the wallet, go to the Perps tab and confirm there is **no** category rail — balance actions
   run straight into Top movers.
2. Open the full market list. Confirm a row of category pills renders under the header: Crypto,
   Stocks, Pre-IPO, Index, ETF, Commodities, Forex.
3. Narrow the window until the pills no longer fit one line. Confirm they **wrap** onto a second
   line and that no `More` control appears — every category stays visible.
4. Click `Crypto`. The list narrows in place, the pill reads as pressed and grows a clear icon.
5. Click `Crypto` again. The filter clears and the list returns to every market.
6. Tab through the rail. Every pill takes focus in order and Enter activates it.
7. Open `#/perps/market-list?filter=new` on a wallet with no uncategorized HIP-3 markets. Confirm a
   pressed `New` pill is present and that clicking it returns the list to every market.

## **Screenshots/Recordings**

<!-- Attach, in this order:
     1. evidence-perps-home-without-category-rail.png
        — Perps tab: no category rail
     2. evidence-market-list-all-pills-crypto-active.png
        — Market list: all seven pills on screen, Crypto active and clearable
     The previous recording showed the earlier scrolling-rail-on-home design and should be removed. -->

## **Pre-merge author checklist**

- [x] I've followed [MetaMask Contributor Docs](https://github.com/MetaMask/contributor-docs) and [MetaMask Extension Coding Standards](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/CODING_GUIDELINES.md).
- [x] I've completed the PR template to the best of my ability
- [x] I’ve included tests if applicable
- [x] I’ve documented my code using [JSDoc](https://jsdoc.app/) format if applicable
- [x] I’ve applied the right labels on the PR (see [labeling guidelines](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/LABELING_GUIDELINES.md)). Not required for external contributors.

## **Pre-merge reviewer checklist**

- [ ] I've manually tested the PR (e.g. pull and build branch, run the app, test code being changed).
- [ ] I confirm that this PR addresses all acceptance criteria described in the ticket it closes and includes the necessary testing evidence such as recordings and or screenshots.

[TAT-3848]: https://consensyssoftware.atlassian.net/browse/TAT-3848
