/* eslint-disable */
/**
 * Read-only-ish CDP probe helper for PR #44254 review evidence.
 *
 * Only used for assertions the declared runner actions cannot express:
 * a real mouse drag on the resize divider, viewport emulation for the compact
 * popup-width layout, and value comparisons across two DOM nodes.
 *
 * Exits non-zero on assertion failure so `assert_exit_code` can gate on it.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require(path.join(
  '/Users/deeeed/dev/metamask/metamask-extension-1',
  'node_modules',
  'ws',
));

const PORT = Number(process.env.CDP_PORT || 7665);

function httpGet(p) {
  return new Promise((res, rej) => {
    http
      .get({ host: '127.0.0.1', port: PORT, path: p }, (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => res(JSON.parse(d)));
      })
      .on('error', rej);
  });
}

async function connect() {
  const targets = await httpGet('/json/list');
  const t = targets.find(
    (x) => x.type === 'page' && x.url.includes('home.html'),
  );
  if (!t) throw new Error('no home.html page target on CDP port ' + PORT);
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.on('open', res);
    ws.on('error', rej);
  });
  let id = 0;
  const pending = new Map();
  ws.on('message', (m) => {
    const msg = JSON.parse(m);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((res) => {
      const myId = ++id;
      pending.set(myId, res);
      ws.send(JSON.stringify({ id: myId, method, params }));
    });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.result?.exceptionDetails) {
      throw new Error(
        'eval threw: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 400),
      );
    }
    return r.result?.result?.value;
  };
  return { send, evaluate, close: () => ws.close() };
}

const ROWS_EXPR = `(() => {
  const cell = (t) => document.querySelector('[data-testid="' + t + '"]');
  const side = (s) => Array.from({length: 5}, (_, i) => ({
    price: cell('perps-order-book-' + s + '-row-' + i + '-price')?.textContent ?? null,
    value: cell('perps-order-book-' + s + '-row-' + i + '-value')?.textContent ?? null,
  })).filter((r) => r.price !== null);
  return JSON.stringify({
    symbol: document.querySelector('[data-testid="perps-order-entry-asset-symbol"]')?.textContent ?? null,
    hash: location.hash,
    asks: side('ask'),
    bids: side('bid'),
  });
})()`;

function fail(msg) {
  console.error('ASSERT_FAIL: ' + msg);
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const cdp = await connect();
  try {
    switch (cmd) {
      // Every displayed ask AND bid value cell is a USD amount (AC4).
      case 'usd-values': {
        const data = JSON.parse(await cdp.evaluate(ROWS_EXPR));
        if (data.asks.length === 0 || data.bids.length === 0) {
          fail('expected both ask and bid rows, got ' + JSON.stringify(data));
        }
        const bad = [...data.asks, ...data.bids].filter(
          (r) => !/^\$/u.test(String(r.value ?? '')),
        );
        if (bad.length) {
          fail('non-USD value cells: ' + JSON.stringify(bad));
        }
        console.log(
          'AC4_OK asks=' +
            data.asks.length +
            ' bids=' +
            data.bids.length +
            ' sample=' +
            JSON.stringify(data.asks[0]),
        );
        break;
      }

      // Focus the resize divider. The runner's ui.press dispatches a synthetic
      // click that does not move DOM focus, so ui.key_press would otherwise be
      // delivered to whatever was focused before.
      case 'focus-divider': {
        const v = await cdp.evaluate(
          `(() => {
            const d = document.querySelector('[data-testid="perps-order-book-resize-handle"]');
            if (!d) return null;
            d.focus();
            return JSON.stringify({
              focused: document.activeElement === d,
              now: d.getAttribute('aria-valuenow'),
            });
          })()`,
        );
        if (!v) fail('resize handle not found');
        const a = JSON.parse(v);
        if (!a.focused) fail('resize handle did not take focus');
        console.log('PR2_FOCUS_OK valuenow=' + a.now);
        break;
      }

      // Does a *trusted* (real) mouse click focus the divider? Distinguishes a
      // product a11y gap from an automation artifact of the synthetic press.
      case 'trusted-click-focus': {
        const box = JSON.parse(
          await cdp.evaluate(
            `(() => { const d = document.querySelector('[data-testid="perps-order-book-resize-handle"]'); const r = d.getBoundingClientRect(); return JSON.stringify({x: r.x + r.width / 2, y: r.y + r.height / 2}); })()`,
          ),
        );
        await cdp.evaluate(
          `document.querySelector('[data-testid="perps-order-book-toggle"]').focus()`,
        );
        for (const type of ['mousePressed', 'mouseReleased']) {
          await cdp.send('Input.dispatchMouseEvent', {
            type,
            x: box.x,
            y: box.y,
            button: 'left',
            buttons: type === 'mousePressed' ? 1 : 0,
            clickCount: 1,
          });
        }
        await sleep(300);
        const focused = await cdp.evaluate(
          `(() => { const a = document.activeElement; return a ? (a.getAttribute('data-testid') || a.tagName) : null; })()`,
        );
        console.log('TRUSTED_CLICK_FOCUS=' + focused);
        break;
      }

      // aria-valuenow must equal aria-valuemax after Home (PR2 keyboard bound).
      case 'valuenow-equals-max': {
        const v = await cdp.evaluate(
          `(() => { const d = document.querySelector('[data-testid="perps-order-book-resize-handle"]'); return d ? JSON.stringify({now: d.getAttribute('aria-valuenow'), min: d.getAttribute('aria-valuemin'), max: d.getAttribute('aria-valuemax')}) : null; })()`,
        );
        if (!v) fail('resize handle not found');
        const a = JSON.parse(v);
        if (a.now !== a.max) {
          fail('aria-valuenow ' + a.now + ' != aria-valuemax ' + a.max);
        }
        console.log('PR2_HOME_OK ' + v);
        break;
      }

      // Real mouse drag on the divider: width must change and stay clamped (PR2).
      case 'drag': {
        const before = JSON.parse(
          await cdp.evaluate(
            `(() => { const d = document.querySelector('[data-testid="perps-order-book-resize-handle"]'); const r = d.getBoundingClientRect(); return JSON.stringify({now: Number(d.getAttribute('aria-valuenow')), min: Number(d.getAttribute('aria-valuemin')), max: Number(d.getAttribute('aria-valuemax')), x: r.x + r.width / 2, y: r.y + r.height / 2}); })()`,
          ),
        );
        const mouse = (type, x, y) =>
          cdp.send('Input.dispatchMouseEvent', {
            type,
            x,
            y,
            button: 'left',
            buttons: type === 'mouseReleased' ? 0 : 1,
            clickCount: 1,
          });
        await mouse('mousePressed', before.x, before.y);
        // Drag far past the ceiling to also prove the clamp.
        for (const step of [40, 120, 260, 420]) {
          await mouse('mouseMoved', before.x - step, before.y);
          await sleep(60);
        }
        await mouse('mouseReleased', before.x - 420, before.y);
        await sleep(300);
        const after = JSON.parse(
          await cdp.evaluate(
            `(() => { const d = document.querySelector('[data-testid="perps-order-book-resize-handle"]'); return JSON.stringify({now: Number(d.getAttribute('aria-valuenow')), min: Number(d.getAttribute('aria-valuemin')), max: Number(d.getAttribute('aria-valuemax'))}); })()`,
          ),
        );
        if (after.now === before.now) {
          fail('drag did not change the split: still ' + after.now + '%');
        }
        if (after.now > after.max || after.now < after.min) {
          fail(
            'drag escaped bounds: ' +
              after.now +
              '% outside [' +
              after.min +
              ',' +
              after.max +
              ']',
          );
        }
        console.log(
          'PR2_DRAG_OK ' +
            before.now +
            '% -> ' +
            after.now +
            '% (bounds ' +
            after.min +
            '-' +
            after.max +
            ')',
        );
        break;
      }

      // Limit price input must equal the raw price of the tapped row (PR4).
      case 'prefill-match': {
        const rowTestId = args[0];
        const v = await cdp.evaluate(
          `(() => {
            const input = document.querySelector('[data-testid="limit-price-input"]');
            const el = input && (input.tagName === 'INPUT' ? input : input.querySelector('input'));
            return JSON.stringify({
              limit: el ? el.value : null,
              rowPriceText: document.querySelector('[data-testid="${rowTestId}-price"]')?.textContent ?? null,
              orderTypeLimitPresent: Boolean(document.querySelector('[data-testid="limit-price-input"]')),
            });
          })()`,
        );
        const a = JSON.parse(v);
        if (!a.orderTypeLimitPresent) {
          fail('limit price input not mounted — form did not switch to limit');
        }
        if (!a.limit) fail('limit price input is empty: ' + v);
        const rowNumeric = Number(String(a.rowPriceText).replace(/[^0-9.]/gu, ''));
        const limitNumeric = Number(a.limit);
        if (!Number.isFinite(rowNumeric) || !Number.isFinite(limitNumeric)) {
          fail('unparseable prices: ' + v);
        }
        // The row renders a formatted price; the input carries the raw value.
        // They must agree to within the row's display rounding.
        if (Math.abs(rowNumeric - limitNumeric) > Math.max(1, rowNumeric * 0.001)) {
          fail('limit price ' + a.limit + ' does not match tapped row ' + a.rowPriceText);
        }
        console.log('PR4_OK tapped=' + a.rowPriceText + ' limitInput=' + a.limit);
        break;
      }

      // Resize the real browser window (not just the emulated viewport) so the
      // OS-level capture-helper snapshot shows the genuinely narrow layout.
      case 'window-size': {
        const width = Number(args[0]);
        const height = Number(args[1]);
        const version = await httpGet('/json/version');
        const bws = new WebSocket(version.webSocketDebuggerUrl);
        await new Promise((res, rej) => {
          bws.on('open', res);
          bws.on('error', rej);
        });
        let bid = 0;
        const bpending = new Map();
        bws.on('message', (m) => {
          const o = JSON.parse(m);
          if (o.id && bpending.has(o.id)) {
            bpending.get(o.id)(o);
            bpending.delete(o.id);
          }
        });
        const bsend = (method, params = {}) =>
          new Promise((res) => {
            const i = ++bid;
            bpending.set(i, res);
            bws.send(JSON.stringify({ id: i, method, params }));
          });
        const targets = await httpGet('/json/list');
        const page = targets.find(
          (x) => x.type === 'page' && x.url.includes('home.html'),
        );
        const { result: attached } = await bsend('Target.attachToTarget', {
          targetId: page.id,
          flatten: true,
        });
        const win = await bsend('Browser.getWindowForTarget', {
          targetId: page.id,
        });
        const windowId = win.result?.windowId;
        if (!windowId) {
          fail('could not resolve browser window: ' + JSON.stringify(win));
        }
        await bsend('Browser.setWindowBounds', {
          windowId,
          bounds: { windowState: 'normal', width, height },
        });
        bws.close();
        await sleep(1500);
        const inner = await cdp.evaluate('window.innerWidth');
        console.log(
          'WINDOW_SIZE_SET ' + width + 'x' + height + ' innerWidth=' + inner,
        );
        break;
      }

      case 'viewport': {
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          width: Number(args[0]),
          height: Number(args[1]),
          deviceScaleFactor: 1,
          mobile: false,
        });
        await sleep(700);
        console.log('VIEWPORT_SET ' + args[0] + 'x' + args[1]);
        break;
      }

      case 'viewport-clear': {
        await cdp.send('Emulation.clearDeviceMetricsOverride');
        await sleep(500);
        console.log('VIEWPORT_CLEARED');
        break;
      }

      // Both panes must remain above their pixel floors at popup width (AC5).
      case 'narrow-split': {
        const v = await cdp.evaluate(
          `(() => {
            const divider = document.querySelector('[data-testid="perps-order-book-resize-handle"]');
            const body = divider ? divider.parentElement : null;
            // Measure the split PANES, not their inner content: the form pane
            // carries the 224px floor and the book pane the 140px floor.
            const bookPane = document.querySelector('[data-testid="perps-order-book"]')?.parentElement ?? null;
            const formPane = body ? body.firstElementChild : null;
            return JSON.stringify({
              viewport: window.innerWidth,
              bodyWidth: body ? Math.round(body.getBoundingClientRect().width) : null,
              book: bookPane ? Math.round(bookPane.getBoundingClientRect().width) : null,
              form: formPane ? Math.round(formPane.getBoundingClientRect().width) : null,
              askRows: document.querySelectorAll('[data-testid^="perps-order-book-ask-row-"][data-testid$="-price"]').length,
            });
          })()`,
        );
        const a = JSON.parse(v);
        if (a.book === null || a.form === null) {
          fail('book or form missing at narrow width: ' + v);
        }
        // ORDER_BOOK_MIN_WIDTH_PX = 140, ORDER_BOOK_FORM_MIN_WIDTH_PX = 224.
        if (a.book < 140) fail('order book below its 140px floor: ' + v);
        if (a.form < 224) fail('order form below its 224px floor: ' + v);
        if (a.askRows === 0) fail('no ask rows rendered at narrow width: ' + v);
        console.log('AC5_OK ' + v);
        break;
      }

      case 'capture-prices': {
        const data = JSON.parse(await cdp.evaluate(ROWS_EXPR));
        if (data.asks.length === 0) fail('no ladder to capture: ' + JSON.stringify(data));
        fs.writeFileSync(args[0], JSON.stringify(data, null, 1));
        console.log('CAPTURED ' + data.symbol + ' ' + data.asks.length + ' asks');
        break;
      }

      // After a market switch the ladder must show the new market, never the
      // previous market's rows (PR5).
      case 'assert-fresh': {
        const prev = JSON.parse(fs.readFileSync(args[0], 'utf8'));
        const expectSymbol = args[1];
        let data = null;
        for (let i = 0; i < 40; i++) {
          data = JSON.parse(await cdp.evaluate(ROWS_EXPR));
          if (
            data.symbol &&
            data.symbol.includes(expectSymbol) &&
            data.asks.length > 0 &&
            data.bids.length > 0
          ) {
            break;
          }
          await sleep(500);
        }
        if (!data.symbol || !data.symbol.includes(expectSymbol)) {
          fail('did not land on ' + expectSymbol + ': ' + JSON.stringify(data));
        }
        if (data.asks.length === 0 || data.bids.length === 0) {
          fail('no ladder after switching to ' + expectSymbol);
        }
        const prevPrices = new Set(
          [...prev.asks, ...prev.bids].map((r) => r.price),
        );
        const stale = [...data.asks, ...data.bids].filter((r) =>
          prevPrices.has(r.price),
        );
        if (stale.length) {
          fail(
            'previous market rows still displayed after switch: ' +
              JSON.stringify(stale),
          );
        }
        console.log(
          'PR5_OK ' +
            prev.symbol +
            ' -> ' +
            data.symbol +
            ' newTop=' +
            data.asks[0].price,
        );
        break;
      }

      default:
        fail('unknown probe command: ' + cmd);
    }
  } finally {
    cdp.close();
  }
}

main().catch((e) => {
  console.error('PROBE_ERROR: ' + (e && e.stack ? e.stack : e));
  process.exit(1);
});
