# PR 45119 Perps analytics lifecycle evidence

This bundle records the live Extension proof for the analytics-contract recovery
in MetaMask/metamask-extension#45119.

## Immutable inputs

- Product: `MetaMask/metamask-extension@d5e5a0184f01dd5fb099313060f99399327d9208`
- Recipe library: `MetaMask/experimental-metamask-recipe-perps@c7cd11526ba85c2601463ede7f8cdf9697e8bde0`
- MetaMask runner: `MetaMask/experimental-metamask-harness@fea899ce2716fd54cced5b58652025930d42fbf9`
- Recipe runtime: `@farmslot/recipe-harness@0.11.0`

## Result

- 201 passed, 0 failed in 136,200 ms.
- No runtime recovery or mutation occurred.
- All ten mutating setup and cleanup nodes reported `requested: testnet`,
  `isTestnet: true`, and zero matching orders and positions after convergence.
- Assertions cover exact event totals, required properties, visible UI
  postconditions, abandonment, and displayed-error paths.

Start with [the report](report.md), then inspect [the summary](summary.json),
[trace](trace.json), [recipe resolution](recipe-resolution.json), and
[artifact manifest](artifact-manifest.json). `SHA256SUMS` covers every published
evidence file except itself.

Developer-local absolute paths were replaced with stable placeholders before
publication. No event, assertion, result, status, or source revision was changed.

## Scope boundary

The attributed-screen flow navigates inside an already-running Extension. It
proves downstream analytics consumption, not external signed-deeplink parsing,
signature verification, or canonicalization.
