## **Description**

Prevents the perps order-entry screen from showing an enabled trade CTA when the account has no available perps funds. New orders now surface a disabled `Add funds` CTA instead of leaving the user on an enabled `Open Long/Short` action that cannot complete successfully.

## **Changelog**

CHANGELOG entry: Fixed a bug where zero-balance perps order entry showed an enabled trade CTA instead of prompting users to add funds

## **Related issues**

Fixes: [TAT-2831](https://consensyssoftware.atlassian.net/browse/TAT-2831)

## **Manual testing steps**

1. Open the extension, unlock the wallet, and navigate to a perps market order-entry screen such as `/perps/trade/BTC?direction=long&mode=new`.
2. Ensure the perps account state has zero available balance.
3. Confirm the primary CTA is disabled and reads `Add funds` instead of showing an enabled `Open Long/Short` action.

## **Screenshots/Recordings**

Evidence will be attached from the generated task artifacts.

### **Before**

<!-- populated from uploaded artifacts -->

### **After**

<!-- populated from uploaded artifacts -->

## **Pre-merge author checklist**

- [x] I've followed [MetaMask Contributor Docs](https://github.com/MetaMask/contributor-docs) and [MetaMask Extension Coding Standards](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/CODING_GUIDELINES.md).
- [x] I've completed the PR template to the best of my ability
- [x] I’ve included tests if applicable
- [x] I’ve documented my code using [JSDoc](https://jsdoc.app/) format if applicable
- [x] I’ve applied the right labels on the PR (see [labeling guidelines](https://github.com/MetaMask/metamask-extension/blob/main/.github/guidelines/LABELING_GUIDELINES.md)). Not required for external contributors.

## **Pre-merge reviewer checklist**

- [ ] I've manually tested the PR (e.g. pull and build branch, run the app, test code being changed).
- [ ] I confirm that this PR addresses all acceptance criteria described in the ticket it closes and includes the necessary testing evidence such as recordings and or screenshots.
