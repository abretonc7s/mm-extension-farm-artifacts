# Learnings — TAT-3012

- Investigation was fast (~5 min) thanks to the mobile-extension map pointing directly to the mobile equivalent (`PerpsAdjustMarginView.tsx:180-187`). The mobile code showed the exact pattern needed (`formatLiquidationDistance` accepting `liquidationPrice` as second param).
- The recipe couldn't fully reproduce the bug because creating a position with liq price ≤ $0 requires extreme leverage not available in the fixture. Unit tests were the right approach for the edge case.
- The recipe runner uses `press` action (not `click`), and nodes must be an object (not array). Both wasted a few minutes.
- The `no-eq-null` ESLint rule caught `!= null` — need to use explicit `!== null && !== undefined` checks.
- The `ext_navigate_hash` action has a double-hash issue when current URL already has a hash — prefer `call perps/navigate-to-market-detail` flow instead.
