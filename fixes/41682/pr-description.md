## **Description**

The "Reverse position" modal in perps displayed an em-dash (`—`) for the Fees row instead of the actual estimated fee. The submit button also read "Save" instead of "Confirm". This PR calculates the flip fee as `2 × position size × current price × taker fee rate` (matching the close-position pattern) and changes the button label to "Confirm".

## **Changelog**

CHANGELOG entry: Fixed reverse position modal to display estimated flip fee and use "Confirm" button label

## **Related issues**

Fixes: [TAT-2830](https://consensyssoftware.atlassian.net/browse/TAT-2830)

## **Manual testing steps**

1. Navigate to the Perps tab and open a market with an existing position (e.g. ETH)
2. Click the "Modify" dropdown on the position CTAs
3. Select "Reverse position"
4. Verify the Fees row shows a calculated fee (e.g. `-<$0.01`) instead of `—`
5. Verify the submit button reads "Confirm" instead of "Save"

## **Screenshots/Recordings**

### **Before**

_Evidence available in task artifacts — will be added by reviewer if needed._

### **After**

_Evidence available in task artifacts — will be added by reviewer if needed._

## **Pre-merge author checklist**

- [x] I've followed [MetaMask Contributor Docs](https://github.com/MetaMask/contributor-docs) and [MetaMask Extension Coding Standards](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/CODING_GUIDELINES.md).
- [x] I've completed the PR template to the best of my ability
- [x] I've included tests if applicable
- [x] I've documented my code using [JSDoc](https://jsdoc.app/) format if applicable
- [x] I've applied the right labels on the PR (see [labeling guidelines](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/LABELING_GUIDELINES.md)). Not required for external contributors.

## **Pre-merge reviewer checklist**

- [ ] I've manually tested the PR (e.g. pull and build branch, run the app, test code being changed).
- [ ] I confirm that this PR addresses all acceptance criteria described in the ticket it closes and includes the necessary testing evidence such as recordings and or screenshots.
