# Fix Quality

- Best approach: The PR moves pending deposit state into selectors derived from `TransactionController` state and scopes it to `lastDepositTransactionId`. That is the pragmatic minimal fix because the stale `depositInProgress` flag does not cover the post-confirm/pre-settlement window.
- Long-term approach: A shared global toast owner for all Perps funding flows would be cleaner, but the PR body explicitly calls that out as a follow-up because native Perps deposit flows are not fully supported there today.
- Would ship: Yes. I did not find a correctness issue that should block merge.
- Test quality: The selector and component tests cover active transaction scoping, pending statuses, non-pending statuses, native-token ownership, token-funded suppression, completion priority, stale transactions, and generic toast exclusion for Perps transaction types. These tests would fail if the main selector changes were reverted.
- Brittleness: No import-time constants or mock coupling concerns found. `getNativeTokenAddress` is evaluated per selector call using the transaction's payment token chain ID, so token ownership is not frozen at module load.
- Remaining gap: Browser recipe cannot safely execute a real Perps deposit/order transaction in this slot; live validation used controlled Redux transaction-state variants plus DOM assertions instead.
