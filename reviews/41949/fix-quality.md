# Fix Quality

## Best approach

The implementation is pragmatic and mostly minimal:
- Native `<form>` on the order-entry page is the right web primitive for Enter-to-submit.
- `type="button"` on nested button-like controls avoids accidental form submission.
- Awaiting the perps RPC before navigation is the correct fix for the stuck in-progress toast race.
- Guarding malformed JSON-RPC error messages in `metaRPCClientFactory` is a narrow shared-client hardening change and has targeted regression coverage.

## Would not ship

No code-level blocker found for the core submit/toast/RPC fixes.

Product/AC gaps to surface:
- The linked ticket asks for a contextual empty-size placeholder, but the current live value remains `0.00` (`amount-input.tsx:70`, `amount-input.tsx:338`). If the ticket AC is still binding, this needs a follow-up or explicit product acceptance that button copy replaces placeholder copy.
- Live Tab traversal went size input -> token input -> amount slider. It is deterministic but not the ticket's example of size -> leverage -> TP/SL. This may be acceptable, but should be explicitly accepted because the PR title includes Tab navigation.

## Test quality

Strong coverage for:
- autofocus/select-on-focus across the changed controls,
- market min-order disabled copy,
- Enter submit positive and disabled paths,
- delayed navigation until `perpsPlaceOrder` settles,
- malformed RPC error messages rejecting and clearing pending requests.

Gaps:
- No unit-level assertion for Tab order.
- Modal Enter tests cover valid and invalid paths, but not Shift+Enter or IME composition for all modal inputs.
- Placeholder AC is not covered because current implementation intentionally keeps `0.00`.

## Brittleness

No import-time or frozen-value brittleness found. The leverage key handling correctly reads from the DOM input to avoid stale closure batching on rapid ArrowUp/ArrowDown presses.
