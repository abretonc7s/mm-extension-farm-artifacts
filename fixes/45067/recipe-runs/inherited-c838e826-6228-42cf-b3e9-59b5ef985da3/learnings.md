# Learnings — TAT-3490

- The biggest finding came from comparing telemetry emitters, not from reading failure paths: the
  perps controller and the extension UI both emit `Perp Withdrawal Transaction` /
  `Perp Order Cancel Transaction`, while mobile emits neither. Checking who else emits an event is
  worth doing before trusting a "success rate" number — `p / (p + 2(1-p))` maps a true 78% onto the
  ticket's 63.9%.
- `perpsValidateWithdrawal` looked like a real server-side guard from the extension side; the
  provider implementation is a stub returning `{ isValid: true }`. Reading the compiled
  `node_modules/@metamask/perps-controller` was the only way to see that, and it changed the fix.
- `ORDER_UNKNOWN_COIN` is returned as a failed *result*, not thrown, so the existing
  `withAutoInit` retry wrapper could never have seen it. Verifying whether an error propagates as a
  throw or a value before extending a retry path saved a fix that would have been dead code.
- Recipe targeting: `perps-cancel-order-modal` lives on the `mm-modal` wrapper, which has zero
  height because the dialog renders through a portal — `ui.wait_for` on it can never pass. Asserting
  on a child that has real geometry (`perps-cancel-order-button`) is the reliable pattern.
- Runtime friction: `mm-harness run` with healing enabled relaunched a browser that took over CDP
  7666 with a different extension id, and `metamask.wallet.select_account` fails its own read-back
  on the first attempt after a fresh launch. Running `launch --verify` first, then `run --heal off`
  with the account pre-selected, made the runs deterministic.
