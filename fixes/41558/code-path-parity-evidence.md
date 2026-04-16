# Code-Path Parity Evidence

This note captures the strongest code-level evidence that the latest extension work is aligned with mobile on the key Perps display paths, independent of intermittent hydration / network issues.

## Order Entry

### Liquidation Price

- **Extension**
  - [usePerpsLiquidationPrice.ts](/Users/deeeed/dev/metamask/metamask-extension-3/ui/hooks/perps/usePerpsLiquidationPrice.ts)
  - [usePerpsOrderForm.ts](/Users/deeeed/dev/metamask/metamask-extension-3/ui/hooks/perps/usePerpsOrderForm.ts)
  - [perps-controller-init.ts](/Users/deeeed/dev/metamask/metamask-extension-3/app/scripts/messenger-client-init/perps-controller-init.ts)
- **Mobile**
  - [usePerpsLiquidationPrice.ts](/Users/deeeed/dev/metamask/metamask-mobile-1/app/components/UI/Perps/hooks/usePerpsLiquidationPrice.ts)
  - [PerpsOrderView.tsx](/Users/deeeed/dev/metamask/metamask-mobile-1/app/components/UI/Perps/Views/PerpsOrderView/PerpsOrderView.tsx)

Current parity conclusion:
- Extension and mobile both go through the controller/provider liquidation calculation path.
- Extension no longer relies only on the old local liquidation formula for the displayed order-entry value.

### Fees

- **Extension**
  - [usePerpsOrderFees.ts](/Users/deeeed/dev/metamask/metamask-extension-3/ui/hooks/perps/usePerpsOrderFees.ts)
- **Mobile**
  - [PerpsOrderView.tsx](/Users/deeeed/dev/metamask/metamask-mobile-1/app/components/UI/Perps/Views/PerpsOrderView/PerpsOrderView.tsx)

Current parity conclusion:
- Both sides use the controller/provider fee calculation path.
- Extension currently includes a bounded fallback when the fee RPC stalls, but the primary path is the same fee-calculation path mobile uses.

### Margin

- **Extension**
  - [usePerpsOrderForm.ts](/Users/deeeed/dev/metamask/metamask-extension-3/ui/hooks/perps/usePerpsOrderForm.ts)
- **Mobile**
  - [PerpsOrderView.tsx](/Users/deeeed/dev/metamask/metamask-mobile-1/app/components/UI/Perps/Views/PerpsOrderView/PerpsOrderView.tsx)

Current parity conclusion:
- Both sides compute margin from rounded position size × mark/oracle price, then `calculateMarginRequired`.
- This is materially closer than the earlier extension path and is reflected in the current same-window BTC / ETH evidence.

## Market Detail

### Price / Oracle Display

- **Extension**
  - [perps-market-detail-page.tsx](/Users/deeeed/dev/metamask/metamask-extension-3/ui/pages/perps/perps-market-detail-page.tsx)
- **Mobile**
  - [PerpsMarketStatisticsCard.tsx](/Users/deeeed/dev/metamask/metamask-mobile-1/app/components/UI/Perps/components/PerpsMarketStatisticsCard/PerpsMarketStatisticsCard.tsx)

Current parity conclusion:
- Both sides now use `markPrice` as the intended oracle/mark source for the market-detail oracle row.
- Remaining non-BTC/ETH oracle instability in extension is best treated as a separate hydration/network issue, not a formatter-path mismatch.

## Close / Remove Margin

### Close Summary

- **Extension**
  - [close-position-modal.tsx](/Users/deeeed/dev/metamask/metamask-extension-3/ui/components/app/perps/close-position/close-position-modal.tsx)
- **Mobile**
  - [PerpsCloseSummary.tsx](/Users/deeeed/dev/metamask/metamask-mobile-1/app/components/UI/Perps/components/PerpsCloseSummary/PerpsCloseSummary.tsx)

Current parity conclusion:
- Both sides use formatted fiat summary rows for margin / fees / receive.
- Small remaining numeric differences look closer to live-value drift or calculation-detail drift than formatter-path divergence.

### Remove Margin

- **Extension**
  - [edit-margin-modal-content.tsx](/Users/deeeed/dev/metamask/metamask-extension-3/ui/components/app/perps/edit-margin/edit-margin-modal-content.tsx)
- **Mobile**
  - [PerpsAdjustMarginView.tsx](/Users/deeeed/dev/metamask/metamask-mobile-1/app/components/UI/Perps/Views/PerpsAdjustMarginView/PerpsAdjustMarginView.tsx)

Current parity conclusion:
- Extension now matches mobile’s whole-percent liquidation-distance display shape.
- Available removable amount formatting was also aligned to mobile’s amount-only display.

## Strongest Current Evidence

- [verification-evidence-latest.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/verification-evidence-latest.md)
- [decimal-parity-matrix-expanded.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/decimal-parity-matrix-expanded.md)
- [drift-sources-report.md](/Users/deeeed/dev/metamask/metamask-extension-3/temp/.task/fix/41558-0415-1045/artifacts/drift-sources-report.md)

Current best reading:
- For the most important screens (`BTC` / `ETH` market + order), extension is now using meaningfully aligned code paths and the current same-window evidence shows those screens are very close to mobile.
