# Learnings — TAT-2893

- **Mobile is the source of truth for perps validation logic.** The fix was a direct port of `usePerpsOrderValidation.ts:92-100` from mobile. Reading the mobile-extension map first would have made the root cause obvious immediately.
- **Recipe iteration was the biggest time sink.** The order entry page had an existing ETH position which replaced Long/Short CTAs with Modify/Close buttons. Recipe had to use direct hash navigation (`eval_sync` with `window.location.hash`) instead of clicking through market detail.
- **`ext_check_dom` is more reliable than `eval_sync` + JSON.stringify for boolean assertions.** Type coercion between recipe assertion `eq true` and stringified `"true"` caused false failures. Use `ext_check_dom` for DOM state checks and `wait_for` with expressions for boolean conditions.
- **`data-testid` is on wrapper divs, not inputs.** The `amount-input-field` testID is on a `<div>`, not the `<input>`. The recipe runner's `set_input` auto-falls back to child `input`, but `clear_keypad` does not — use `set_input` directly instead.
- **ESLint `no-nested-ternary` requires extracting variables** for button text logic. Extract a `resolvedButtonText` variable before JSX rather than nesting ternaries inline.
