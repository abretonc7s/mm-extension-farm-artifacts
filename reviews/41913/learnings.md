# Learnings

- `validate-recipe.js` resolves eval refs by bare key names (`accounts`, `perps-state`, `perps-balance`) in this slot; domain-prefixed refs failed for direct recipe execution.
- Recipe screenshots were written under `artifacts/screenshots/`, so review tasks that expect `artifacts/evidence/evidence-ac*.png` need an explicit copy step.
- The live recipe can safely validate Perps toast rendering by saving the current Redux deposit/transaction slices, dispatching controlled `UPDATE_METAMASK_STATE` variants, and restoring the original state in teardown.
- `PerpsDepositToast` is mounted on the home and Perps routes through `ToastMaster`, so fullscreen `home.html` is sufficient for deposit-toast DOM validation.
- Browser validation can prove native/token-funded deposit toast ownership, but it should not submit a real Perps order just to verify order-toast suppression.
- Mobile tracks deposit progress from transaction status updates and live balance/result changes; extension now mirrors the post-confirm ownership model, with an intentional pay-token ownership divergence.
- The affected selector tests are a useful complement to recipe coverage because runtime recipes cannot easily import UI selectors such as `selectEvmTransactionsForToast`.
- `browser.pid` was missing in this slot, so video recording was skipped even though CDP and screenshots were available.
