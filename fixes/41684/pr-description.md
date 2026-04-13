## **Description**

The Reverse Position modal displayed a hardcoded em-dash for the fee value and used "Save" as the submit button label. This calculates the flip fee as `2 × size × price × feeRate` (matching mobile and the close-position modal) and changes the button text to "Confirm".

## **Changelog**

CHANGELOG entry: Fixed reverse position modal to display calculated flip fee and use "Confirm" button label

## **Related issues**

Fixes: [TAT-2830](https://consensyssoftware.atlassian.net/browse/TAT-2830)

## **Manual testing steps**

1. Open perps tab, navigate to a market with an open position (e.g. ETH)
2. Click Modify → Reverse Position
3. Verify the Fees row shows a calculated dollar value (not an em-dash)
4. Verify the submit button says "Confirm" (not "Save")

## **Screenshots/Recordings**

### **Before**

<!-- Screenshots will be added by the gateway -->

### **After**

<!-- Screenshots will be added by the gateway -->

## **Pre-merge author checklist**

- [x] I've followed [MetaMask Contributor Docs](https://github.com/MetaMask/contributor-docs) and [MetaMask Extension Coding Standards](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/CODING_GUIDELINES.md).
- [x] I've completed the PR template to the best of my ability
- [x] I've included tests if applicable
- [x] I've documented my code using [JSDoc](https://jsdoc.app/) format if applicable
- [x] I've applied the right labels on the PR (see [labeling guidelines](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/LABELING_GUIDELINES.md)). Not required for external contributors.

## **Pre-merge reviewer checklist**

- [ ] I've manually tested the PR (e.g. pull and build branch, run the app, test code being changed).
- [ ] I confirm that this PR addresses all acceptance criteria described in the ticket it closes and includes the necessary testing evidence such as recordings and or screenshots.
