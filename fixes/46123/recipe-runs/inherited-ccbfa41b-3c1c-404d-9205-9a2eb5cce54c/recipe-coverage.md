# Acceptance evidence

| AC | Claim | Mode | Nodes | Primary evidence | Result |
| --- | --- | --- | --- | --- | --- |
| AC1 | Unlock starts initialization, controller caches and broad prices before Perps navigation | state | ac1-unlock, ac1-preload | recorded-recipe-run/observed-traces.jsonl | PROVEN |
| AC2 | PerpsLayout remains lazy | state | ac2-lazy | pre-navigation-scripts.json | PROVEN |
| AC3 | Documented Mobile names route through shared tracing | trace | ac3-shared, ac3-browser-trace | recorded-recipe-run/observed-traces.jsonl | PROVEN |
| AC4 | Cold, warm and background-resume context remain distinct | trace | ac4-cold-trace, ac4-warm-trace, ac4-resume-trace | recorded-recipe-run/observed-traces.jsonl | PROVEN |
| AC5 | Entry completes with committed live market rows | mixed | ac5-rows, ac5-state, ac4-cold-trace | recorded-recipe-run/observed-traces.jsonl and screenshots/evidence-ac5-live-markets.png | PROVEN |
| AC6 | AccountOverviewPerpsTab unchanged | state | ac6-regression | recorded-recipe-run/trace.json | PROVEN |

27/27 nodes pass in recorded-recipe-run/summary.json. Provenance passes. Screenshots use capture-helper snapshot. Remote Sentry ingestion and unbiased latency are not proven; local shared tracing is proven.
