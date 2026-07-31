/* eslint-disable */
/**
 * Retake the screenshots that the runner captured through its
 * Page.captureScreenshot fallback (capture-helper intermittently times out on
 * this slot under repeated invocation). The recipe's own assertions already
 * proved these states — 102/102 trace nodes passed — this script only
 * re-establishes each state and re-captures the image through capture-helper so
 * every review image has a valid provider.
 *
 * Usage: node retake-screenshots.cjs <name> [<name> ...]
 */
const path = require('path');
const http = require('http');
const { execFileSync, execSync } = require('child_process');
const REPO = '/Users/deeeed/dev/metamask/metamask-extension-1';
const WebSocket = require(path.join(REPO, 'node_modules', 'ws'));
const PORT = 7665;
const HELPER =
  '/Users/deeeed/farmslot-node-dev/node_modules/@siteed/capture-helper/native/capture-helper';
const OUT_DIR = path.join(__dirname, 'evidence');

const get = (p) =>
  new Promise((r, j) =>
    http
      .get({ host: '127.0.0.1', port: PORT, path: p }, (x) => {
        let d = '';
        x.on('data', (c) => (d += c));
        x.on('end', () => r(JSON.parse(d)));
      })
      .on('error', j),
  );
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function browserPid() {
  const out = execSync(
    "ps ax -o pid=,command= | grep 'remote-debugging-port=7665' | grep -v grep | grep -v Helper | awk '{print $1}' | head -1",
  )
    .toString()
    .trim();
  if (!out) throw new Error('no browser process on port 7665');
  return out;
}

function snapshot(filename) {
  try {
    execSync("pkill -f 'capture-helper' 2>/dev/null || true");
  } catch {}
  execSync('sleep 1');
  const out = path.join(OUT_DIR, filename);
  const res = execFileSync(
    HELPER,
    ['snapshot', '--pid', browserPid(), '--output', out],
    { timeout: 60000 },
  ).toString();
  const parsed = JSON.parse(res);
  console.log(
    `  captured ${filename} (${parsed.bytes} bytes, window ${parsed.selected.width}x${parsed.selected.height}) via capture-helper snapshot`,
  );
}

(async () => {
  const targets = await get('/json/list');
  const t = targets.find(
    (x) => x.type === 'page' && x.url.includes('home.html'),
  );
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => ws.on('open', r));
  let id = 0;
  const pending = new Map();
  ws.on('message', (m) => {
    const o = JSON.parse(m);
    if (o.id && pending.has(o.id)) {
      pending.get(o.id)(o);
      pending.delete(o.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id;
      pending.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const ev = async (e) => {
    const r = await send('Runtime.evaluate', {
      expression: e,
      returnByValue: true,
      awaitPromise: true,
    });
    return r.result?.result?.value;
  };
  const waitFor = async (expr, label, tries = 60) => {
    for (let i = 0; i < tries; i++) {
      if (await ev(expr)) return true;
      await sleep(500);
    }
    throw new Error('timed out waiting for ' + label);
  };
  const click = (testId) =>
    ev(`document.querySelector('[data-testid="${testId}"]').click()`);
  const present = (testId) =>
    `Boolean(document.querySelector('[data-testid="${testId}"]'))`;

  const wanted = process.argv.slice(2);

  if (wanted.includes('ac1')) {
    console.log('AC1: collapsed-by-default');
    await ev("location.hash='#/perps-home'");
    await sleep(3000);
    await ev("location.hash='#/perps/trade/ETH'");
    await waitFor(present('perps-order-entry-page'), 'order entry page');
    await waitFor(present('perps-order-book-toggle'), 'toggle');
    const collapsed = await ev(
      `!document.querySelector('[data-testid="perps-order-book"]') && !document.querySelector('[data-testid="perps-order-book-resize-handle"]')`,
    );
    if (!collapsed) throw new Error('AC1 state wrong: book is not collapsed');
    await sleep(1500);
    snapshot('evidence-ac1-collapsed-by-default.png');
  }

  if (wanted.includes('pr3')) {
    console.log('PR3: ladder after config change');
    await waitFor(present('perps-order-book-toggle'), 'toggle');
    if (!(await ev(present('perps-order-book')))) {
      await click('perps-order-book-toggle');
    }
    await waitFor(present('perps-order-book-ask-row-4-price'), 'ask ladder');
    await click('perps-order-book-grouping-trigger');
    await waitFor(
      present('perps-order-book-config-modal-currency-base'),
      'config modal',
    );
    await click('perps-order-book-config-modal-currency-base');
    await click('perps-order-book-config-modal-metric-size');
    await click('perps-order-book-config-modal-apply');
    await waitFor(
      `document.body.innerText.includes('Size (ETH)')`,
      "'Size (ETH)' column header",
    );
    await sleep(2000);
    snapshot('evidence-pr3-ladder-after-config-change.png');
  }

  if (wanted.includes('pr5')) {
    console.log('PR5: ladder after market switch');
    await waitFor(present('perps-order-book-toggle'), 'toggle');
    if (!(await ev(present('perps-order-book')))) {
      await click('perps-order-book-toggle');
    }
    await waitFor(present('perps-order-book-ask-row-4-price'), 'ETH ladder');
    const before = await ev(
      `document.querySelector('[data-testid="perps-order-book-ask-row-0-price"]').textContent`,
    );
    await ev("location.hash='#/perps/trade/BTC'");
    await waitFor(
      `(() => {
        const sym = document.querySelector('[data-testid="perps-order-entry-asset-symbol"]');
        const row = document.querySelector('[data-testid="perps-order-book-ask-row-4-price"]');
        return Boolean(sym && sym.textContent.includes('BTC') && row);
      })()`,
      'BTC ladder',
    );
    const after = await ev(
      `document.querySelector('[data-testid="perps-order-book-ask-row-0-price"]').textContent`,
    );
    if (before === after) {
      throw new Error('PR5 state wrong: ladder did not change after switch');
    }
    console.log(`  ETH top ${before} -> BTC top ${after}`);
    await sleep(2000);
    snapshot('evidence-pr5-ladder-after-market-switch.png');
  }

  ws.close();
  console.log('done');
})().catch((e) => {
  console.error('RETAKE_ERROR: ' + (e && e.stack ? e.stack : e));
  process.exit(1);
});
