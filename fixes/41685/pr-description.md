## **Description**

The "Reverse position" modal in perps trading hardcoded the fee as `—` and the submit button as "Save". This PR computes the estimated flip fee (`2 * size * price * feeRate`) to match mobile's logic and changes the button label to "Confirm".

## **Changelog**

CHANGELOG entry: Fixed reverse position modal to display computed flip fee and use "Confirm" button label

## **Related issues**

Fixes: [TAT-2830](https://consensyssoftware.atlassian.net/browse/TAT-2830)

## **Manual testing steps**

1. Navigate to a perps market detail page (e.g. ETH) with an open position
2. Click "Modify" > "Reverse position"
3. Verify the Fees row shows a dollar amount (e.g. `$0.22`), not `—`
4. Verify the submit button reads "Confirm", not "Save"

## **Screenshots/Recordings**

<!-- Evidence will be added by the gateway from evidence-manifest.json -->

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
