import assert from 'node:assert/strict';
import { chromium } from 'playwright';

type Hook = { memoizedState: unknown; next?: Hook | null };
type Fiber = {
  type?: { name?: string };
  memoizedState?: Hook;
  memoizedProps?: Record<string, unknown>;
  return?: Fiber;
};

async function main(): Promise<void> {
const expectedAmount = Number(process.argv[2]);
const browser = await chromium.connectOverCDP('http://127.0.0.1:7667');
try {
  const page = browser.contexts()[0].pages().find((p) => p.url().includes('home.html'));
  assert.ok(page);
  const readInPage = () => {
    const record = (value: unknown): value is Record<string, unknown> =>
      value !== null && typeof value === 'object' && !Array.isArray(value);
    const element = document.querySelector('[data-testid="amount-input-field"]');
    if (!element) throw new Error('Order entry amount field is missing');
    const key = Object.keys(element).find((name) => name.startsWith('__reactFiber$'));
    if (!key) throw new Error('Current-source React fiber is missing');
    let fiber = (element as unknown as Record<string, Fiber>)[key];
    const quotes: { name: string; isFallback: boolean; result: Record<string, unknown> }[] = [];
    let isTestnet: unknown;
    while (fiber) {
      let hook = fiber.memoizedState;
      while (hook && hook.next !== undefined) {
        const value = hook.memoizedState;
        if (record(value) && record(value.result) && typeof value.result.feeRate === 'number') {
          quotes.push({ name: fiber.type?.name ?? '', isFallback: value.isFallback === true, result: value.result });
        }
        hook = hook.next ?? undefined;
      }
      const value = fiber.memoizedProps?.value;
      const store = record(value) ? value.store : fiber.memoizedProps?.store;
      if (record(store) && typeof store.getState === 'function') {
        const state = store.getState() as { metamask?: { isTestnet?: boolean } };
        isTestnet = state.metamask?.isTestnet;
      }
      fiber = fiber.return as Fiber;
    }
    return {
      isTestnet,
      quotes,
      amount: (document.querySelector('[data-testid="amount-input-field"] input') as HTMLInputElement)?.value,
      leverage: (document.querySelector('[data-testid="leverage-input"] input') as HTMLInputElement)?.value,
      displayedFee: document.querySelector('[data-testid="perps-order-summary-estimated-fees"]')?.textContent,
      discountBadge: document.querySelector('[data-testid="perps-fees-discount-badge"]')?.textContent ?? null,
      route: location.hash,
    };
  };
  const read = () => page.evaluate<ReturnType<typeof readInPage>>(`(() => { const __name = (fn) => fn; return (${readInPage.toString()})(); })()`);
  let observed = await read();
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline && !observed.quotes.every((quote) =>
    !quote.isFallback && Math.abs(Number(quote.result.feeAmount) / Number(quote.result.feeRate) - expectedAmount) < 0.0001)) {
    await page.waitForTimeout(100);
    observed = await read();
  }
  assert.equal(observed.isTestnet, true);
  assert.equal(Number(observed.amount?.replaceAll(',', '')), expectedAmount);
  assert.equal(observed.leverage, '3');
  assert.ok(observed.route.includes('/perps/trade/BTC'));
  assert.equal(observed.quotes.length, 2);
  for (const quote of observed.quotes) {
    assert.equal(quote.isFallback, false);
    assert.ok(Math.abs(Number(quote.result.feeAmount) / Number(quote.result.feeRate) - expectedAmount) < 0.0001);
    assert.ok(Math.abs(Number(quote.result.feeRate) - Number(quote.result.protocolFeeRate) - Number(quote.result.metamaskFeeRate)) < 1e-12);
  }
  const displayedFee = Number(observed.displayedFee?.replace(/[^\d.]/gu, ''));
  assert.ok(displayedFee > 0);
  // The UI uses rounded asset size and oracle price; the quote uses entered USD.
  assert.ok(Math.abs(displayedFee - Number(observed.quotes[0].result.feeAmount)) <= 0.02);
  console.log(JSON.stringify(observed));
} finally {
  await browser.close();
}

}
void main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
