/**
 * Read-only CDP probe for TAT-3763.
 *
 * Reads the Perps order-entry balance-percent pill (`balance-percent-input`) and
 * the slider's aria-valuenow, and writes them to a JSON file the recipe asserts
 * on. Purely observational — it never writes to the DOM, the store, or a
 * controller.
 *
 * Usage: node <this> <out.json>
 */
const fs = require('fs');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const CDP_PORT = Number(process.env.CDP_PORT || 7665);
const OUT_PATH = process.argv[2];

if (!OUT_PATH) {
  console.error('usage: probe-percent-input.js <out.json>');
  process.exit(2);
}

const EXPRESSION = `(() => {
  const wrapper = document.querySelector('[data-testid="balance-percent-input"]');
  const input = wrapper
    ? (wrapper.tagName === 'INPUT' ? wrapper : wrapper.querySelector('input'))
    : null;
  const slider = document.querySelector('[data-testid="amount-slider"] input[type="range"]');
  const value = input ? input.value : null;
  const sliderValueNow = slider ? slider.getAttribute('aria-valuenow') : null;
  return {
    href: location.href,
    percentValue: value,
    percentIsInteger: value === null ? null : /^\\d+$/u.test(value),
    percentClientWidth: input ? input.clientWidth : null,
    percentScrollWidth: input ? input.scrollWidth : null,
    percentIsClipped: input ? input.scrollWidth > input.clientWidth : null,
    sliderValueNow,
    sliderIsOnStepGrid:
      sliderValueNow === null ? null : /^\\d+$/u.test(sliderValueNow),
  };
})()`;

function httpGet(urlPath) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: '127.0.0.1', port: CDP_PORT, path: urlPath }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      })
      .on('error', reject);
  });
}

async function main() {
  const targets = await httpGet('/json/list');
  const target = targets.find(
    (entry) => entry.type === 'page' && entry.url.includes('home.html'),
  );
  if (!target) {
    throw new Error('no extension home.html CDP target found');
  }

  const socket = new WebSocket(target.webSocketDebuggerUrl, {
    perMessageDeflate: false,
  });
  await new Promise((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });

  socket.send(
    JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: EXPRESSION,
        returnByValue: true,
        awaitPromise: true,
      },
    }),
  );

  const message = await new Promise((resolve) => {
    socket.on('message', (raw) => {
      const parsed = JSON.parse(raw);
      if (parsed.id === 1) {
        resolve(parsed);
      }
    });
  });
  socket.close();

  if (message.result?.exceptionDetails) {
    throw new Error(JSON.stringify(message.result.exceptionDetails));
  }

  const probe = message.result.result.value;
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(probe, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(probe)}\n`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
