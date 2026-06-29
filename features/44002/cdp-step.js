#!/usr/bin/env node
/* CDP step runner for the TAT-3461 expanded-view recipe.
 *
 * Drives a chosen extension page over CDP. Target is selected by URL substring
 * via env STEP_TARGET (default "home.html"); e.g. STEP_TARGET=sidepanel.html or
 * STEP_TARGET=market-expanded. Each subcommand is one validated CDP call so the
 * recipe composes them as `command` nodes and asserts via exit code / JSON file.
 *
 * Subcommands:
 *   nav <hash>                 set location.hash on the target
 *   wait <testid> [timeoutMs]  poll until testid present on the target
 *   click <testid>             trusted Input mouse click on testid (real gesture)
 *   wait-tab <urlSubstr> [ms]  wait until a page target whose url includes substr
 *   panels                     assert all five expanded panels present
 *   fullwidth <testid>         assert element width >= viewport width
 *   reset                      reset the Long-Task/TBT observer
 *   metrics <label> <outFile>  record getLongTaskMetricsWithTBT into outFile JSON
 *
 * Exit 0 on success; non-zero on failure.
 */
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

const PORT = process.argv[2] || '7665';
const SUB = process.argv[3];
const REST = process.argv.slice(4);
const TARGET_MATCH = process.env.STEP_TARGET || 'home.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function listTargets() {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${PORT}/json`, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(d));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function pickTarget(match = TARGET_MATCH) {
  // Prefer the newest matching tab (CDP lists newest last) so the expanded tab
  // opened by a fresh expand-click wins over any stale tab.
  const matches = (await listTargets()).filter(
    (x) => x.type === 'page' && x.url.includes(match),
  );
  const t = matches[matches.length - 1];
  if (!t) {
    throw new Error(`no page target matching "${match}"`);
  }
  return t;
}

function connect(target) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 0;
    const pending = new Map();
    ws.on('message', (m) => {
      const r = JSON.parse(m.toString());
      if (r.id && pending.has(r.id)) {
        const { res, rej } = pending.get(r.id);
        pending.delete(r.id);
        if (r.error) rej(new Error(JSON.stringify(r.error)));
        else res(r.result);
      }
    });
    ws.on('open', () => {
      const send = (method, params = {}) =>
        new Promise((res, rej) => {
          const i = ++id;
          pending.set(i, { res, rej });
          ws.send(JSON.stringify({ id: i, method, params }));
        });
      const evaluate = async (expression) => {
        const r = await send('Runtime.evaluate', {
          expression,
          awaitPromise: true,
          returnByValue: true,
        });
        if (r.exceptionDetails) {
          throw new Error(JSON.stringify(r.exceptionDetails));
        }
        return r.result && r.result.value;
      };
      resolve({ send, evaluate, close: () => ws.close() });
    });
    ws.on('error', reject);
  });
}

async function main() {
  if (SUB === 'wait-tab') {
    const substr = REST[0];
    const timeoutMs = Number(REST[1] || 20000);
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const found = (await listTargets()).some(
        (x) => x.type === 'page' && x.url.includes(substr),
      );
      if (found) {
        console.log(`tab present: ${substr}`);
        return;
      }
      if (Date.now() > deadline) {
        throw new Error(`timeout waiting for tab: ${substr}`);
      }
      await sleep(500);
    }
  }

  const c = await connect(await pickTarget());

  if (SUB === 'nav') {
    await c.evaluate(
      `(function(){location.hash=${JSON.stringify(REST[0])};return 1})()`,
    );
    console.log(`navigated ${REST[0]}`);
  } else if (SUB === 'reset') {
    await c.evaluate(
      "(function(){if(window.stateHooks&&window.stateHooks.resetLongTaskMetrics)window.stateHooks.resetLongTaskMetrics();return 1})()",
    );
    console.log('metrics reset');
  } else if (SUB === 'wait') {
    const testid = REST[0];
    const timeoutMs = Number(REST[1] || 20000);
    const deadline = Date.now() + timeoutMs;
    const expr = `Boolean(document.querySelector('[data-testid="${testid}"]'))`;
    for (;;) {
      if (await c.evaluate(expr)) {
        console.log(`found ${testid}`);
        break;
      }
      if (Date.now() > deadline) {
        throw new Error(`timeout waiting for ${testid}`);
      }
      await sleep(500);
    }
  } else if (SUB === 'click') {
    const testid = REST[0];
    const box = await c.evaluate(
      `JSON.stringify((function(){var b=document.querySelector('[data-testid="${testid}"]');if(!b)return null;var r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})())`,
    );
    if (!box) {
      throw new Error(`element not found: ${testid}`);
    }
    const { x, y } = JSON.parse(box);
    // Trusted gesture — required for openExtensionInBrowser to spawn a tab.
    await c.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount: 1,
    });
    await c.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount: 1,
    });
    console.log(`clicked ${testid}`);
  } else if (SUB === 'panels') {
    const ids = [
      'perps-expanded-header',
      'perps-expanded-chart-panel',
      'perps-expanded-order-book-panel',
      'perps-expanded-trade-panel',
      'perps-expanded-positions-panel',
    ];
    const out = JSON.parse(
      await c.evaluate(
        `JSON.stringify((function(){var ids=${JSON.stringify(ids)};var missing=ids.filter(function(id){return !document.querySelector('[data-testid="'+id+'"]')});return {ok:missing.length===0,missing:missing}})())`,
      ),
    );
    console.log(JSON.stringify(out));
    if (!out.ok) {
      throw new Error(`missing panels: ${out.missing.join(',')}`);
    }
  } else if (SUB === 'fullwidth') {
    const testid = REST[0];
    const out = JSON.parse(
      await c.evaluate(
        `JSON.stringify((function(){var el=document.querySelector('[data-testid="${testid}"]');if(!el){return {ok:false}};var w=el.getBoundingClientRect().width;return {ok:w>=window.innerWidth-2,width:w,viewport:window.innerWidth}})())`,
      ),
    );
    console.log(JSON.stringify(out));
    if (!out.ok) {
      throw new Error(`not full width: ${JSON.stringify(out)}`);
    }
  } else if (SUB === 'metrics') {
    const label = REST[0];
    const outFile = REST[1];
    const out = JSON.parse(
      await c.evaluate(
        "JSON.stringify((function(){var m=window.stateHooks&&window.stateHooks.getLongTaskMetricsWithTBT?window.stateHooks.getLongTaskMetricsWithTBT():null;return m?{ok:typeof m.tbt==='number',tbt:m.tbt,tbtRating:m.tbtRating,longTasks:m.count,totalDuration:m.totalDuration,maxDuration:m.maxDuration}:{ok:false}})())",
      ),
    );
    let acc = {};
    if (outFile && fs.existsSync(outFile)) {
      try {
        acc = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      } catch (e) {
        acc = {};
      }
    }
    acc[label] = out;
    if (outFile) {
      fs.writeFileSync(outFile, JSON.stringify(acc, null, 2));
    }
    console.log(`${label}: ${JSON.stringify(out)}`);
    if (!out.ok) {
      throw new Error(`metrics unavailable for ${label}`);
    }
  } else {
    c.close();
    throw new Error(`unknown subcommand: ${SUB}`);
  }
  c.close();
}

main().catch((e) => {
  console.error('STEP FAIL:', e.message);
  process.exit(1);
});
