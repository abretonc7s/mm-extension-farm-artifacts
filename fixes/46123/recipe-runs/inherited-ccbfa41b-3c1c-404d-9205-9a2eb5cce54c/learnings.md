# Learnings

- Mobile's documented Home CUF starts at mount, waits for orders as well as positions and markets, and uses `Perps Entry To Live Market List`. Market-browser timing has its own existing name.
- Live snapshot provenance must follow the data rendered. Persisted seeds and a price for an unrelated symbol cannot complete readiness. React Compiler expects immutable snapshots.
- Cancellation and ownership tests caught failures that happy-path navigation missed, including visibility listener ordering, failed-ping cleanup and window-close disconnect grace.
- LavaMoat fetch.bind-only endowments caused a native receiver error before HTTP. A bounded reproduction and explicit fetch/btoa overrides restored the production runtime without replacing credentials.
- Reuse the preserved CDP profile; --launch-existing-dist creates a separate validation profile. Freeze recipe helpers before execution, and derive coverage from the working diff rather than main...HEAD while changes are uncommitted.
