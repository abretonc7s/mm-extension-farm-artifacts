/* eslint-disable */
// One-off EVIDENCE capture helper (task-local, NOT shipped, NOT part of the
// deliverable recipe). Forces the treatment A/B variant via manifest _flags so
// a screenshot can show the "New" badge, then leaves the wallet unlocked for
// the runner to capture. Run `restore` afterwards to clean the manifest file.
//
//   node capture-treatment.js treatment   # patch + reload + recover + unlock
//   node capture-treatment.js restore     # remove _flags from the manifest file
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

const MODE = process.argv[2] || 'treatment';
const CDP_PORT = process.env.CDP_PORT || '6661';
const MANIFEST = 'dist/chrome/manifest.json';
const AB_KEY = 'perpsTAT3382AbtestTabBadge';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function patchManifest() {
  const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  if (MODE === 'restore') {
    if (m._flags?.remoteFeatureFlags) {
      delete m._flags.remoteFeatureFlags[AB_KEY];
      delete m._flags.remoteFeatureFlags.perpsEnabledVersion;
    }
  } else {
    m._flags = m._flags || {};
    m._flags.remoteFeatureFlags = {
      ...(m._flags.remoteFeatureFlags || {}),
      perpsEnabledVersion: { minimumVersion: '0.0.0', enabled: true },
      [AB_KEY]: { name: 'treatment' },
    };
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
  console.log(`[capture] manifest patched (${MODE})`);
}

const getJson = (path) =>
  new Promise((resolve, reject) =>
    http
      .get(`http://localhost:${CDP_PORT}${path}`, (res) => {
        let s = '';
        res.on('data', (d) => (s += d));
        res.on('end', () => resolve(JSON.parse(s)));
      })
      .on('error', reject),
  );

const wsSend = (url, method, params) =>
  new Promise((resolve) => {
    const w = new WebSocket(url, { perMessageDeflate: false });
    let id = 0;
    w.on('open', () => {
      const my = ++id;
      w.on('message', (d) => {
        const j = JSON.parse(d);
        if (j.id === my) {
          w.close();
          resolve(j);
        }
      });
      w.send(JSON.stringify({ id: my, method, params }));
    });
    w.on('error', () => resolve(null));
    setTimeout(() => {
      try {
        w.close();
      } catch (_) {}
      resolve(null);
    }, 6000);
  });

const homeTargets = async () =>
  (await getJson('/json/list').catch(() => [])).filter(
    (x) =>
      (x.url || '').includes('home.html') &&
      !(x.url || '').startsWith('chrome-error') &&
      x.webSocketDebuggerUrl,
  );

async function reload() {
  const ts = await getJson('/json/list').catch(() => []);
  const t = ts.find(
    (x) =>
      x.webSocketDebuggerUrl &&
      (x.url || '').startsWith('chrome-extension://') &&
      !/offscreen|snaps/.test(x.url),
  );
  if (t) {
    await wsSend(t.webSocketDebuggerUrl, 'Runtime.evaluate', {
      expression: 'chrome.runtime.reload()',
    });
    console.log('[capture] chrome.runtime.reload() issued');
  }
}

async function openHome() {
  const ts = await getJson('/json/list').catch(() => []);
  const ext = ts.find((x) => (x.url || '').startsWith('chrome-extension://'));
  const id = ext ? ext.url.split('/')[2] : 'hebhblbkkdabgoldnojllkipeoacjioc';
  const ver = await getJson('/json/version').catch(() => null);
  if (ver?.webSocketDebuggerUrl) {
    await wsSend(ver.webSocketDebuggerUrl, 'Target.createTarget', {
      url: `chrome-extension://${id}/home.html`,
    });
  }
}

async function ensureHome(timeoutMs = 50000) {
  const start = Date.now();
  let lastOpen = 0;
  while (Date.now() - start < timeoutMs) {
    const homes = await homeTargets();
    if (homes.length) {
      const ver = await getJson('/json/version').catch(() => null);
      if (ver?.webSocketDebuggerUrl) {
        for (const h of homes.slice(0, -1)) {
          await wsSend(ver.webSocketDebuggerUrl, 'Target.closeTarget', {
            targetId: h.id,
          });
        }
      }
      return homes[homes.length - 1];
    }
    if (Date.now() - lastOpen > 6000) {
      lastOpen = Date.now();
      await openHome();
    }
    await sleep(2000);
  }
  return null;
}

async function unlock(home) {
  const pw =
    JSON.parse(
      fs.readFileSync('temp/recipe/runtime/wallet-fixture.json', 'utf8'),
    ).password || 'qwerasdf';
  for (let i = 0; i < 20; i += 1) {
    const homes = await homeTargets();
    const h = homes.find((x) => x.id === home.id) || homes[homes.length - 1];
    if (!h) {
      await sleep(1500);
      continue;
    }
    if (!/#\/unlock/u.test(h.url || '')) {
      console.log('[capture] wallet unlocked');
      return;
    }
    await wsSend(h.webSocketDebuggerUrl, 'Runtime.evaluate', {
      expression: `(() => {
        const i = document.querySelector('input[type="password"]');
        if (!i) return;
        const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
        set.call(i, ${JSON.stringify(pw)});
        i.dispatchEvent(new Event('input',{bubbles:true}));
        const b = document.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(x=>/unlock/i.test(x.textContent||''));
        b && b.click();
      })()`,
    });
    await sleep(2000);
  }
  console.log('[capture] unlock unconfirmed (best-effort)');
}

(async () => {
  patchManifest();
  if (MODE === 'restore') {
    console.log('[capture] restore (file only) done');
    return;
  }
  await reload();
  await sleep(5000);
  const home = await ensureHome();
  if (!home) {
    console.error('[capture] FAILED: no home');
    process.exit(1);
  }
  await sleep(8000);
  await unlock(home);
  await sleep(3000);
  console.log('[capture] treatment ready');
})();
