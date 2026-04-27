# Extracted Acceptance Criteria

Source: PR body manual testing steps plus linked TAT-2802 ticket description.

1. Trade/new order screen auto-focuses the primary USD size input on open.
2. Numeric inputs auto-select their current value on focus so typing replaces it, including size, leverage, modal, TP/SL, and percent inputs.
3. Empty or below-minimum market order size keeps submit disabled and shows `Order size must be at least $10`.
4. Valid market order size at or above the $10 minimum enables submit and restores contextual order copy such as `Open Long ETH`.
5. Switching to Limit order type auto-focuses the limit price input.
6. Add-margin and remove-margin screens auto-focus their margin amount input.
7. TP/SL configuration auto-focuses the TP trigger price input.
8. Position close screen auto-focuses the Close Position button.
9. Enter submits from primary inputs only when submit is enabled; disabled, Shift+Enter, and IME composition Enter do not submit.
10. Leverage input auto-selects on focus and ArrowUp/ArrowDown step leverage by 1, clamped to min/max leverage.
11. Submit path does not hang: in-progress toast transitions to success after the perps RPC settles, and the market detail page shows the resulting position without stuck `Submitting your trade` toasts.
12. Tab key order remains logical across the affected order-entry surfaces.
