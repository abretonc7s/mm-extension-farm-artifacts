#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');

const port = Number(process.env.CDP_PORT || process.env.RECIPE_CDP_PORT || 6664);
const action = process.argv[2];

async function cdpEvaluate(expression) {
  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) =>
    r.json(),
  );
  const target = targets.find(
    (entry) =>
      entry.type === 'page' &&
      entry.url.startsWith('chrome-extension://') &&
      entry.url.includes('/home.html') &&
      entry.webSocketDebuggerUrl,
  );
  if (!target) {
    throw new Error(`No extension home.html CDP target on port ${port}`);
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  let id = 0;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const messageId = ++id;
      const onMessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.id !== messageId) {
          return;
        }
        ws.removeEventListener('message', onMessage);
        if (message.error) {
          reject(new Error(JSON.stringify(message.error)));
          return;
        }
        resolve(message.result);
      };
      ws.addEventListener('message', onMessage);
      ws.send(JSON.stringify({ id: messageId, method, params }));
    });

  try {
    const result = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(JSON.stringify(result.exceptionDetails));
    }
    return result.result?.value;
  } finally {
    ws.close();
  }
}

const domProbe = `(function () {
  const text = (selector) => document.querySelector(selector)?.textContent?.trim() ?? '';
  const inputValue = (selector) => document.querySelector(selector)?.value ?? '';
  const money = (value) => {
    const parsed = Number(String(value || '').replace(/[^0-9.-]/gu, ''));
    return Number.isFinite(parsed) ? parsed : null;
  };
  const amountField = document.querySelector('[data-testid="amount-input-field"]');
  const amountInput = document.querySelector('[data-testid="amount-input-field"] input');
  const unit = text('[data-testid="amount-input-denomination-unit"]');
  const toggle = document.querySelector('[data-testid="toggle-denomination"]');
  const priceText =
    text('[data-testid="perps-order-entry-price"]') ||
    text('[data-testid="perps-market-detail-price"]');
  const price = money(priceText);
  const marginText = text('[data-testid="perps-order-summary-margin-required"]');
  const margin = money(marginText);
  const feeText = text('[data-testid="perps-order-summary-estimated-fees"]');
  const fees = money(feeText);
  const percent = inputValue('[data-testid="balance-percent-input"] input');
  const leverage = Number(inputValue('[data-testid="leverage-input"] input') || '3');
  const visible = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };
  return {
    href: location.href,
    bodyText: document.body.innerText,
    amountFieldCount: document.querySelectorAll('[data-testid="amount-input-field"]').length,
    oldTokenFieldCount: document.querySelectorAll('[data-testid="amount-input-token-field"]').length,
    amountVisible: visible(amountField),
    amount: amountInput?.value ?? '',
    placeholder: amountInput?.getAttribute('placeholder') ?? '',
    unit,
    hasToggle: Boolean(toggle),
    toggleRole: toggle?.getAttribute('role') ?? '',
    toggleAriaLabel: toggle?.getAttribute('aria-label') ?? '',
    priceText,
    price,
    marginText,
    margin,
    feeText,
    fees,
    percent,
    leverage,
  };
})()`;

function assertMoneyPresent(label, value, text) {
  assert.notEqual(text, '-', `${label} should not be a dash`);
  assert.equal(typeof value, 'number', `${label} should parse as money`);
  assert.ok(Number.isFinite(value), `${label} should be finite`);
}

async function main() {
  const state = await cdpEvaluate(domProbe);

  if (action === 'usd-default') {
    assert.equal(state.amountFieldCount, 1, 'expected one size input field');
    assert.equal(state.oldTokenFieldCount, 0, 'old token field should be absent');
    assert.equal(state.amountVisible, true, 'size input should be visible');
    assert.equal(state.unit, 'USD', 'default denomination should be USD');
    assert.equal(state.placeholder, '0.00', 'USD placeholder should be 0.00');
    assert.equal(state.hasToggle, true, 'swap/toggle control should exist');
    assert.match(
      state.toggleAriaLabel,
      /toggle size denomination/iu,
      'toggle should have an accessible name',
    );
  } else if (action === 'asset-conversion') {
    assert.equal(state.unit, 'BTC', 'denomination should switch to BTC');
    assert.ok(state.price > 0, `expected a positive BTC price, got ${state.priceText}`);
    const actual = Number(state.amount);
    assert.ok(actual > 0, `expected positive BTC amount, got ${state.amount}`);
    const expected = 9000 / state.price;
    const tolerance = Math.max(0.0001, expected * 0.05);
    assert.ok(
      Math.abs(actual - expected) <= tolerance,
      `expected ${actual} BTC to be within ${tolerance} of ${expected}`,
    );
  } else if (action === 'usd-return') {
    assert.equal(state.unit, 'USD', 'denomination should switch back to USD');
    assert.equal(Number(state.amount), 9000, 'USD amount should remain equivalent');
  } else if (action === 'asset-typing') {
    assert.equal(state.unit, 'BTC', 'asset typing should occur in BTC mode');
    assert.equal(state.amount, '0.1', 'field should preserve typed BTC amount');
    assertMoneyPresent('margin', state.margin, state.marginText);
    assertMoneyPresent('fees', state.fees, state.feeText);
    assert.ok(state.price > 0, `expected a positive BTC price, got ${state.priceText}`);
    const expectedMargin = (0.1 * state.price) / state.leverage;
    const tolerance = Math.max(2, expectedMargin * 0.08);
    assert.ok(
      Math.abs(state.margin - expectedMargin) <= tolerance,
      `margin ${state.marginText} should reflect roughly 0.1 BTC * price / leverage (${expectedMargin})`,
    );
  } else if (action === 'percent-update') {
    assert.equal(state.percent, '50', 'percent input should show 50');
    assert.equal(state.unit, 'BTC', 'asset denomination should remain active');
    assert.ok(Number(state.amount) > 0, 'asset amount should update from percent');
    assertMoneyPresent('margin', state.margin, state.marginText);
  } else if (action === 'persisted-asset') {
    assert.ok(
      state.href.includes('/perps/trade/BTC'),
      `should be back on BTC trade route, got ${state.href}`,
    );
    assert.equal(state.unit, 'BTC', 'BTC denomination should persist as asset');
  } else {
    throw new Error(`Unknown assertion action: ${action}`);
  }

  console.log(JSON.stringify({ action, ok: true, state }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
