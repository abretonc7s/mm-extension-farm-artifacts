# Comments Report

Total comments: 16 (3 REAL, 0 FALSE POSITIVE, 13 OUT OF SCOPE)

Fix commit SHA: 0ad852a4326102a92c3338c164e837a583de7c50 (no new tracked code changes were required in this run; branch was already even with origin)

Merge-main status from step 3: clean/already up to date.

Recipe re-validation result: PASS (16/16). The inherited recipe initially failed because it still asserted universal white backgrounds; the task artifact recipe was updated to validate the current per-asset PR acceptance criteria, then passed.

Files changed in PR diff:
- app/scripts/controllers/app-state-controller.test.ts
- app/scripts/controllers/app-state-controller.ts
- app/scripts/controllers/metametrics-controller.ts
- ui/components/app/perps/perps-token-logo/perps-asset-bg-config.ts
- ui/components/app/perps/perps-token-logo/perps-token-logo.test.tsx
- ui/components/app/perps/perps-token-logo/perps-token-logo.tsx

| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | ui/components/app/perps/perps-token-logo/perps-token-logo.tsx | REAL | Already fixed on the branch by replacing universal bg-white with per-asset theme-aware background ha |
| 2 | cursor[bot] | app/scripts/controllers/metametrics-controller.ts | REAL | Already fixed on the branch by preserving lodash deep merge semantics for accumulated MetaMetrics fr |
| 3 | cursor[bot] | ui/components/app/perps/perps-token-logo/perps-asset-bg-config.ts | REAL | Already fixed on the branch by removing RESOLV and USUAL from the light-background set and covering  |
| 4 | github-actions[bot] | conversation | OUT_OF_SCOPE | CLA status only; no code change requested. |
| 5 | metamaskbotv2[bot] | conversation | OUT_OF_SCOPE | Informational build/codeowner artifact comment; no code change requested. |
| 6 | abretonc7s | conversation | OUT_OF_SCOPE | Informational worker/validation summary; no code change requested. |
| 7 | metamaskbotv2[bot] | conversation | OUT_OF_SCOPE | Informational build/codeowner artifact comment; no code change requested. |
| 8 | metamaskbotv2[bot] | conversation | OUT_OF_SCOPE | Informational build/codeowner artifact comment; no code change requested. |
| 9 | metamaskbotv2[bot] | conversation | OUT_OF_SCOPE | Informational build/codeowner artifact comment; no code change requested. |
| 10 | abretonc7s | conversation | OUT_OF_SCOPE | Informational worker/validation summary; no code change requested. |
| 11 | metamaskbotv2[bot] | conversation | OUT_OF_SCOPE | Informational build/codeowner artifact comment; no code change requested. |
| 12 | abretonc7s | conversation | OUT_OF_SCOPE | Informational worker/validation summary; no code change requested. |
| 13 | metamaskbotv2[bot] | conversation | OUT_OF_SCOPE | Informational build/codeowner artifact comment; no code change requested. |
| 14 | abretonc7s | conversation | OUT_OF_SCOPE | Informational worker/validation summary; no code change requested. |
| 15 | sonarqubecloud[bot] | conversation | OUT_OF_SCOPE | CI quality gate status only; no code change requested. |
| 16 | metamaskbotv2[bot] | conversation | OUT_OF_SCOPE | Informational build/codeowner artifact comment; no code change requested. |

## Reply/Resolution Status

- Inline review threads 3242236086, 3245396592, and 3245396599 already had fix replies and were resolved/outdated before this run; no duplicate replies were posted.
- Conversation comments were informational CI/build/worker-summary comments and did not require reply threads.
