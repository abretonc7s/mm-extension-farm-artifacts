# Changed File Classification

| File | Category | Live-testable? |
|---|---|---|
| `app/_locales/en/messages.json` | Config/types (locale strings) | No |
| `app/_locales/en_GB/messages.json` | Config/types (locale strings) | No |
| `ui/components/app/perps/perps-deposit-toast.test.tsx` | Test file | No - run jest |
| `ui/components/app/perps/perps-deposit-toast.tsx` | UI component | Yes - extension UI/screenshot/state |
| `ui/helpers/constants/transactions.js` | Shared UI helper/constants | Partial - active UI behavior if imported |
| `ui/pages/perps/perps-order-entry-page.test.tsx` | Test file | No - run jest |
| `ui/pages/perps/perps-order-entry-page.tsx` | UI page | Yes - extension UI/screenshot/state |
| `ui/selectors/perps-controller.test.ts` | Test file | No - run jest |
| `ui/selectors/perps-controller.ts` | Shared selector | Partial - Redux state/eval if imported by active code |
| `ui/selectors/toast.test.ts` | Test file | No - run jest |
