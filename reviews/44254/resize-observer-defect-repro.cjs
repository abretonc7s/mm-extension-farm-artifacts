/* eslint-disable */
/**
 * Deterministic repro for the dead ResizeObserver on the perps order-entry page
 * (PR #44254, ui/pages/perps/perps-order-entry-page.tsx).
 *
 * The observer is registered in a `useEffect(..., [])`. On a cold load the page
 * first commits `<PerpsDetailPageSkeleton />` (marketsLoading), so `bodyRef.current`
 * is null when that effect runs; the empty dependency array means it never retries
 * once the real body mounts. Result: `aria-valuemax` keeps announcing the constant
 * 60% instead of the reachable pixel-aware ceiling, and the width is never
 * re-clamped when the container resizes without user interaction.
 *
 * Run: node resize-observer-defect-repro.cjs
 * Writes: resize-observer-defect-repro.json
 */
const path = require('path');
const http = require('http');
const fs = require('fs');
const REPO = '/Users/deeeed/dev/metamask/metamask-extension-1';
const WebSocket = require(path.join(REPO, 'node_modules', 'ws'));
const PORT = Number(process.env.CDP_PORT || 7665);

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

(async () => {
  const t = (await get('/json/list')).find(
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
  const probe = async () =>
    JSON.parse(
      await ev(
        `(() => {
          const d = document.querySelector('[data-testid="perps-order-book-resize-handle"]');
          const body = d ? d.parentElement : null;
          const bookPane = document.querySelector('[data-testid="perps-order-book"]')?.parentElement ?? null;
          return JSON.stringify({
            viewport: window.innerWidth,
            bodyWidth: body ? Math.round(body.getBoundingClientRect().width) : null,
            ariaValueNow: d ? d.getAttribute('aria-valuenow') : null,
            ariaValueMax: d ? d.getAttribute('aria-valuemax') : null,
            bookPaneWidth: bookPane ? Math.round(bookPane.getBoundingClientRect().width) : null,
            bodyScrollWidth: body ? body.scrollWidth : null,
            overflowsHorizontally: body ? body.scrollWidth > Math.round(body.getBoundingClientRect().width) : null,
          });
        })()`,
      ),
    );
  const setViewport = async (width, height) => {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(1200);
  };

  const steps = [];

  // --- Case A: COLD load (reload => markets loading => skeleton commits first)
  await setViewport(1100, 760);
  await ev("location.hash='#/perps/trade/ETH'");
  await sleep(1200);
  await send('Page.reload', {});
  await sleep(8000);
  await ev("document.querySelector('[data-testid=perps-order-book-toggle]')?.click()");
  await sleep(3500);
  steps.push({ case: 'A-cold-load', at: 'wide 1100px, book opened', ...(await probe()) });

  await setViewport(700, 760);
  steps.push({ case: 'A-cold-load', at: 'viewport 1100 -> 700, no interaction', ...(await probe()) });

  await setViewport(360, 640);
  steps.push({ case: 'A-cold-load', at: 'viewport 700 -> 360, no interaction', ...(await probe()) });

  await ev("document.querySelector('[data-testid=perps-order-book-resize-handle]')?.focus()");
  for (const type of ['keyDown', 'keyUp']) {
    await send('Input.dispatchKeyEvent', {
      type,
      key: 'ArrowRight',
      code: 'ArrowRight',
      windowsVirtualKeyCode: 39,
    });
  }
  await sleep(900);
  steps.push({ case: 'A-cold-load', at: 'after ONE ArrowRight keypress', ...(await probe()) });

  // --- Case B: WARM SPA navigation (markets cached => body commits first)
  await setViewport(360, 640);
  await ev("location.hash='#/perps-home'");
  await sleep(6000);
  await ev("location.hash='#/perps/trade/ETH'");
  await sleep(4000);
  await ev("document.querySelector('[data-testid=perps-order-book-toggle]')?.click()");
  await sleep(3000);
  steps.push({ case: 'B-warm-spa-nav', at: 'narrow 360px, book opened', ...(await probe()) });

  await send('Emulation.clearDeviceMetricsOverride');
  ws.close();

  const cold = steps.filter((s) => s.case === 'A-cold-load');
  const warm = steps.find((s) => s.case === 'B-warm-spa-nav');
  const result = {
    claim:
      'ResizeObserver in perps-order-entry-page.tsx never attaches on the cold-load path, so aria-valuemax is not the reachable ceiling and the width is not re-clamped on container resize.',
    coldLoadAriaValueMaxNeverUpdates: cold
      .slice(0, 3)
      .every((s) => s.ariaValueMax === '60'),
    coldLoadCorrectsOnlyAfterInteraction: cold[3]?.ariaValueMax !== '60',
    warmNavAttachesObserver: warm?.ariaValueMax !== '60',
    steps,
  };
  fs.writeFileSync(
    path.join(__dirname, 'resize-observer-defect-repro.json'),
    JSON.stringify(result, null, 2),
  );
  for (const s of steps) {
    console.log(
      `${s.case.padEnd(16)} | ${s.at.padEnd(38)} | vw=${String(s.viewport).padEnd(5)} valuenow=${String(s.ariaValueNow).padEnd(3)} valuemax=${String(s.ariaValueMax).padEnd(3)} bookPane=${s.bookPaneWidth}px overflow=${s.overflowsHorizontally}`,
    );
  }
  console.log('\nRESULT ' + JSON.stringify(result, null, 1).split('\n').slice(0, 6).join(' '));
})();
