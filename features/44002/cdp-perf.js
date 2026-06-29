#!/usr/bin/env node
/* CDP performance comparison harness for TAT-3461 (expanded view vs popup detail).
 *
 * Methodology (documented in the PR):
 *   1. Warm baseline: navigate to the perps tab (activates market stream).
 *   2. Snapshot M0 via CDP Performance.getMetrics; reset the app's TBT observer.
 *   3. Navigate to the target view; wait until its testid is present, recording
 *      time-to-rendered via performance.now().
 *   4. Idle a fixed streaming window so live streams tick.
 *   5. Snapshot M1; read TBT via window.stateHooks.getLongTaskMetricsWithTBT().
 *   6. Report M1 - M0 deltas plus TBT and time-to-rendered.
 *
 * Usage: node cdp-perf.js <port> <expanded|detail> <symbol> <streamMs> <label> <outFile>
 */
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

const [, , port = '7665', view = 'expanded', symbol = 'ETH', streamMsArg = '10000', label, outFile] =
  process.argv;
const streamMs = Number(streamMsArg);

const HASH = {
  tab: '#/?tab=perps',
  expanded: `#/perps/market-expanded/${symbol}`,
  detail: `#/perps/market/${symbol}`,
};
const TESTID = {
  expanded: 'perps-market-expanded-page',
  detail: 'perps-market-detail-page',
};

function getTarget() {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${port}/json`, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            const t = JSON.parse(d).find(
              (x) => x.type === 'page' && /home\.html/u.test(x.url),
            );
            return t ? resolve(t) : reject(new Error('no home.html target'));
          } catch (e) {
            return reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const target = await getTarget();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map();
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  ws.on('message', (m) => {
    const r = JSON.parse(m.toString());
    if (r.id && pending.has(r.id)) {
      const { resolve, reject } = pending.get(r.id);
      pending.delete(r.id);
      if (r.error) reject(new Error(JSON.stringify(r.error)));
      else resolve(r.result);
    }
  });
  await new Promise((res, rej) => {
    ws.on('open', res);
    ws.on('error', rej);
  });

  const eval_ = async (expression) => {
    const r = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  const metrics = async () => {
    const r = await send('Performance.getMetrics');
    const map = {};
    r.metrics.forEach((x) => (map[x.name] = x.value));
    return map;
  };
  const waitTestid = async (testid, timeoutMs = 20000) => {
    const deadline = Date.now() + timeoutMs;
    const expr = `Boolean(document.querySelector('[data-testid="${testid}"]'))`;
    for (;;) {
      if (await eval_(expr)) return;
      if (Date.now() > deadline) throw new Error(`timeout: ${testid}`);
      await sleep(250);
    }
  };

  await send('Performance.enable');
  await send('Page.enable').catch(() => {});

  // Optional reload isolation (PERF_RELOAD=1): fresh page context per run.
  if (process.env.PERF_RELOAD === '1') {
    await send('Page.reload', { ignoreCache: false });
    await sleep(3000);
    await waitTestid('account-menu-icon', 30000).catch(() => {});
  }

  // Optional localStorage preset (PERF_SET_LS="KEY=VALUE") before mounting views.
  if (process.env.PERF_SET_LS) {
    const [k, v] = process.env.PERF_SET_LS.split('=');
    await eval_(
      `(function(){try{localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)})}catch(e){}return 1})()`,
    );
  } else {
    await eval_(
      "(function(){try{localStorage.removeItem('PERF_HIDE_ORDER_BOOK')}catch(e){}return 1})()",
    );
  }

  // 1. Warm baseline.
  await eval_(`(function(){location.hash=${JSON.stringify(HASH.tab)};return 1})()`);
  await sleep(4000);

  // 2. Snapshot M0 + reset TBT.
  const m0 = await metrics();
  await eval_(
    '(function(){if(window.stateHooks&&window.stateHooks.resetLongTaskMetrics)window.stateHooks.resetLongTaskMetrics();return 1})()',
  );

  // 3. Navigate target, wait for render, record time-to-rendered.
  const t0 = await eval_('performance.now()');
  await eval_(`(function(){location.hash=${JSON.stringify(HASH[view])};return 1})()`);
  await waitTestid(TESTID[view]);
  const t1 = await eval_('performance.now()');
  const timeToRenderMs = Math.round(t1 - t0);

  // 4. Idle streaming window.
  await sleep(streamMs);

  // 5. Snapshot M1 + TBT.
  const m1 = await metrics();
  const tbt = await eval_(
    'JSON.stringify(window.stateHooks&&window.stateHooks.getLongTaskMetricsWithTBT?window.stateHooks.getLongTaskMetricsWithTBT():null)',
  );
  const tbtObj = JSON.parse(tbt) || {};

  // Per-panel DOM-node attribution (reliable: direct subtree counts).
  let panelNodes = null;
  if (view === 'expanded') {
    panelNodes = JSON.parse(
      await eval_(
        "JSON.stringify((function(){function n(id){var e=document.querySelector('[data-testid=\"'+id+'\"]');return e?e.getElementsByTagName('*').length:0}return {header:n('perps-expanded-header'),chart:n('perps-expanded-chart-panel'),orderBook:n('perps-expanded-order-book-panel'),trade:n('perps-expanded-trade-panel'),positions:n('perps-expanded-positions-panel')}})())",
      ),
    );
  }

  const delta = (k) => Math.round(((m1[k] || 0) - (m0[k] || 0)) * 1000) / 1000;
  const result = {
    label: label || `${view}@${port}`,
    view,
    port,
    symbol,
    streamMs,
    timeToRenderMs,
    tbt: tbtObj.tbt,
    tbtRating: tbtObj.tbtRating,
    longTasks: tbtObj.count,
    jsHeapUsedMB: Math.round((m1.JSHeapUsedSize || 0) / 1e5) / 10,
    jsHeapDeltaMB: Math.round(((m1.JSHeapUsedSize || 0) - (m0.JSHeapUsedSize || 0)) / 1e5) / 10,
    domNodes: m1.Nodes,
    domNodesDelta: delta('Nodes'),
    jsListeners: m1.JSEventListeners,
    layoutCountDelta: delta('LayoutCount'),
    recalcStyleCountDelta: delta('RecalcStyleCount'),
    layoutDurationDelta: delta('LayoutDuration'),
    recalcStyleDurationDelta: delta('RecalcStyleDuration'),
    scriptDurationDelta: delta('ScriptDuration'),
    panelNodes,
  };

  if (outFile) {
    let acc = {};
    if (fs.existsSync(outFile)) {
      try {
        acc = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      } catch (e) {
        acc = {};
      }
    }
    acc[result.label] = result;
    fs.writeFileSync(outFile, JSON.stringify(acc, null, 2));
  }
  console.log(JSON.stringify(result, null, 2));
  ws.close();
}

main().catch((e) => {
  console.error('PERF FAIL:', e.message);
  process.exit(1);
});
