# Mobile Comparison

Status: ALIGNED with caveats.

Relevant mobile files inspected:
- `/Users/deeeed/dev/metamask/metamask-mobile-ref/app/components/UI/Perps/Views/PerpsOrderView/PerpsOrderView.tsx`
- `/Users/deeeed/dev/metamask/metamask-mobile-ref/app/components/UI/Perps/Views/PerpsAdjustMarginView/PerpsAdjustMarginView.tsx`
- `/Users/deeeed/dev/metamask/metamask-mobile-ref/app/components/UI/Perps/Views/PerpsTPSLView/PerpsTPSLView.tsx`

Notes:
- Mobile computes minimum order constraints and disables amount interaction when max notional is below the minimum; extension now gates market submit under `$10` and displays min-order button copy.
- Mobile TP/SL and margin flows use imperative input refs/focus management; extension's `autoFocus` and select-on-focus changes are directionally aligned for web.
- No new formatting divergence beyond existing known `.toFixed(2)` usage in extension margin/amount paths. The PR did not introduce a new perps formatting pattern that mobile solves better.
- Mobile route/modal structure differs, so keyboard Tab order has no direct mobile equivalent.
