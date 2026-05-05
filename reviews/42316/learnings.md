# Learnings

- The injected recipe runtime depended on removed `@metamask/client-mcp-core` exports (`setSessionManager`, `buildToolHandlersRecord`, `setToolRegistry`, `setToolValidator`, `safeValidateToolInput`). The farm fixture was patched to install a CDP-backed compatibility handler for `mm_get_state`, `mm_wait_for`, `mm_click`, `mm_type`, `mm_screenshot`, `mm_navigate`, and `mm_switch_to_tab`.
- Recipe DSL nodes should remain semantic (`press`, `wait_for`, `screenshot`, `eval_ref`). The `mm_*` names are a compatibility boundary for existing preconditions and legacy MCP-shaped handlers, not recipe-authoring primitives.
- The runner normalizes hash routes without a leading slash. A recipe wait for `"/perps/withdraw"` times out even when the current route is `perps/withdraw`; use `"perps/withdraw"` in route assertions.
- Live CDP recipe validation passed after the runner fix: 11/11 nodes, clean issue collector, and screenshots for Perps tab plus standalone Withdraw page.
- Perps account state in Extension is provider-scoped under `cachedUserDataByProvider[provider].accountState`; tests that place it only at `metamask.accountState` can hide production selector bugs.
- Existing `selectPerpsCachedAccountState` is the local source of truth for cached account state and should be reused or mirrored for confirmation alerts.
- For unified-account balance logic, Extension already has `getTradeableBalance(account)` using `availableToTradeBalance ?? availableBalance`; new code should prefer that helper where the hook has live account state.
- Mobile withdraw still primarily reads `availableBalance`; this PR’s `availableToTradeBalance` fallback is an Extension-specific adjustment for the newer controller/unified-account behavior.
- The affected Jest suite is a good fast regression set for this PR: 14 suites completed with 150 passing tests.
- LavaMoat policy changes for this controller bump are narrow: new WebSocket event globals under `@nktkas/rews` and removal of the old `micro-eth-signer` subtree.
