# Acceptance Criteria

Source: PR body manual testing scenarios; linked ticket descriptions were empty.

1. Unified-account migration runs silently from Perps entrypoints for first-time/default-mode users, and HIP-3 markets/order flows work without missing collateral state.
2. DEX Abstraction users get a one-time EIP-712 prompt on Perps entry/action, signing enables unified-account collateral, and reopening Perps does not prompt again.
3. Unified Account users with $0 perps withdrawable balance and >$0 spot USDC see Perps Withdraw available balance from `availableToTradeBalance ?? availableBalance`; Max/submission use that value; valid withdraw succeeds through `withdraw3` and spot USDC decreases by amount plus fee.
4. With `confirmations_pay_post_quote` disabled or absent, tapping Withdraw opens `/perps/withdraw` and ARB USDC withdraw submits without a Transaction Pay “No quotes” blocker.
5. With `confirmations_pay_post_quote` explicitly enabling `perpsWithdraw`, tapping Withdraw uses confirmations-backed `perpsWithdraw`; Perps balance, source-network native fee, and no-quote blocking alerts still apply.
6. Direct ARB USDC deposit succeeds when the user has ARB USDC and gas; valid amounts do not show payment-route validation errors, Add funds submits, and wallet activity follows existing Perps deposit conventions.
