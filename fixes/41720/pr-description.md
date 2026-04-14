## **Description**

The position card in the Perps tab was showing only the USD P&L value without the ROE% percentage alongside it. The fix adds `returnOnEquity` display to `PositionCard`, rendering both values together (e.g., `+$0.88 (26.30%)`). This was resolved in PR #41696 as part of related perps ROE work.

## **Changelog**

CHANGELOG entry: Fixed a bug where the position card in the Perps tab was not showing the ROE% percentage alongside the USD P&L value.

## **Related issues**

Fixes: [TAT-2794](https://consensyssoftware.atlassian.net/browse/TAT-2794)

## **Manual testing steps**

1. Unlock the wallet and navigate to the Perps tab
2. Ensure at least one open position exists
3. Observe the position card — confirm it shows both the USD P&L (e.g., `+$0.88`) and ROE% (e.g., `(26.30%)`) side by side

## **Screenshots/Recordings**

<!-- Gateway will replace this section with evidence from evidence-manifest.json -->

### **Before**

<!-- [screenshots/recordings] -->

### **After**

<!-- [screenshots/recordings] -->

## **Pre-merge author checklist**

- [x] I've followed [MetaMask Contributor Docs](https://github.com/MetaMask/contributor-docs) and [MetaMask Extension Coding Standards](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/CODING_GUIDELINES.md).
- [x] I've completed the PR template to the best of my ability
- [x] I've included tests if applicable
- [x] I've documented my code using [JSDoc](https://jsdoc.app/) format if applicable
- [x] I've applied the right labels on the PR (see [labeling guidelines](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/LABELING_GUIDELINES.md)). Not required for external contributors.

## **Pre-merge reviewer checklist**

- [ ] I've manually tested the PR (e.g. pull and build branch, run the app, test code being changed).
- [ ] I confirm that this PR addresses all acceptance criteria described in the ticket it closes and includes the necessary testing evidence such as recordings and or screenshots.
