| # | Author | File | Triage | Action |
|---|--------|------|--------|--------|
| 1 | cursor[bot] | ui/pages/home/home.component.js:255 | REAL | Already fixed in branch: `checkLastVisitedPerpsRoute` now always clears the stored route after inspection. |
| 2 | cursor[bot] | ui/store/actions.ts | REAL | Already fixed in branch: `setLastVisitedPerpsRoute` logs internal failures instead of dispatching a user-visible warning. |
| 3 | cursor[bot] | ui/pages/home/home.component.js:297 | REAL | Already fixed in branch: in-app Perps exits are marked and suppress resume redirects. |
| 4 | cursor[bot] | ui/pages/perps/perps-layout.tsx:123 | REAL | Already fixed in branch: the in-app leave marker is set from a layout-effect cleanup. |
| 5 | cursor[bot] | ui/pages/home/home.component.js | REAL | Already fixed in branch: route validation strips query/hash suffixes before checking the `/perps` path. |
| 6 | cursor[bot] | ui/pages/home/home.component.js | REAL | Already fixed in branch: pending redirects suppress Perps resume only when applicable to the current environment. |
| 7 | cursor[bot] | app/scripts/controllers/perps/perps-stream-bridge.ts | REAL | Already fixed in branch: market preload failures are caught for both sync throws and async rejections. |
| 8 | aganglada | app/scripts/controllers/app-state-controller.ts:1809 | REAL | Make AppStateController storage/action generic so other teams can reuse the route-resume primitive. |
| 9 | abretonc7s | conversation | OUT_OF_SCOPE | Automated worker report; no requested code change. |
| 10 | abretonc7s | conversation | OUT_OF_SCOPE | Automated pr-complete report; no requested code change. |

Recipe re-validation: PASS — trusted local recipe rerun after clean rebuild and sidepanel relaunch; 11/11 nodes passed.
