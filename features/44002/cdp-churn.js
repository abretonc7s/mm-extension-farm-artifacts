#!/usr/bin/env node
/* Navigation-churn leak test for TAT-3461.
 *
 * Repeatedly mounts/unmounts a view (home <-> view) N times and records
 * JS heap / DOM nodes / listeners each cycle, so we can see whether memory /
 * listener growth is specific to the expanded view or a pre-existing perps
 * trait that also occurs on the popup detail page.
 *
 * Usage: node cdp-churn.js <port> <expanded|detail> <symbol> <cycles> <label> <outFile>
 */
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

const [, , port = '7665', view = 'detail', symbol = 'ETH', cyclesArg = '8', label, outFile] =
  process.argv;
const cycles = Number(cyclesArg);
const HASH = {
  home: '#/?tab=perps',
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
  const metricsMap = async () => {
    const r = await send('Performance.getMetrics');
    const map = {};
    r.metrics.forEach((x) => (map[x.name] = x.value));
    return map;
  };
  const waitTestid = async (testid, timeoutMs = 15000) => {
    const deadline = Date.now() + timeoutMs;
    const expr = `Boolean(document.querySelector('[data-testid="${testid}"]'))`;
    for (;;) {
      if (await eval_(expr)) return true;
      if (Date.now() > deadline) return false;
      await sleep(250);
    }
  };

  await send('Performance.enable');
  // Warm + force GC if available so the baseline is comparable.
  await eval_(`(function(){location.hash=${JSON.stringify(HASH.detail)};return 1})()`);
  await sleep(4000);

  const samples = [];
  for (let i = 0; i < cycles; i++) {
    // unmount: go to perps tab (no market detail/expanded mounted)
    await eval_(`(function(){location.hash=${JSON.stringify(HASH.home)};return 1})()`);
    await sleep(1500);
    // mount: go to the view
    await eval_(`(function(){location.hash=${JSON.stringify(HASH[view])};return 1})()`);
    const ok = await waitTestid(TESTID[view]);
    await sleep(1500);
    const m = await metricsMap();
    samples.push({
      cycle: i + 1,
      mounted: ok,
      heapMB: Math.round((m.JSHeapUsedSize || 0) / 1e5) / 10,
      nodes: m.Nodes,
      listeners: m.JSEventListeners,
      documents: m.Documents,
    });
  }

  const first = samples[1] || samples[0];
  const last = samples[samples.length - 1];
  const result = {
    label: label || `${view}-churn@${port}`,
    view,
    port,
    cycles,
    samples,
    growth: {
      heapMB: Math.round((last.heapMB - first.heapMB) * 10) / 10,
      nodes: last.nodes - first.nodes,
      listeners: last.listeners - first.listeners,
      documents: last.documents - first.documents,
    },
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
  console.error('CHURN FAIL:', e.message);
  process.exit(1);
});
