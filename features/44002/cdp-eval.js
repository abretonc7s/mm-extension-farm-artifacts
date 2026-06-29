#!/usr/bin/env node
/* Minimal CDP Runtime.evaluate helper for step-by-step recipe validation.
 * Usage: node cdp-eval.js <cdpPort> '<jsExpression>'
 * Targets the home.html (fullscreen) page. Prints the evaluated value as JSON.
 */
const http = require('http');
const WebSocket = require('ws');

const port = process.argv[2] || '7665';
const expr = process.argv[3];
if (!expr) {
  console.error('usage: node cdp-eval.js <port> <expression>');
  process.exit(64);
}

http
  .get(`http://127.0.0.1:${port}/json`, (res) => {
    let data = '';
    res.on('data', (c) => (data += c));
    res.on('end', () => {
      let targets;
      try {
        targets = JSON.parse(data);
      } catch (e) {
        console.error('bad /json response');
        process.exit(2);
      }
      const page = targets.find(
        (t) => t.type === 'page' && /home\.html/u.test(t.url),
      );
      if (!page) {
        console.error('no home.html page target');
        process.exit(2);
      }
      const ws = new WebSocket(page.webSocketDebuggerUrl);
      ws.on('open', () => {
        ws.send(
          JSON.stringify({
            id: 1,
            method: 'Runtime.evaluate',
            params: {
              expression: expr,
              awaitPromise: true,
              returnByValue: true,
            },
          }),
        );
      });
      ws.on('message', (m) => {
        const r = JSON.parse(m.toString());
        if (r.id === 1) {
          if (r.result && r.result.exceptionDetails) {
            console.error(
              'EVAL EXCEPTION:',
              JSON.stringify(r.result.exceptionDetails),
            );
            ws.close();
            process.exit(3);
          }
          const value = r.result && r.result.result && r.result.result.value;
          console.log(typeof value === 'string' ? value : JSON.stringify(value));
          ws.close();
          process.exit(0);
        }
      });
      ws.on('error', (e) => {
        console.error('ws error', e.message);
        process.exit(2);
      });
    });
  })
  .on('error', (e) => {
    console.error('http error', e.message);
    process.exit(2);
  });
