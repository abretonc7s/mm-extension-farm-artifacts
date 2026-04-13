## **Description**

The perps order entry page allowed submitting orders of any size regardless of available balance. Added a margin-vs-balance check: when `amount / leverage` exceeds `availableBalance`, the submit button is disabled and shows "Insufficient funds" — matching mobile's `usePerpsOrderValidation`.

## **Changelog**

CHANGELOG entry: Fixed a bug where perps order entry did not restrict order size above available margin

## **Related issues**

Fixes: [TAT-2893](https://consensyssoftware.atlassian.net/browse/TAT-2893)

## **Manual testing steps**

1. Navigate to perps order entry (e.g. ETH Long)
2. Enter a very large dollar amount (e.g. 999999999) that exceeds available balance
3. Verify the submit button is disabled and reads "Insufficient funds"
4. Change the amount to a small value (e.g. 1)
5. Verify the submit button is enabled and reads "Open Long ETH"

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
