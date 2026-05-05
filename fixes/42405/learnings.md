# Learnings — TAT-3094

- Investigation was quick (~5 min) once I found `perps-mobile-extension-map.md` pointing to the exact files with hardcoded formatting. The map doc is highly valuable.
- The bug was a subtle semantic issue: order card showed notional (size × price) for limit orders instead of the limit price itself. This isn't just a formatting fix — it changes what value is displayed.
- No open orders in the fixture made visual reproduction impossible. Unit tests were the right proof mechanism for a formatting logic change.
- The `PRICE_RANGES_UNIVERSAL` config already existed and was correct — the fix was simply using it consistently across all order types.
