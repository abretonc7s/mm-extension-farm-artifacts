# PR Review: #42645

**Verdict:** Looks good overall. Two minor nitpicks in `perps-fill-tag.tsx` (see line comments) — please address before merge to keep the file tight and post-`6caf2975`-accurate.

Geositta's nested-button feedback is resolved and pinned by a dedicated accessibility test. `yarn lint:tsc` PASS · 50/50 affected unit tests PASS · smoke recipe PASS (9/9 nodes; wallet-home perps tab + activity page render with 0 `perps-fill-tag-*` testids on standard fills — AC6 proven; ACs 1–5/7 covered by unit tests since current account has no TP/SL/Liq/ADL fills).

**Recommendation:** REQUEST_CHANGES — nitpick cleanup encouraged before merge.
