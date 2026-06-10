#!/usr/bin/env node
/**
 * TAT-3312 recipe driver — proves the size-slider 100% fix on the live build.
 *
 * Why this exists: the recipe harness `ui.set_input` assigns `el.value = x`
 * directly, which updates React's value-tracker and SUPPRESSES `onChange`, so
 * the perps order form never recomputes the amount. This driver instead uses the
 * React-correct native value-setter (the standard RTL/enzyme approach) so the
 * real `handlePercentInputChange`/`handleSliderChange` fires — exactly the user
 * keystroke. It does NOT write the amount/outcome; it only sets the percentage
 * INPUT and lets the app floor-compute the size itself.
 *
 * Drift-proof: never hardcodes the balance or amount. Waits for the live balance
 * to stream in (non-zero), drives 100%, then asserts the margin relationship via
 * the submit button label (actionable, not "Insufficient funds").
 *
 * Exit 0 = fix verified. Exit 1 = bug present / could not verify.
 */
const WebSocket = require('ws');

const CDP_PORT = process.env.CDP_PORT || process.argv[2] || '7665';
const ROUTE_HASH = '#/perps/trade/ETH?direction=long';

function httpJson(path) {
  return new Promise((resolve, reject) => {
    require('http')
      .get(`http://localhost:${CDP_PORT}${path}`, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function main() {
  const targets = await httpJson('/json');
  const home = targets.find((t) => /home\.html/.test(t.url) && t.webSocketDebuggerUrl);
  if (!home) throw new Error('No extension home.html CDP target found');

  const ws = new WebSocket(home.webSocketDebuggerUrl);
  let id = 0;
  const call = (method, params) =>
    new Promise((resolve, reject) => {
      const myId = ++id;
      const onMsg = (m) => {
        const d = JSON.parse(m);
        if (d.id === myId) {
          ws.off('message', onMsg);
          d.error ? reject(new Error(JSON.stringify(d.error))) : resolve(d.result);
        }
      };
      ws.on('message', onMsg);
      ws.send(JSON.stringify({ id: myId, method, params }));
    });
  await new Promise((r) => ws.once('open', r));
  const evalExpr = (expression) =>
    call('Runtime.evaluate', { expression, returnByValue: true }).then((r) => r && r.result && r.result.value);

  const deadline = (ms) => Date.now() + ms;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // 1. Ensure we are on the ETH order-entry route.
  await evalExpr(`(()=>{ if(location.hash !== ${JSON.stringify(ROUTE_HASH)}) location.hash = ${JSON.stringify(ROUTE_HASH)}; return location.hash; })()`);

  // 2. Wait for the order form + a NON-ZERO live balance to stream in (drift-proof: no amount hardcoded).
  let balanceReady = false;
  for (let t = deadline(20000); Date.now() <= t; ) {
    const ready = await evalExpr(`(()=>{
      const row = document.querySelector('[data-testid=amount-input-available-to-trade-row]');
      const pct = document.querySelector('[data-testid=balance-percent-input] input');
      if(!row || !pct) return false;
      const txt = row.innerText || '';
      return /USDC/.test(txt) && !/0\\.00\\s*USDC/.test(txt);
    })()`);
    if (ready) {
      balanceReady = true;
      break;
    }
    await sleep(200);
  }
  if (!balanceReady) {
    console.log(JSON.stringify({ ok: false, reason: 'balance-not-loaded' }));
    ws.close();
    process.exit(1);
  }

  // 3. Drive the percentage input to 100% via the native value-setter so React's onChange fires.
  //    Set 0 first, then 100, so the final assignment is always a real value change.
  const drive = (val) => `(()=>{
    const el = document.querySelector('[data-testid=balance-percent-input] input');
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set;
    setter.call(el, ${JSON.stringify(val)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return el.value;
  })()`;
  await evalExpr(drive('0'));
  await sleep(100);
  await evalExpr(drive('100'));

  // 4. Assert the fix: at 100% the submit button is actionable, not "Insufficient funds".
  let result = null;
  for (let t = deadline(8000); Date.now() <= t; ) {
    result = await evalExpr(`(()=>{
      const btn = document.querySelector('[data-testid=submit-order-button]');
      const amt = document.querySelector('[data-testid=amount-input-field] input');
      const body = document.body.innerText || '';
      return {
        pct: (document.querySelector('[data-testid=balance-percent-input] input')||{}).value,
        amount: amt ? amt.value : null,
        button: btn ? btn.innerText.trim() : null,
        disabled: btn ? btn.disabled : null,
        insufficient: /Insufficient/i.test(body),
      };
    })()`);
    if (result && result.button && /Open long/i.test(result.button) && !result.insufficient) {
      const out = process.env.SCREENSHOT_OUT;
      if (out) {
        try {
          const shot = await call('Page.captureScreenshot', { format: 'png' });
          if (shot && shot.data) require('fs').writeFileSync(out, Buffer.from(shot.data, 'base64'));
        } catch (e) {
          /* screenshot is best-effort evidence */
        }
      }
      console.log(JSON.stringify({ ok: true, ...result }));
      ws.close();
      process.exit(0);
    }
    await sleep(150);
  }
  console.log(JSON.stringify({ ok: false, reason: 'submit-not-actionable', ...result }));
  ws.close();
  process.exit(1);
}

main().catch((e) => {
  console.log(JSON.stringify({ ok: false, reason: String((e && e.message) || e) }));
  process.exit(1);
});
