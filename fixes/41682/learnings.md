# Learnings — TAT-2830

- Investigation was fast (~2 min) — the screenshot clearly showed two bugs and `grep` for "Reverse position" led straight to the modal file. The close-position-modal provided the exact pattern to follow.
- The `record-window.sh` script consistently failed to capture video (`WARN: output file not created`). Window PID resolution may not work for this Chromium setup. Screenshots from the recipe runner were the fallback.
- HyperLiquid API rate limiting (429) caused recipe failures mid-run. A 30s cooldown was sufficient to recover. Recipes that make multiple RPC calls should anticipate transient rate limits.
- The `Modal` component renders the wrapper div in DOM even when transitioning open — `wait_for` on the modal testID resolves to "hidden". Waiting for a child element (e.g. the cancel button) works reliably.
