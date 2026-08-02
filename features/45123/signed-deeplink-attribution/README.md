# PR 45123 signed Perps deeplink attribution evidence

This bundle records the live Extension proof for
MetaMask/metamask-extension#45123.

## Immutable inputs

- Product: `MetaMask/metamask-extension@38b856d073c9dee261ae094bc2427c92643b9f75`
- MetaMask runner: `MetaMask/experimental-metamask-harness@378a8806614b6a932473b6aaf7fe24c4bfca02ba`
- Recipe runtime: `@farmslot/recipe-harness@0.12.1`
- Browser: Chrome for Testing 147.0.7727.15

## Result

- 53 passed, 0 failed in 28,547 ms.
- The full-run H.264 recording is 28.67 seconds at 414×720.
- A valid signed, allowlisted UTM set reached exactly one `Perp Screen Viewed`
  event with the expected destination properties.
- Unsigned, tampered, malformed, and invalid-signature UTM candidates reached
  no destination event.
- A signed key outside the allowlist was ignored.
- A signed overlong value could not replace the last valid session attribution.

The workflow uses real external `https://link.metamask.io` ingress, the real
deeplink interstitial, real destination rendering, and counted Segment events.
Start with [the report](report.md), then inspect the
[summary](summary.json), [trace](trace.json),
[parameterized recipe](recipe-template.json), and
[full-run video](videos/full-run.mp4).

## Diagnostics

The non-blocking diagnostics retain seven 404 resource messages produced by the
seven browser-intercepted external links and one unrelated background chain-poll
warning. All seven ingress actions, interstitial assertions, destinations, and
analytics boundaries passed.

## Scope boundary

The build used an ephemeral test signing key configured for this proof. The
private key is not present in this bundle. This run proves Extension parsing,
signature enforcement, allowlisting, value validation, destination propagation,
and analytics consumption; it does not prove the production link-signer admin
tool.

Developer-local absolute paths were replaced with stable placeholders before
publication. No event, assertion, result, status, URL, or source revision was
changed. `SHA256SUMS` covers every published evidence file except itself.
