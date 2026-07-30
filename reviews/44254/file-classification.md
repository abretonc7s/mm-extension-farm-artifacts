# Changed-file classification — PR #44254 (34 files, +4789/-151)

| File | Category | Live-testable? |
|------|----------|----------------|
| `app/_locales/en/messages.json` | Config/i18n | No — structural check |
| `app/_locales/en_GB/messages.json` | Config/i18n | No — structural check |
| `app/scripts/controllers/perps/perps-stream-bridge.ts` | Controller/background | Yes — service worker eval |
| `app/scripts/controllers/perps/perps-stream-bridge.test.ts` | Test file | No — run jest |
| `app/scripts/metamask-controller.js` | Controller/background | Yes — service worker eval |
| `shared/lib/perps-formatters.ts` | Shared | Partial — eval if imported by active code |
| `test/e2e/feature-flags/feature-flag-registry.ts` | Test config | No |
| `test/e2e/tests/settings/state-logs.json` | Test fixture | No |
| `test/mocks/metamask-perps-controller.js` | Test mock | No |
| `ui/components/app/perps/order-book/index.ts` | UI component (barrel) | No |
| `ui/components/app/perps/order-book/order-book.tsx` | UI component | Yes — recipe navigate + screenshot |
| `ui/components/app/perps/order-book/order-book-config-modal.tsx` | UI component | Yes — recipe navigate + screenshot |
| `ui/components/app/perps/order-book/order-book-skeleton.tsx` | UI component | Yes — transient, hard to catch |
| `ui/components/app/perps/order-book/order-book.types.ts` | Config/types | No |
| `ui/components/app/perps/order-book/order-book.utils.ts` | Shared util | Partial — unit tests are primary proof |
| `ui/components/app/perps/order-book/order-book.test.tsx` | Test file | No — run jest |
| `ui/components/app/perps/order-book/order-book.utils.test.ts` | Test file | No — run jest |
| `ui/components/app/perps/order-entry/components/order-entry-header/order-entry-header.tsx` | UI component | Yes — recipe navigate + screenshot |
| `ui/components/app/perps/order-entry/order-entry.tsx` | UI component | Yes |
| `ui/components/app/perps/order-entry/order-entry.types.ts` | Config/types | No |
| `ui/components/app/perps/utils/translate-perps-error.ts` | Shared util | Partial |
| `ui/hooks/perps/stream/usePerpsLiveOrderBook.ts` | UI hook | Yes — via UI |
| `ui/hooks/perps/stream/usePerpsLiveOrderBook.test.ts` | Test file | No — run jest |
| `ui/hooks/perps/stream/usePerpsChannel.test.tsx` | Test file | No — run jest |
| `ui/hooks/perps/usePerpsOrderForm.ts` | UI hook | Yes — via UI |
| `ui/hooks/perps/usePerpsOrderForm.test.ts` | Test file | No — run jest |
| `ui/hooks/perps/usePerpsEstimatedSlippage.test.ts` | Test file | No — run jest |
| `ui/pages/perps/perps-order-entry-page.tsx` | UI page | Yes — recipe navigate + screenshot |
| `ui/pages/perps/perps-order-entry-page.test.tsx` | Test file | No — run jest |
| `ui/providers/perps/PerpsStreamManager.ts` | UI provider (stream) | Yes — `window.getPerpsStreamManager()` eval |
| `ui/providers/perps/PerpsStreamManager.test.ts` | Test file | No — run jest |
| `ui/providers/perps/index.ts` | Barrel | No |
| `ui/selectors/perps/feature-flags.ts` | Selector | Yes — store eval |
| `ui/selectors/perps/feature-flags.test.ts` | Test file | No — run jest |

**Summary:** 13 test/mock/fixture files, 8 UI components/pages, 3 hooks, 2 background/controller, 2 providers,
2 i18n, 1 selector, 3 shared/types/barrel.

**No `lavamoat/**` or `package.json` changes in this diff** — the `@metamask/perps-controller` v10 bump
referenced in the PR body landed separately on `main` (commit `48ad866df4`) and is already in the merge base.
