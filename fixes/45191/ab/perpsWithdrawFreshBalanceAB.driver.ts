/**
 * TAT-3632 A/B driver — identical file, run twice against two code versions.
 *
 * This file is deliberately version-agnostic: it imports nothing the fix
 * introduced, so the *same* driver runs unchanged against the pre-fix hook
 * (main, `bc55c67781`) and the post-fix hook (`6dee7b7a9f`).
 *
 * It feeds the real `usePerpsWithdrawInsufficientBalanceAlert` the account
 * state captured from the *running extension* by
 * `probe-perps-balance-divergence.mjs` — the streamed cache as it actually
 * was (empty after a UI restart) and the fresh account-state read as it
 * actually resolved — then records what the hook decides.
 *
 * The assertion is the user-facing invariant, not an implementation detail:
 * the amount is well under the balance the account really holds, so a correct
 * implementation must not block it. That makes this one test fail on the
 * pre-fix code and pass on the post-fix code.
 *
 * Env:
 *   AB_LABEL  — 'pre-fix' | 'post-fix', recorded in the output
 *   AB_COMMIT — commit the hook came from, recorded in the output
 *   AB_INPUT  — path to the live probe JSON
 *   AB_OUTPUT — path to write the observation JSON
 */
import { readFileSync, writeFileSync } from 'fs';
import type { AccountState } from '@metamask/perps-controller';
import {
  TransactionMeta,
  TransactionType,
} from '@metamask/transaction-controller';
import { act } from '@testing-library/react';
import { getMockConfirmStateForTransaction } from '../../../../../../test/data/confirmations/helper';
import { genUnapprovedContractInteractionConfirmation } from '../../../../../../test/data/confirmations/contract-interaction';
import { renderHookWithConfirmContextProvider } from '../../../../../../test/lib/confirmations/render-helpers';
import { usePerpsCacheKey } from '../../../../../hooks/perps/usePerpsCacheKey';
import { getPerpsStreamManager } from '../../../../../providers/perps';
import { submitRequestToBackground } from '../../../../../store/background-connection';
import { useTransactionPayPrimaryRequiredToken } from '../../pay/useTransactionPayData';
import { usePerpsWithdrawInsufficientBalanceAlert } from './usePerpsWithdrawInsufficientBalanceAlert';

jest.mock('../../../../../providers/perps', () => ({
  ...jest.requireActual('../../../../../providers/perps'),
  getPerpsStreamManager: jest.fn(),
}));
jest.mock('../../../../../store/background-connection', () => ({
  ...jest.requireActual('../../../../../store/background-connection'),
  submitRequestToBackground: jest.fn(),
}));
jest.mock('../../../../../hooks/perps/usePerpsCacheKey');
jest.mock('../../pay/useTransactionPayData');

const mockGetPerpsStreamManager = jest.mocked(getPerpsStreamManager);
const mockSubmitRequestToBackground = jest.mocked(submitRequestToBackground);
const mockUsePerpsCacheKey = jest.mocked(usePerpsCacheKey);
const mockUsePrimaryRequiredToken = jest.mocked(
  useTransactionPayPrimaryRequiredToken,
);

type LiveProbe = {
  href: string;
  streamedAccountPresent: boolean;
  streamedBalance: string;
  freshBalance: string;
  validWithdrawal: string;
};

const label = process.env.AB_LABEL ?? 'unknown';
const commit = process.env.AB_COMMIT ?? 'unknown';
const inputPath = process.env.AB_INPUT as string;
const outputPath = process.env.AB_OUTPUT as string;
const live: LiveProbe = JSON.parse(readFileSync(inputPath, 'utf8'));

describe(`TAT-3632 A/B — ${label} hook against live account state`, () => {
  it('does not block a withdrawal the account can actually cover', async () => {
    // The streamed cache exactly as the live probe found it: absent after a
    // UI restart, because nothing on a non-Perps screen subscribes to it.
    mockGetPerpsStreamManager.mockReturnValue({
      account: {
        getCachedData: () =>
          live.streamedAccountPresent
            ? ({ withdrawableBalance: live.streamedBalance } as AccountState)
            : null,
      },
    } as ReturnType<typeof getPerpsStreamManager>);

    // The fresh account-state read exactly as it resolved live — the same
    // read the provider validates the withdrawal against.
    mockSubmitRequestToBackground.mockResolvedValue({
      withdrawableBalance: live.freshBalance,
    });

    mockUsePerpsCacheKey.mockReturnValue('hyperliquid:testnet:0x1');
    mockUsePrimaryRequiredToken.mockReturnValue({
      amountFiat: live.validWithdrawal,
    } as ReturnType<typeof useTransactionPayPrimaryRequiredToken>);

    const transaction = {
      ...genUnapprovedContractInteractionConfirmation(),
      type: TransactionType.perpsWithdraw,
    } as TransactionMeta;

    const { result } = renderHookWithConfirmContextProvider(
      () => usePerpsWithdrawInsufficientBalanceAlert(),
      getMockConfirmStateForTransaction(transaction),
    );

    // Let any asynchronous read settle. The pre-fix hook is synchronous and is
    // unaffected; the post-fix hook resolves its fresh read here. Flushing
    // unconditionally keeps the driver identical across both versions.
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
    }

    const alerts = result.current;
    const blocking = alerts.find((alert) => alert.isBlocking);

    writeFileSync(
      outputPath,
      `${JSON.stringify(
        {
          codeVersion: label,
          hookCommit: commit,
          liveInput: {
            capturedFrom: live.href,
            streamedAccountPresent: live.streamedAccountPresent,
            streamedBalance: live.streamedBalance,
            freshBalance: live.freshBalance,
            enteredAmount: live.validWithdrawal,
          },
          observed: {
            // Which source the hook actually touched — recorded, not asserted,
            // so the same driver runs on both versions.
            streamedCacheConsulted: mockGetPerpsStreamManager.mock.calls.length > 0,
            freshReadCalled: mockSubmitRequestToBackground.mock.calls.length > 0,
            blocked: Boolean(blocking),
            alertKey: blocking?.key ?? null,
            reason: blocking?.reason ?? null,
            message: blocking?.message ?? null,
          },
        },
        null,
        2,
      )}\n`,
    );

    // The invariant: $${live.validWithdrawal} is well under the
    // $${live.freshBalance} the account really holds, so this withdrawal is
    // valid and must not be blocked.
    expect({
      blocked: Boolean(blocking),
      reason: blocking?.reason ?? null,
    }).toStrictEqual({ blocked: false, reason: null });
  });
});
