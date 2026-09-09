import { appendFileSync, readFileSync, writeFileSync, existsSync, openSync } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const eventsPath = `${root}observed-traces.jsonl`;
const pidPath = `${root}observer.pid`;
const readyPath = `${root}observer-ready.json`;
const port = 7661;
type Target = { id: string; type: string; url: string; webSocketDebuggerUrl: string };
type Message = { id?: number; method?: string; params?: Record<string, unknown>; result?: Record<string, unknown>; error?: unknown };
const targets = async (): Promise<Target[]> => (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
async function connect(target: Target) {
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise<void>((resolve, reject) => { socket.onopen = () => resolve(); socket.onerror = reject; });
  let id = 0;
  const pending = new Map<number, { resolve: (value: Record<string, unknown>) => void; reject: (reason: unknown) => void }>();
  const listeners: ((message: Message) => void)[] = [];
  socket.onmessage = (event) => {
    const message: Message = JSON.parse(String(event.data));
    if (message.id) {
      const callback = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) callback?.reject(message.error); else callback?.resolve(message.result ?? {});
    } else listeners.forEach((listener) => listener(message));
  };
  return {
    socket, listeners,
    call: (method: string, params: Record<string, unknown> = {}) => new Promise<Record<string, unknown>>((resolve, reject) => {
      pending.set(++id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
    }),
  };
}
const pageTarget = async () => {
  const target = (await targets()).find((item) => item.type === 'page' && item.url.includes('/home.html'));
  assert(target, 'Preserved extension page is required'); return target;
};
const snapshotExpression = `(() => {
  const manager = globalThis.stateHooks?.getPerpsStreamManager?.();
  const rows = [...document.querySelectorAll('[data-testid]')].filter(e => /^(perps-watchlist-(?!header)|explore-markets-|market-row-(?!ticker-|skeleton))/.test(e.getAttribute('data-testid')) && e.getClientRects().length);
  return {route:location.hash,visible:document.visibilityState,initialized:manager?.isInitialized(),markets:manager?.markets.getCachedData().length ?? 0,prices:manager?.prices.getCachedData().length ?? 0,account:manager?.account.hasCachedData() ?? false,liveMarkets:manager?.hasLiveMarketData?.(manager.markets.getCachedData()) ?? false,livePrices:manager?.hasLivePrices?.(manager.prices.getCachedData()) ?? false,rows:rows.map(e=>e.getAttribute('data-testid')),skeleton:!!document.querySelector('[data-testid="perps-view-loading"],[data-testid="market-row-skeleton"]')};
})()`;
async function evaluate(expression: string) {
  const cdp = await connect(await pageTarget());
  try {
    const result = await cdp.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
    return (result.result as { value: unknown }).value;
  } finally { cdp.socket.close(); }
}
const log = (event: Record<string, unknown>) => appendFileSync(eventsPath, `${JSON.stringify({ at: Date.now(), ...event })}\n`);
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(check: () => Promise<boolean>, message: string, timeout = 45000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { if (await check()) return; await delay(200); }
  throw new Error(message);
}
type TraceEvent = { kind: string; side?: string; request?: { name: string; id: string; tags?: Record<string, unknown>; data?: Record<string, unknown> }; ui?: { rows: string[]; markets: number; prices: number; liveMarkets: boolean; livePrices: boolean; skeleton: boolean }; subscription?: string };
const events = (): TraceEvent[] => existsSync(eventsPath) ? readFileSync(eventsPath, 'utf8').trim().split('\n').filter(Boolean).map((line) => JSON.parse(line)) : [];
const names = ['Perps Connection Establishment', 'Perps Market Data Preload', 'Perps User Data Preload', 'Perps Entry To Live Market List', 'Perps Market List View'];

async function observe() {
  writeFileSync(eventsPath, '');
  const connections = [];
  const installations: Promise<void>[] = [];
  for (const target of (await targets()).filter((t) => t.url.includes('hebhblbkkdabgoldnojllkipeoacjioc') && ['page', 'service_worker'].includes(t.type))) {
    const cdp = await connect(target); connections.push(cdp);
    const seen = new Set<string>();
    const breakpoints = new Map<string, { kind: string; parameter: string }>();
    cdp.listeners.push((message) => {
      if (message.method === 'Debugger.scriptParsed') {
        const script = message.params as { scriptId: string; url: string; length: number };
        if (!script.url.startsWith('chrome-extension:') || script.length < 100000 || seen.has(script.url)) return;
        seen.add(script.url);
        installations.push((async () => {
          const { scriptSource } = await cdp.call('Debugger.getScriptSource', { scriptId: script.scriptId });
          const source = String(scriptSource);
          if (!source.includes('No pending trace found')) return;
          const hooks: {kind:string;parameter:string;offset:number}[] = [];
          for (const match of source.matchAll(/function (trace|endTrace)\(request[^)]*\) \{/g)) {
            hooks.push({kind:match[1] === 'endTrace' ? 'end' : 'start',parameter:'request',offset:match.index! + match[0].length});
          }
          if (hooks.length === 0) {
            const marker = source.indexOf('No pending trace found');
            const regionStart = Math.max(0, marker - 1200);
            const region = source.slice(regionStart, marker);
            const start = [...region.matchAll(/function [\w$]+\(([\w$]+),([\w$]+)\)\{return!/g)].at(-1);
            const end = [...region.matchAll(/function [\w$]+\(([\w$]+)\)\{let\{name:/g)].at(-1);
            assert(start && end, 'Cannot identify minified shared trace functions');
            for (const [kind,match] of [['start',start],['end',end]] as const) {
              hooks.push({kind,parameter:match[1],offset:regionStart + match.index! + match[0].indexOf('{') + 1});
            }
          }
          for (const hook of hooks) {
            const prefix = source.slice(0,hook.offset);
            const lineNumber = prefix.split('\n').length - 1;
            const columnNumber = hook.offset - prefix.lastIndexOf('\n') - 1;
            const result = await cdp.call('Debugger.setBreakpointByUrl', { url: script.url, lineNumber,columnNumber, condition: `${hook.parameter} && ${JSON.stringify(names)}.includes(${hook.parameter}.name)` });
            breakpoints.set(String(result.breakpointId),hook);
            log({ kind: 'installed', side: target.type, function: hook.kind, url: script.url, lineNumber,columnNumber });
          }
        })().catch((error) => log({ kind: 'observer-error', error: String(error) })));
      }
      if (message.method === 'Debugger.paused') {
        void (async () => {
          try {
            const frame = (message.params?.callFrames as { callFrameId: string; functionName: string }[])[0];
            const breakpoint = (message.params?.hitBreakpoints as string[]).map(id=>breakpoints.get(id)).find(Boolean);
            assert(breakpoint, 'Unexpected debugger pause');
            const p = breakpoint.parameter;
            const result = await cdp.call('Debugger.evaluateOnCallFrame', { callFrameId: frame.callFrameId, expression: `({name:${p}.name,id:${p}.id,tags:${p}.tags,data:${p}.data ? {success:${p}.data.success,reason:${p}.data.reason,variant:${p}.data.variant} : undefined})`, returnByValue: true });
            const request = (result.result as { value: unknown }).value;
            let ui: unknown;
            if (target.type === 'page') {
              const read = await cdp.call('Debugger.evaluateOnCallFrame', { callFrameId: frame.callFrameId, expression: snapshotExpression, returnByValue: true });
              ui = (read.result as { value: unknown }).value;
            }
            log({ kind: breakpoint.kind, side: target.type, request, ui });
          } finally { await cdp.call('Debugger.resume'); }
        })().catch((error) => log({ kind: 'observer-error', error: String(error) }));
      }
      if (message.method === 'Network.webSocketFrameSent') {
        try {
          const payload = JSON.parse((message.params?.response as { payloadData: string }).payloadData);
          if (payload.method === 'subscribe') log({ kind: 'ws-subscribe', side: target.type, subscription: payload.subscription?.type });
        } catch { /* Binary and unrelated frames are irrelevant. */ }
      }
    });
    await cdp.call('Debugger.enable'); await cdp.call('Network.enable');
  }
  await Promise.all(installations);
  assert(events().filter((e) => e.kind === 'installed').length >= 4, 'Shared UI/background trace breakpoints unavailable');
  writeFileSync(readyPath, JSON.stringify({ pid: process.pid }));
  const stop = () => { connections.forEach((c) => c.socket.close()); process.exit(); };
  process.on('SIGTERM', stop); setTimeout(stop, 10 * 60 * 1000);
}

const mode = process.argv[2];
if (mode === 'observe') await observe();
else if (mode === 'start') {
  writeFileSync(readyPath, '{}');
  const output = openSync(`${root}observer.log`, 'w');
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), 'observe'], { detached: true, stdio: ['ignore', output, output] }); child.unref();
  assert(child.pid); writeFileSync(pidPath, String(child.pid));
  await until(async () => JSON.parse(readFileSync(readyPath, 'utf8')).pid === child.pid, 'Observer failed to initialize', 15000);
} else if (mode === 'reload') {
  const cdp = await connect(await pageTarget()); await cdp.call('Page.reload'); cdp.socket.close();
  await until(async () => { try { return await evaluate('document.readyState === \'complete\' && !!document.querySelector(\'[data-testid=\"unlock-password\"]\')') === true; } catch { return false; } }, 'Reloaded unlock screen did not settle', 30000);
 } else if (mode === 'cache-expiry') {
  await until(async()=> await evaluate(`(() => {
    const m = globalThis.stateHooks.store.getState().metamask;
    if (m.isUnlocked) throw new Error('Cache expiry requires a locked wallet');
    const entries = [...Object.values(m.cachedUserDataByProvider ?? {}),...Object.values(m.cachedMarketDataByProvider ?? {})];
    return entries.every(entry=>Date.now()-entry.timestamp >= 31000);
  })()`) === true, 'Locked controller caches did not age past the Core preload guard', 40000);
} else if (mode === 'preload') {
  await until(async () => {
    const s = await evaluate(snapshotExpression) as { route: string; initialized: boolean; markets: number; prices: number; account: boolean; liveMarkets: boolean; livePrices: boolean };
    assert(!s.route.includes('perps'), 'Preload must precede Perps navigation');
    return s.initialized && s.markets > 0 && s.prices > 0 && s.account && s.liveMarkets && s.livePrices && events().some((e) => e.kind === 'ws-subscribe' && e.subscription === 'allMids') && events().some((e) => e.kind === 'end' && e.request?.name === names[0] && e.request.data?.success === true);
  }, 'Unlock did not preload live markets/account/prices and complete shared connection trace');
  writeFileSync(`${root}preload-state.json`, JSON.stringify(await evaluate(snapshotExpression), null, 2));
} else if (mode === 'lazy') {
  const cdp = await connect(await pageTarget()); const parsed: { scriptId: string; url: string }[] = [];
  cdp.listeners.push((m) => { if (m.method === 'Debugger.scriptParsed') parsed.push(m.params as { scriptId: string; url: string }); });
  await cdp.call('Debugger.enable');
  const loaded: string[] = [];
  for (const script of parsed.filter((s) => s.url.startsWith('chrome-extension:'))) {
    const source = String((await cdp.call('Debugger.getScriptSource', { scriptId: script.scriptId })).scriptSource);
    assert(!source.includes('function PerpsLayout(') && !/[\"']PerpsLayout[\"']/.test(source), 'Perps layout loaded before navigation'); loaded.push(script.url);
  }
  cdp.socket.close(); writeFileSync(`${root}pre-navigation-scripts.json`, JSON.stringify(loaded, null, 2));
  assert(readFileSync('ui/pages/routes/routes.component.tsx', 'utf8').match(/mmLazy\([\s\S]{0,120}perps-layout/), 'Perps layout must remain mmLazy');
} else if (mode === 'entry') {
  const context = process.argv[3];
  const name = process.argv[4] === 'market_list' ? names[4] : names[3];
  await until(async () => events().some((event) => {
    if (event.kind !== 'end' || event.request?.name !== name || event.request.data?.success !== true) return false;
    const start = events().find((e) => e.kind === 'start' && e.request?.name === name && e.request.id === event.request?.id && e.request.tags?.lifecycle_context === context);
    if (!start) return false;
    if (name === names[3]) assert(['empty','position','order'].includes(String(event.request.data?.variant)), 'Home success must include a documented Mobile variant');
    assert(event.ui && event.ui.rows.length > 0 && event.ui.markets > 0 && event.ui.prices > 0 && event.ui.liveMarkets && event.ui.livePrices && !event.ui.skeleton, 'Entry span ended without committed live rows'); return true;
  }), `Missing successful ${context} entry with rendered live rows`);
} else if (mode === 'resume') {
  const page = await pageTarget(); const cdp = await connect(page);
  const { targetId } = await cdp.call('Target.createTarget', { url: 'about:blank' });
  await cdp.call('Target.activateTarget', { targetId });
  await until(async () => (await evaluate('document.visibilityState')) === 'hidden', 'Extension did not become hidden', 5000);
  await cdp.call('Target.activateTarget', { targetId: page.id });
  await until(async () => (await evaluate('document.visibilityState')) === 'visible', 'Extension did not resume', 5000);
  await cdp.call('Target.closeTarget', { targetId }); cdp.socket.close();
} else if (mode === 'shared') {
  for (const name of names.slice(0, 3)) {
    await until(async()=> events().some((e) => e.kind === 'start' && e.request?.name === name) && events().some((e) => e.kind === 'end' && e.request?.name === name), `Missing shared trace pair: ${name}`, 15000);
  }
} else if (mode === 'regression') {
  const original = execFileSync('git', ['show', 'HEAD:shared/lib/trace.ts'], { encoding: 'utf8' });
  const current = readFileSync('shared/lib/trace.ts', 'utf8');
  assert.equal(current.split('\n').find((s) => s.includes('AccountOverviewPerpsTab =')), original.split('\n').find((s) => s.includes('AccountOverviewPerpsTab =')));
  const diff = execFileSync('git', ['diff', 'HEAD', '--', 'ui'], { encoding: 'utf8' });
  assert(!diff.split('\n').some((s) => /^[+-][^+-]/.test(s) && s.includes('AccountOverviewPerpsTab')), 'Existing tab trace changed');
} else if (mode === 'stop') {
  if (existsSync(pidPath)) process.kill(Number(readFileSync(pidPath, 'utf8')), 'SIGTERM');
} else throw new Error(`Unknown proof mode: ${mode}`);
