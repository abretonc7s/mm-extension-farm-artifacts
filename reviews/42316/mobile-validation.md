# Mobile Validation

Validated against the intended Mobile source PRs, not the stale local Mobile branch.

## Sources

- `MetaMask/metamask-mobile#29537` — merged `2026-04-30`, "fix: Withdrawal broken for Hyperliquid Unified Account Mode users"
- `MetaMask/metamask-mobile#29492` — merged `2026-05-01`, "feat(perps): force unified account"

## Findings

- Mobile PR #29537 fixed Unified Account withdraw by using `availableToTradeBalance ?? availableBalance` across the withdrawal stack.
- Mobile PR #29492 folded #29537 into the larger Unified Account migration refactor.
- The Mobile refactor includes more than UI changes:
  - mode-gated spot folding in `accountUtils.addSpotBalanceToAccountState`
  - subscription cache/mode handling through `setUserAbstractionMode`
  - provider `withdraw()` validation against `availableToTradeBalance ?? availableBalance`
  - withdraw screen, validation hook, confirmation alert, and percentage button alignment
- Extension's committed `@metamask/perps-controller@5.0.0` package archive already contains these backend/provider pieces.
- The failing local browser was built from stale ignored dependency output. Before `yarn install`, local `node_modules` and `dist/chrome/common-7.js` still validated submit against `accountState.availableBalance` only.
- After `yarn install`, local `node_modules` and rebuilt `dist/chrome/common-7.js` match Mobile.

## Conclusion

Extension should keep `availableToTradeBalance ?? availableBalance` for unified-account withdraw surfaces. The fix is not to revert UI to `availableBalance`; the fix is to ensure the browser is built from the refreshed `@metamask/perps-controller@5.0.0` package so the submit path has the same fallback.
