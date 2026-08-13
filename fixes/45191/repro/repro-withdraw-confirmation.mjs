import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const WebSocket = require('ws');
const LABEL = process.env.REPRO_LABEL || 'run';
const OUT = process.env.REPRO_OUT || 'temp/tasks/fix/45191-0812-105020/artifacts/repro';

const t = await (await fetch(`http://127.0.0.1:7667/json/list`)).json();
const page = t.find((x) => x.type === 'page' && x.url.includes('home.html'));
const socket = new WebSocket(page.webSocketDebuggerUrl, { maxPayload: 128*1024*1024 });
await new Promise((res, rej) => { socket.once('open', res); socket.once('error', rej); });
let id = 0; const pending = new Map();
socket.on('message', (d) => { const m = JSON.parse(d.toString()); const r = pending.get(m.id); if (r) { pending.delete(m.id); r(m); } });
const send = (m2,p) => { const i = ++id; socket.send(JSON.stringify({id:i, method:m2, params:p})); return new Promise((res, rej) => { const to=setTimeout(()=>{pending.delete(i);rej(new Error('timeout'))},30000); pending.set(i,(m)=>{clearTimeout(to);res(m)}); }); };
const ev = async (e) => { try { const m = await send('Runtime.evaluate', { expression: e, awaitPromise: false, returnByValue: true }); return m.result?.result?.value; } catch { return null; } };

await send('Page.enable',{});
// Restart the UI realm on the confirmation route: this is the MV3-restart equivalent
// that leaves PerpsStreamManager's account cache empty.
await send('Page.reload',{ignoreCache:false});

const setAmount = `(() => {
  const el = document.querySelector('[data-testid="custom-amount-input"]');
  if (!el) return 'no-input';
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(el, '378');
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return 'set';
})()`;
const readState = `(() => {
  const txt = document.body.innerText || '';
  const inp = document.querySelector('[data-testid="custom-amount-input"]');
  const btn = [...document.querySelectorAll('button')].find(b => /withdraw|confirm/i.test(b.innerText||''));
  return JSON.stringify({
    amount: inp ? inp.value : null,
    insufficient: /Insufficient funds/i.test(txt),
    unavailable: /Couldn't check your Perps balance|Balance unavailable/i.test(txt),
    availableBalance: (txt.match(/Available balance:\\s*\\$?([\\d,.]+)/)||[])[1] || null,
    confirmLabel: btn ? (btn.innerText||'').trim().split('\\n')[0] : null,
    confirmDisabled: btn ? !!btn.disabled : null,
  });
})()`;

let amountSet = false; let captured = false; let captured2 = false; let captured3 = false;
const timeline = [];
const t0 = Date.now();
for (let i = 0; i < 60; i++) {
  await new Promise(r => setTimeout(r, 400));
  if (!amountSet) { const r = await ev(setAmount); if (r === 'set') amountSet = true; }
  const raw = await ev(readState);
  if (!raw) continue;
  const s = JSON.parse(raw);
  s.tMs = Date.now() - t0;
  const last = timeline[timeline.length-1];
  if (!last || JSON.stringify({...last, tMs:0}) !== JSON.stringify({...s, tMs:0})) timeline.push(s);
  // Capture the instant the blocking alert is on screen — that is the evidence.
  if (s.insufficient && !captured) {
    captured = true;
    const shot0 = await send('Page.captureScreenshot',{format:'png'});
    writeFileSync(`${OUT}/${LABEL}-ALERT-at-${s.tMs}ms.png`, Buffer.from(shot0.result.data,'base64'));
    console.log(`>>> captured blocking alert at ${s.tMs}ms (avail=${s.availableBalance})`);
  }
  if (s.insufficient && s.availableBalance && s.availableBalance !== '0.00' && !captured2) {
    captured2 = true;
    const shot1 = await send('Page.captureScreenshot',{format:'png'});
    writeFileSync(`${OUT}/${LABEL}-ALERT-with-real-balance-${s.tMs}ms.png`, Buffer.from(shot1.result.data,'base64'));
    console.log(`>>> captured alert WHILE balance shows $${s.availableBalance} at ${s.tMs}ms`);
  }
  // "After" evidence: same amount, real balance shown, no alert, confirm enabled.
  if (!s.insufficient && s.availableBalance && s.availableBalance !== '0.00' && s.confirmDisabled === false && !captured3) {
    captured3 = true;
    const shot2 = await send('Page.captureScreenshot',{format:'png'});
    writeFileSync(`${OUT}/${LABEL}-OK-with-real-balance-${s.tMs}ms.png`, Buffer.from(shot2.result.data,'base64'));
    console.log(`>>> captured ALLOWED state at ${s.tMs}ms (avail=$${s.availableBalance}, btn="${s.confirmLabel}")`);
  }
  if (s.amount === '378' && (Date.now()-t0) > 14000) break;
}
console.log(`--- ${LABEL} ---`);
for (const s of timeline) console.log(`${String(s.tMs).padStart(6)}ms amount=${s.amount} insufficient=${s.insufficient} unavailable=${s.unavailable} avail=${s.availableBalance} btn="${s.confirmLabel}" disabled=${s.confirmDisabled}`);
writeFileSync(`${OUT}/${LABEL}-timeline.json`, JSON.stringify(timeline,null,2)+'\n');
const shot = await send('Page.captureScreenshot',{format:'png'});
writeFileSync(`${OUT}/${LABEL}.png`, Buffer.from(shot.result.data,'base64'));
console.log('screenshot saved');
socket.close();
