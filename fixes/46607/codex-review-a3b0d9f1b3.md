2026-09-24T07:20:09.658684Z ERROR codex_core::session::session: failed to load skill /Users/deeeed/.agents/skills/canvas/SKILL.md: missing field `description`
OpenAI Codex v0.155.1
--------
workdir: /Users/deeeed/dev/metamask/metamask-extension-6
model: gpt-6-sol
provider: codex-lb
approval: never
sandbox: workspace-write [workdir, /tmp, $TMPDIR]
reasoning effort: high
reasoning summaries: none
session id: 01a0d249-3a16-7f90-b2a4-125297fe4294
--------
user
changes against 'origin/main'
warning: clamping SessionEnd hook timeout to 3s in /Users/deeeed/.codex/plugins/cache/omc/oh-my-claudecode/5.5.0/hooks/hooks.json
warning: running async SessionEnd hook synchronously in /Users/deeeed/.codex/plugins/cache/omc/oh-my-claudecode/5.5.0/hooks/hooks.json
warning: clamping SessionEnd hook timeout to 3s in /Users/deeeed/.codex/plugins/cache/omc/oh-my-claudecode/5.5.0/hooks/hooks.json
warning: running async SessionEnd hook synchronously in /Users/deeeed/.codex/plugins/cache/omc/oh-my-claudecode/5.5.0/hooks/hooks.json
2026-09-24T07:20:09.939580Z ERROR codex_core::session::session: failed to load skill /Users/deeeed/.agents/skills/canvas/SKILL.md: missing field `description`
warning: clamping SessionEnd hook timeout to 3s in /Users/deeeed/.codex/plugins/cache/omc/oh-my-claudecode/5.5.0/hooks/hooks.json
warning: running async SessionEnd hook synchronously in /Users/deeeed/.codex/plugins/cache/omc/oh-my-claudecode/5.5.0/hooks/hooks.json
warning: clamping SessionEnd hook timeout to 3s in /Users/deeeed/.codex/plugins/cache/omc/oh-my-claudecode/5.5.0/hooks/hooks.json
warning: running async SessionEnd hook synchronously in /Users/deeeed/.codex/plugins/cache/omc/oh-my-claudecode/5.5.0/hooks/hooks.json
2026-09-24T07:20:10.693566Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer error=\"invalid_token\", error_description=\"Authentication failed. The provided bearer token is invalid, expired, or no longer recognized by the server. To resolve: clear authentication tokens in your MCP client and reconnect. Your client should automatically re-register and obtain new tokens.\", resource_metadata=\"https://mcp.mixpanel.com/.well-known/oauth-protected-resource/mcp\"" })
2026-09-24T07:20:10.890504Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer realm=\"OAuth\", resource_metadata=\"https://mcp.sentry.dev/.well-known/oauth-protected-resource/mcp\"" })
2026-09-24T07:20:10.952542Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer error=\"invalid_token\", error_description=\"Authentication failed. The provided bearer token is invalid, expired, or no longer recognized by the server. To resolve: clear authentication tokens in your MCP client and reconnect. Your client should automatically re-register and obtain new tokens.\", resource_metadata=\"https://mcp.mixpanel.com/.well-known/oauth-protected-resource/mcp\"" })
2026-09-24T07:20:12.307314Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer error=\"invalid_token\", error_description=\"Authentication failed. The provided bearer token is invalid, expired, or no longer recognized by the server. To resolve: clear authentication tokens in your MCP client and reconnect. Your client should automatically re-register and obtain new tokens.\", resource_metadata=\"https://mcp.mixpanel.com/.well-known/oauth-protected-resource/mcp\"" })
2026-09-24T07:20:39.665599Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when Client(HttpRequest(HttpRequest("http/request failed: error sending request for url (https://mcp.sentry.dev/mcp)")))
exec
/opt/homebrew/bin/zsh -lc 'cat /Users/deeeed/.agents/skills/unslop/SKILL.md | head -100; git status --short; git diff --stat ca97b63ed467e342de353b98bcd186282730f01d; git diff --name-only ca97b63ed467e342de353b98bcd186282730f01d' in /Users/deeeed/dev/metamask/metamask-extension-6
 succeeded in 452ms:
---
name: unslop
description: Cut AI tells from any writing. Must always apply. Use when Arthur says unslop, anti-slop, deslop, or runs /unslop.
---

# Unslop

Source: https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md

Edit text to remove AI patterns and add human voice. Always apply.

## Process

1. Scan for the patterns below.
2. Rewrite. Preserve meaning, match intended tone.
3. Add soul (see next section).
4. Self-audit: "What makes this obviously AI generated?" Fix remaining tells.

## Adding soul

Removing patterns is half the job. Sterile, voiceless writing is just as obvious.

- **Have opinions.** React to facts instead of neutrally listing pros and cons.
- **Vary rhythm.** Short sentences. Then longer ones that take their time. Mix it up.
- **Acknowledge complexity.** "Impressive but also kind of unsettling" beats "impressive."
- **Use "I" when it fits.** First person isn't unprofessional.
- **Let some mess in.** Perfect structure looks machine-made.
- **Be specific.** Not "this is concerning" but "there's something unsettling about agents churning away at 3am."

## Patterns to detect and fix

### Content

1. **Puffery.** "pivotal moment", "testament to", "evolving landscape", "setting the stage for", "indelible mark", "deeply rooted". Cut puffery, state what happened.
2. **Name-dropping.** Listing media outlets without context. Pick one, say what was said.
3. **Superficial -ing phrases.** "highlighting...", "ensuring...", "reflecting...", "showcasing...", "fostering...". Delete or expand with real sources.
4. **Promotional language.** "nestled", "vibrant", "breathtaking", "groundbreaking", "renowned", "stunning", "must-visit". Use neutral descriptions.
5. **Vague attributions.** "Experts believe", "Industry reports suggest", "Some critics argue". Name the source or delete.
6. **Formulaic challenges.** "Despite challenges... continues to thrive." Replace with specific facts.

### Language

7. **AI vocabulary.** Additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape (abstract), pivotal, showcase, tapestry (abstract), testament, underscore, vibrant. Replace with plain words.
8. **Fancy ways to say "is".** "serves as", "stands as", "boasts", "features". Just say "is" or "has".
9. **"Not just X, but Y."** State the point directly instead.
10. **Rule of three.** Forcing ideas into groups of three. Use the natural number.
11. **Synonym cycling.** Protagonist, main character, central figure, hero all in one paragraph. Pick one, repeat it.
12. **False ranges.** "from X to Y" where X and Y aren't on a meaningful scale. List topics directly.

### Style

13. **Em dash overuse.** Avoid em dashes entirely. Use periods or commas only (no parentheses, no en dashes, no hyphen-as-dash substitutes). Em dashes are an AI tell, and reaching for parentheses instead just trades one tell for another. If a thought needs separation, end the sentence or use a comma.
14. **Colon overuse.** Colons are fine before a list or example. Not as mid-sentence connectors. "If you're coming from traditional automation: instead of registering event handlers, you describe conditions" adds nothing with the colon. Rewrite to let the point stand on its own without comparison framing. "Describing when the scheduler should fire works best as plain English." Same meaning, no crutch punctuation.
15. **Boldface overuse.** Don't bold every proper noun or acronym.
16. **Inline-header lists.** The tell is a bold label and colon that restates the line: "**Performance:** Performance improved...". Convert those to prose. A bold lead-in that ends in a period, names the item, and is followed by genuinely new detail ("**Schema in TypeScript.** Tables live in one file.") is fine, not a tell.
17. **Title case headings.** Use sentence case.
18. **Decorative emojis.** Remove from headings and bullets.
19. **Curly quotes.** Replace with straight quotes.

### Communication artifacts

20. **Chatbot phrases.** "I hope this helps!", "Let me know if...", "Of course!", "Certainly!", "Found the smoking gun!" Remove.
21. **Cutoff disclaimers.** "While specific details are limited..." Find sources or remove.
22. **Sycophantic tone.** "Great question! You're absolutely right!" Respond directly.

### Filler

23. **Filler phrases.** "In order to" becomes "To". "Due to the fact that" becomes "Because". "It is important to note that" gets deleted.
24. **Excessive hedging.** "could potentially possibly be argued that it might" becomes "may".
25. **Generic conclusions.** "The future looks bright." State specific plans or facts.

### Jargon

26. **Abstract metaphor nouns.** Substrate, wedge, vector, locus, vantage, nexus, primitive (as noun), harness (as metaphor), surface (as in "API surface"), bedrock, scaffolding (as metaphor), modality, paradigm, gold-plating, ratchet (as metaphor), evacuate (for moving code), endgame, north star, flywheel. These read as technical but usually have a plainer concrete word. "Substrate" becomes "base". "Wedge in" becomes "add". "Vector" becomes "way" or "method". "Gold-plating" becomes "more than the job needs". "Ratchet" becomes the mechanism's real name or "a limit that only tightens". "Evacuate" becomes "move out". "Endgame" becomes "the last phase". Pick the concrete word.

### Plain speech

27. **Say what it does, not how it feels.** "the database stays close at hand", "SQL you can read", "types that follow your schema" name a feeling. The fix names the mechanism or a number: "`.toSQL()` returns the exact string sent to the database", "a column rename fails the build". Ask what the sentence tells the reader to do or know, then write that. If you can't restate it as a concrete instruction, fact, or number, cut it. One more check: if the sentence could appear unchanged in another project's docs, it says nothing about this one. Cut it.
28. **Shorten or split dense sentences.** If the reader has to backtrack to parse a sentence, break it in two or drop clauses. One idea per sentence.
29. **Active voice.** Prefer it. Catch "is/are/was/were + past participle" and name the actor: "queries are validated" becomes "the compiler validates queries", "the file is parsed by the loader" becomes "the loader parses the file". Passive is fine only when the actor is unknown or genuinely doesn't matter.
30. **Cut adverbs, or use a stronger verb.** "runs quickly" becomes "is fast" or the number. "significantly improves" becomes the measured delta. An adverb propping up a weak verb means the verb is wrong.
31. **Prefer the plain word.** "utilize" becomes "use", "leverage" becomes "use", "facilitate" becomes "help", "numerous" becomes "many", "in the event that" becomes "if". The fancier synonym is rarely clearer.
 shared/constants/perps-events.ts                   |  2 --
 test/mocks/metamask-perps-controller.js            |  1 -
 .../perps-market-balance-actions.test.tsx          |  8 ++++----
 .../perps-market-balance-actions.tsx               |  6 +++---
 .../perps-support-learn.test.tsx                   | 24 ++++++++++++++++++++++
 .../perps-support-learn/perps-support-learn.tsx    |  6 +++---
 ui/pages/perps/market-list/index.test.tsx          |  7 +++++++
 ui/pages/perps/market-list/index.tsx               |  2 +-
 ui/pages/perps/perps-market-detail-page.test.tsx   | 15 +++++++++++++-
 ui/pages/perps/perps-market-detail-page.tsx        | 14 ++++++-------
 ui/pages/perps/perps-order-entry-page.test.tsx     |  6 +++++-
 ui/pages/perps/perps-order-entry-page.tsx          |  2 +-
 12 files changed, 69 insertions(+), 24 deletions(-)
shared/constants/perps-events.ts
test/mocks/metamask-perps-controller.js
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx
ui/components/app/perps/perps-support-learn/perps-support-learn.test.tsx
ui/components/app/perps/perps-support-learn/perps-support-learn.tsx
ui/pages/perps/market-list/index.test.tsx
ui/pages/perps/market-list/index.tsx
ui/pages/perps/perps-market-detail-page.test.tsx
ui/pages/perps/perps-market-detail-page.tsx
ui/pages/perps/perps-order-entry-page.test.tsx
ui/pages/perps/perps-order-entry-page.tsx

exec
/opt/homebrew/bin/zsh -lc 'git diff ca97b63ed467e342de353b98bcd186282730f01d --; find shared test ui -name AGENTS.md -o -name AGENTS.override.md | sort; ls -la AGENTS*' in /Users/deeeed/dev/metamask/metamask-extension-6
 succeeded in 339ms:
diff --git c/shared/constants/perps-events.ts w/shared/constants/perps-events.ts
index 7fa9a899c9..31d414c9e1 100644
--- c/shared/constants/perps-events.ts
+++ w/shared/constants/perps-events.ts
@@ -22,8 +22,6 @@ export const PERPS_EVENT_PROPERTY = {
   ...CONTROLLER_PERPS_EVENT_PROPERTY,
   /** @deprecated Prefer ORDER_SIZE or POSITION_SIZE from the controller contract. */
   SIZE: 'size',
-  /** Extension UI interaction property (button identity). */
-  BUTTON_TYPE: 'button_type',
   /** Extension market-list filter property. */
   MARKET_CATEGORY_FILTER: 'market_category_filter',
   /** Extension close-all summary property. */
diff --git c/test/mocks/metamask-perps-controller.js w/test/mocks/metamask-perps-controller.js
index f599804ede..1bf47537c1 100644
--- c/test/mocks/metamask-perps-controller.js
+++ w/test/mocks/metamask-perps-controller.js
@@ -43,7 +43,6 @@ const mockPerpsEventPropertyKeys = {
   SOURCE: 'source',
   HAS_PERP_BALANCE: 'has_perp_balance',
   BUTTON_LOCATION: 'button_location',
-  BUTTON_TYPE: 'button_type',
   OPEN_POSITION: 'open_position',
   OPEN_ORDER: 'open_order',
   MAX_SLIPPAGE_PCT: 'max_slippage_pct',
diff --git c/ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx w/ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx
index cc136d6959..8c193c83b2 100644
--- c/ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx
+++ w/ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx
@@ -260,7 +260,7 @@ describe('PerpsMarketBalanceActions', () => {
         expect.objectContaining({
           [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
             PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-          [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+          [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
             PERPS_EVENT_VALUE.BUTTON_CLICKED.TUTORIAL,
           [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
             PERPS_EVENT_VALUE.BUTTON_LOCATION.PERPS_HOME,
@@ -316,7 +316,7 @@ describe('PerpsMarketBalanceActions', () => {
         expect.objectContaining({
           [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
             PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-          [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+          [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
             PERPS_EVENT_VALUE.BUTTON_CLICKED.DEPOSIT,
           [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
             PERPS_EVENT_VALUE.BUTTON_LOCATION.PERPS_HOME,
@@ -337,7 +337,7 @@ describe('PerpsMarketBalanceActions', () => {
         expect.objectContaining({
           [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
             PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-          [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+          [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
             PERPS_EVENT_VALUE.BUTTON_CLICKED.WITHDRAW,
           [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
             PERPS_EVENT_VALUE.BUTTON_LOCATION.PERPS_HOME,
@@ -384,7 +384,7 @@ describe('PerpsMarketBalanceActions', () => {
       expect(mockTrack).toHaveBeenCalledWith(
         MetaMetricsEventName.PerpsUiInteraction,
         expect.objectContaining({
-          [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+          [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
             PERPS_EVENT_VALUE.BUTTON_CLICKED.DEPOSIT,
         }),
       );
diff --git c/ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx w/ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx
index 1b7c3eb85d..a0a10e7577 100644
--- c/ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx
+++ w/ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx
@@ -96,7 +96,7 @@ const PerpsMarketBalanceActions = ({
     track(MetaMetricsEventName.PerpsUiInteraction, {
       [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
         PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-      [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
         PERPS_EVENT_VALUE.BUTTON_CLICKED.DEPOSIT,
       [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
         PERPS_EVENT_VALUE.BUTTON_LOCATION.PERPS_HOME,
@@ -112,7 +112,7 @@ const PerpsMarketBalanceActions = ({
     track(MetaMetricsEventName.PerpsUiInteraction, {
       [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
         PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-      [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
         PERPS_EVENT_VALUE.BUTTON_CLICKED.WITHDRAW,
       [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
         PERPS_EVENT_VALUE.BUTTON_LOCATION.PERPS_HOME,
@@ -124,7 +124,7 @@ const PerpsMarketBalanceActions = ({
     track(MetaMetricsEventName.PerpsUiInteraction, {
       [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
         PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-      [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
         PERPS_EVENT_VALUE.BUTTON_CLICKED.TUTORIAL,
       [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
         PERPS_EVENT_VALUE.BUTTON_LOCATION.PERPS_HOME,
diff --git c/ui/components/app/perps/perps-support-learn/perps-support-learn.test.tsx w/ui/components/app/perps/perps-support-learn/perps-support-learn.test.tsx
index 174fcac8c7..6bfe0e79ec 100644
--- c/ui/components/app/perps/perps-support-learn/perps-support-learn.test.tsx
+++ w/ui/components/app/perps/perps-support-learn/perps-support-learn.test.tsx
@@ -83,4 +83,28 @@ describe('PerpsSupportLearn', () => {
       url: FEEDBACK_CONFIG.Url,
     });
   });
+
+  it('names the tapped button via button_clicked on Perp UI Interaction', () => {
+    const store = configureStore(mockState);
+    renderWithProvider(<PerpsSupportLearn />, store, PERPS_ROUTE);
+
+    fireEvent.click(screen.getByTestId('perps-learn-basics'));
+
+    const uiInteraction = mockTrackEvent.mock.calls
+      .map(([event]) => event)
+      .find((event) => event.name === MetaMetricsEventName.PerpsUiInteraction);
+    expect(uiInteraction?.properties).toHaveProperty(
+      'interaction_type',
+      'button_clicked',
+    );
+    expect(uiInteraction?.properties).toHaveProperty(
+      'button_clicked',
+      'tutorial',
+    );
+    expect(uiInteraction?.properties).toHaveProperty(
+      'button_location',
+      'perps_tab',
+    );
+    expect(uiInteraction?.properties).not.toHaveProperty('button_type');
+  });
 });
diff --git c/ui/components/app/perps/perps-support-learn/perps-support-learn.tsx w/ui/components/app/perps/perps-support-learn/perps-support-learn.tsx
index 6996c02ad7..7da8133d93 100644
--- c/ui/components/app/perps/perps-support-learn/perps-support-learn.tsx
+++ w/ui/components/app/perps/perps-support-learn/perps-support-learn.tsx
@@ -85,7 +85,7 @@ export const PerpsSupportLearn = () => {
     track(MetaMetricsEventName.PerpsUiInteraction, {
       [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
         PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-      [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
         PERPS_EVENT_VALUE.BUTTON_CLICKED.TUTORIAL,
       [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
         PERPS_EVENT_VALUE.BUTTON_LOCATION.WALLET_HOME_PERPS_TAB,
@@ -97,7 +97,7 @@ export const PerpsSupportLearn = () => {
     track(MetaMetricsEventName.PerpsUiInteraction, {
       [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
         PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-      [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
         PERPS_EVENT_VALUE.BUTTON_CLICKED.SUPPORT,
       [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
         PERPS_EVENT_VALUE.BUTTON_LOCATION.WALLET_HOME_PERPS_TAB,
@@ -118,7 +118,7 @@ export const PerpsSupportLearn = () => {
     track(MetaMetricsEventName.PerpsUiInteraction, {
       [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
         PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-      [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
         PERPS_EVENT_VALUE.BUTTON_CLICKED.FEEDBACK,
       [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
         PERPS_EVENT_VALUE.BUTTON_LOCATION.WALLET_HOME_PERPS_TAB,
diff --git c/ui/pages/perps/market-list/index.test.tsx w/ui/pages/perps/market-list/index.test.tsx
index 6c2e5476d2..97821585a1 100644
--- c/ui/pages/perps/market-list/index.test.tsx
+++ w/ui/pages/perps/market-list/index.test.tsx
@@ -773,6 +773,13 @@ describe('MarketListView', () => {
           filter_category: 'crypto',
         }),
       );
+      expect(mockTrack).toHaveBeenCalledWith(
+        MetaMetricsEventName.PerpsUiInteraction,
+        expect.objectContaining({
+          interaction_type: 'button_clicked',
+          button_clicked: 'crypto',
+        }),
+      );
     });
   });
 
diff --git c/ui/pages/perps/market-list/index.tsx w/ui/pages/perps/market-list/index.tsx
index 2538a65014..2034322dc0 100644
--- c/ui/pages/perps/market-list/index.tsx
+++ w/ui/pages/perps/market-list/index.tsx
@@ -624,7 +624,7 @@ export const MarketListView = () => {
         [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
           PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
         [PERPS_EVENT_PROPERTY.TAB_NAME]: filter,
-        [PERPS_EVENT_PROPERTY.BUTTON_TYPE]: filter,
+        [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]: filter,
         [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
           PERPS_EVENT_VALUE.BUTTON_LOCATION.MARKET_LIST,
       });
diff --git c/ui/pages/perps/perps-market-detail-page.test.tsx w/ui/pages/perps/perps-market-detail-page.test.tsx
index 9e550b895f..edd739571a 100644
--- c/ui/pages/perps/perps-market-detail-page.test.tsx
+++ w/ui/pages/perps/perps-market-detail-page.test.tsx
@@ -15,6 +15,7 @@ import {
   mockTransactions,
 } from '../../components/app/perps/mocks';
 import { PERPS_LIQUIDATION_PRICE_FALLBACK } from '../../components/app/perps/utils/formatPerpsDisplayPrice';
+import { MetaMetricsEventName } from '../../../shared/constants/metametrics';
 import {
   PERPS_ACTIVITY_ROUTE,
   PERPS_MARKET_LIST_ROUTE,
@@ -259,6 +260,7 @@ const mockLiveAccount = jest.fn(() => ({
 }));
 
 const mockUsePerpsEligibility = jest.fn(() => ({ isEligible: true }));
+const mockPerpsTrack = jest.fn();
 // Captures the declarative PERPS_SCREEN_VIEWED options so tests can assert the
 // properties the page constructs.
 const mockPerpsScreenViewedOptions: {
@@ -275,7 +277,7 @@ jest.mock('../../hooks/perps', () => ({
       mockPerpsScreenViewedOptions.push(options);
       return undefined;
     }
-    return { track: jest.fn() };
+    return { track: mockPerpsTrack };
   },
   usePerpsOrderForm: jest.fn(),
   useUserHistory: jest.fn(),
@@ -1555,6 +1557,17 @@ describe('PerpsMarketDetailPage', () => {
       const marginMenu = screen.getByTestId('perps-margin-menu');
       expect(marginMenu).toBeInTheDocument();
       expect(marginMenu.parentElement).toBe(document.body);
+      expect(mockPerpsTrack).toHaveBeenCalledWith(
+        MetaMetricsEventName.PerpsUiInteraction,
+        expect.objectContaining({
+          interaction_type: 'button_clicked',
+          button_clicked: 'margin',
+          button_location: 'asset_details',
+        }),
+      );
+      mockPerpsTrack.mock.calls.forEach(([, properties]) => {
+        expect(properties).not.toHaveProperty('button_type');
+      });
       expect(
         screen.getByText(messages.perpsAddMargin.message),
       ).toBeInTheDocument();
diff --git c/ui/pages/perps/perps-market-detail-page.tsx w/ui/pages/perps/perps-market-detail-page.tsx
index 60214b6ffe..abde1a5549 100644
--- c/ui/pages/perps/perps-market-detail-page.tsx
+++ w/ui/pages/perps/perps-market-detail-page.tsx
@@ -863,7 +863,7 @@ const PerpsMarketDetailPage = () => {
         track(MetaMetricsEventName.PerpsUiInteraction, {
           [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
             PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-          [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+          [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
             PERPS_EVENT_VALUE.BUTTON_CLICKED.TRADE,
           [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
             PERPS_EVENT_VALUE.BUTTON_LOCATION.ASSET_DETAILS,
@@ -907,7 +907,7 @@ const PerpsMarketDetailPage = () => {
       track(MetaMetricsEventName.PerpsUiInteraction, {
         [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
           PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-        [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+        [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
           PERPS_EVENT_VALUE.BUTTON_CLICKED.ADD_MARGIN,
         [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
           PERPS_EVENT_VALUE.BUTTON_LOCATION.ASSET_DETAILS,
@@ -925,7 +925,7 @@ const PerpsMarketDetailPage = () => {
       track(MetaMetricsEventName.PerpsUiInteraction, {
         [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
           PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-        [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+        [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
           PERPS_EVENT_VALUE.BUTTON_CLICKED.REMOVE_MARGIN,
         [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
           PERPS_EVENT_VALUE.BUTTON_LOCATION.ASSET_DETAILS,
@@ -951,7 +951,7 @@ const PerpsMarketDetailPage = () => {
       track(MetaMetricsEventName.PerpsUiInteraction, {
         [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
           PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-        [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+        [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
           PERPS_EVENT_VALUE.BUTTON_CLICKED.INCREASE_EXPOSURE,
         [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
           PERPS_EVENT_VALUE.BUTTON_LOCATION.ASSET_DETAILS,
@@ -992,7 +992,7 @@ const PerpsMarketDetailPage = () => {
       track(MetaMetricsEventName.PerpsUiInteraction, {
         [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
           PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-        [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+        [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
           PERPS_EVENT_VALUE.BUTTON_CLICKED.REDUCE_EXPOSURE,
         [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
           PERPS_EVENT_VALUE.BUTTON_LOCATION.ASSET_DETAILS,
@@ -1009,7 +1009,7 @@ const PerpsMarketDetailPage = () => {
     track(MetaMetricsEventName.PerpsUiInteraction, {
       [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
         PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-      [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
         PERPS_EVENT_VALUE.BUTTON_CLICKED.MARGIN,
       [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
         PERPS_EVENT_VALUE.BUTTON_LOCATION.ASSET_DETAILS,
@@ -1990,7 +1990,7 @@ const PerpsMarketDetailPage = () => {
                 track(MetaMetricsEventName.PerpsUiInteraction, {
                   [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
                     PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-                  [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+                  [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
                     PERPS_EVENT_VALUE.BUTTON_CLICKED.TUTORIAL,
                   [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
                     PERPS_EVENT_VALUE.BUTTON_LOCATION.ASSET_DETAILS,
diff --git c/ui/pages/perps/perps-order-entry-page.test.tsx w/ui/pages/perps/perps-order-entry-page.test.tsx
index 2a5832b4cd..0ca76c3fa1 100644
--- c/ui/pages/perps/perps-order-entry-page.test.tsx
+++ w/ui/pages/perps/perps-order-entry-page.test.tsx
@@ -2030,7 +2030,7 @@ describe('PerpsOrderEntryPage', () => {
             category: MetaMetricsEventCategory.Perps,
             [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
               PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-            [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+            [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
               PERPS_EVENT_VALUE.BUTTON_CLICKED.DEPOSIT,
             [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
               PERPS_EVENT_VALUE.BUTTON_LOCATION.ORDER_FORM_FOOTER,
@@ -2040,6 +2040,10 @@ describe('PerpsOrderEntryPage', () => {
           }),
         }),
       );
+      const depositClick = mockAnalyticsTrackEvent.mock.calls.find(
+        ([event]) => event.name === MetaMetricsEventName.PerpsUiInteraction,
+      );
+      expect(depositClick?.[0].properties).not.toHaveProperty('button_type');
     });
 
     it('enables add funds to trade when tradeable balance is dust below the unfunded threshold', async () => {
diff --git c/ui/pages/perps/perps-order-entry-page.tsx w/ui/pages/perps/perps-order-entry-page.tsx
index 066f21c430..73643af050 100644
--- c/ui/pages/perps/perps-order-entry-page.tsx
+++ w/ui/pages/perps/perps-order-entry-page.tsx
@@ -2363,7 +2363,7 @@ const PerpsOrderEntryPage = () => {
       track(MetaMetricsEventName.PerpsUiInteraction, {
         [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
           PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
-        [PERPS_EVENT_PROPERTY.BUTTON_TYPE]:
+        [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
           PERPS_EVENT_VALUE.BUTTON_CLICKED.DEPOSIT,
         [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]: buttonLocation,
         [PERPS_EVENT_PROPERTY.HAS_PERP_BALANCE]: isFunded,
test/e2e/AGENTS.md
-rw-r--r--  1 deeeed  staff  59777 Sep 22 10:31 AGENTS.md

exec
/opt/homebrew/bin/zsh -lc "rg -n 'BUTTON_TYPE|button_type|BUTTON_CLICKED|button_clicked' shared ui app test | head -250; cat shared/constants/perps-events.ts; sed -n '1,190p' ui/components/app/perps/perps-support-learn/perps-support-learn.tsx; sed -n '585,635p' ui/pages/perps/market-list/index.tsx" in /Users/deeeed/dev/metamask/metamask-extension-6
 succeeded in 200ms:
test/mocks/metamask-perps-controller.js:30:  BUTTON_CLICKED: 'button_clicked',
test/mocks/metamask-perps-controller.js:142:    BUTTON_CLICKED: 'button_clicked',
test/mocks/metamask-perps-controller.js:166:  BUTTON_CLICKED: {
ui/hooks/money/useMoneyAnalytics.test.ts:254:        button_type: MoneyButtonType.Text,
ui/hooks/money/useMoneyAnalytics.test.ts:281:        button_type: MoneyButtonType.Text,
ui/hooks/money/useMoneyAnalytics.test.ts:316:        button_type: MoneyButtonType.Icon,
ui/hooks/money/useMoneyAnalytics.test.ts:359:        button_type: MoneyButtonType.Text,
shared/constants/perps-events.ts:92:  BUTTON_CLICKED: {
shared/constants/perps-events.ts:93:    ...CONTROLLER_PERPS_EVENT_VALUE.BUTTON_CLICKED,
shared/constants/perps-events.ts:95:    TRADE: CONTROLLER_PERPS_EVENT_VALUE.BUTTON_CLICKED.PLACE_ORDER,
shared/constants/perps-events.ts:99:    FEEDBACK: CONTROLLER_PERPS_EVENT_VALUE.BUTTON_CLICKED.GIVE_FEEDBACK,
shared/constants/perps-events.ts:105:      CONTROLLER_PERPS_EVENT_VALUE.BUTTON_CLICKED.REDUCE_EXPOSURE,
shared/constants/perps-events.ts:121:     * Click is BUTTON_CLICKED + DEPOSIT; these cover the later drop-off points.
shared/lib/ab-testing/ab-test-analytics.test.ts:192:          button_type: 'card',
shared/lib/ab-testing/ab-test-analytics.test.ts:209:        button_type: 'card',
ui/pages/multi-srp/import-srp/import-srp.tsx:67:            status: 'continue_button_clicked',
ui/components/multichain/multi-srp/srp-list/srp-card.tsx:85:              button_type: 'srp_select',
ui/components/multichain/multi-srp/srp-list/srp-card.tsx:121:                      button_type: 'details',
ui/pages/musd/screens/education.tsx:170:      button_type: MUSD_EVENTS_CONSTANTS.BUTTON_TYPES.PRIMARY,
ui/pages/musd/screens/education.tsx:262:      button_type: MUSD_EVENTS_CONSTANTS.BUTTON_TYPES.SECONDARY,
ui/pages/perps/perps-market-detail-page.tsx:683:    PERPS_EVENT_VALUE.BUTTON_CLICKED.CLOSE,
ui/pages/perps/perps-market-detail-page.tsx:865:            PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/pages/perps/perps-market-detail-page.tsx:866:          [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/pages/perps/perps-market-detail-page.tsx:867:            PERPS_EVENT_VALUE.BUTTON_CLICKED.TRADE,
ui/pages/perps/perps-market-detail-page.tsx:898:      setCloseButtonClicked(PERPS_EVENT_VALUE.BUTTON_CLICKED.CLOSE);
ui/pages/perps/perps-market-detail-page.tsx:909:          PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/pages/perps/perps-market-detail-page.tsx:910:        [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/pages/perps/perps-market-detail-page.tsx:911:          PERPS_EVENT_VALUE.BUTTON_CLICKED.ADD_MARGIN,
ui/pages/perps/perps-market-detail-page.tsx:927:          PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/pages/perps/perps-market-detail-page.tsx:928:        [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/pages/perps/perps-market-detail-page.tsx:929:          PERPS_EVENT_VALUE.BUTTON_CLICKED.REMOVE_MARGIN,
ui/pages/perps/perps-market-detail-page.tsx:953:          PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/pages/perps/perps-market-detail-page.tsx:954:        [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/pages/perps/perps-market-detail-page.tsx:955:          PERPS_EVENT_VALUE.BUTTON_CLICKED.INCREASE_EXPOSURE,
ui/pages/perps/perps-market-detail-page.tsx:994:          PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/pages/perps/perps-market-detail-page.tsx:995:        [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/pages/perps/perps-market-detail-page.tsx:996:          PERPS_EVENT_VALUE.BUTTON_CLICKED.REDUCE_EXPOSURE,
ui/pages/perps/perps-market-detail-page.tsx:1000:      setCloseButtonClicked(PERPS_EVENT_VALUE.BUTTON_CLICKED.REDUCE_EXPOSURE);
ui/pages/perps/perps-market-detail-page.tsx:1011:        PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/pages/perps/perps-market-detail-page.tsx:1012:      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/pages/perps/perps-market-detail-page.tsx:1013:        PERPS_EVENT_VALUE.BUTTON_CLICKED.MARGIN,
ui/pages/perps/perps-market-detail-page.tsx:1992:                    PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/pages/perps/perps-market-detail-page.tsx:1993:                  [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/pages/perps/perps-market-detail-page.tsx:1994:                    PERPS_EVENT_VALUE.BUTTON_CLICKED.TUTORIAL,
ui/pages/perps/perps-market-detail-page.test.tsx:1563:          interaction_type: 'button_clicked',
ui/pages/perps/perps-market-detail-page.test.tsx:1564:          button_clicked: 'margin',
ui/pages/perps/perps-market-detail-page.test.tsx:1569:        expect(properties).not.toHaveProperty('button_type');
ui/pages/perps/perps-order-entry-page.test.tsx:2032:              PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/pages/perps/perps-order-entry-page.test.tsx:2033:            [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/pages/perps/perps-order-entry-page.test.tsx:2034:              PERPS_EVENT_VALUE.BUTTON_CLICKED.DEPOSIT,
ui/pages/perps/perps-order-entry-page.test.tsx:2046:      expect(depositClick?.[0].properties).not.toHaveProperty('button_type');
ui/pages/perps/perps-order-entry-page.test.tsx:2112:              PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/pages/perps/market-list/index.test.tsx:779:          interaction_type: 'button_clicked',
ui/pages/perps/market-list/index.test.tsx:780:          button_clicked: 'crypto',
ui/pages/perps/market-list/index.tsx:625:          PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/pages/perps/market-list/index.tsx:627:        [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]: filter,
ui/pages/perps/perps-order-entry-page.tsx:2365:          PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/pages/perps/perps-order-entry-page.tsx:2366:        [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/pages/perps/perps-order-entry-page.tsx:2367:          PERPS_EVENT_VALUE.BUTTON_CLICKED.DEPOSIT,
ui/pages/create-account/connect-hardware/select-hardware.tsx:171:            button_type: 'select',
app/scripts/controllers/metametrics-controller.test.ts:1041:              button_type: 'card',
app/scripts/controllers/metametrics-controller.test.ts:1054:                button_type: 'card',
app/scripts/controllers/metametrics-controller.test.ts:1071:                button_type: 'card',
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx:98:        PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx:99:      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx:100:        PERPS_EVENT_VALUE.BUTTON_CLICKED.DEPOSIT,
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx:114:        PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx:115:      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx:116:        PERPS_EVENT_VALUE.BUTTON_CLICKED.WITHDRAW,
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx:126:        PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx:127:      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx:128:        PERPS_EVENT_VALUE.BUTTON_CLICKED.TUTORIAL,
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx:262:            PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx:263:          [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx:264:            PERPS_EVENT_VALUE.BUTTON_CLICKED.TUTORIAL,
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx:318:            PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx:319:          [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx:320:            PERPS_EVENT_VALUE.BUTTON_CLICKED.DEPOSIT,
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx:339:            PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx:340:          [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx:341:            PERPS_EVENT_VALUE.BUTTON_CLICKED.WITHDRAW,
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx:387:          [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx:388:            PERPS_EVENT_VALUE.BUTTON_CLICKED.DEPOSIT,
ui/components/app/perps/perps-support-learn/perps-support-learn.test.tsx:87:  it('names the tapped button via button_clicked on Perp UI Interaction', () => {
ui/components/app/perps/perps-support-learn/perps-support-learn.test.tsx:98:      'button_clicked',
ui/components/app/perps/perps-support-learn/perps-support-learn.test.tsx:101:      'button_clicked',
ui/components/app/perps/perps-support-learn/perps-support-learn.test.tsx:108:    expect(uiInteraction?.properties).not.toHaveProperty('button_type');
ui/components/app/perps/perps-support-learn/perps-support-learn.tsx:87:        PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/components/app/perps/perps-support-learn/perps-support-learn.tsx:88:      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/components/app/perps/perps-support-learn/perps-support-learn.tsx:89:        PERPS_EVENT_VALUE.BUTTON_CLICKED.TUTORIAL,
ui/components/app/perps/perps-support-learn/perps-support-learn.tsx:99:        PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/components/app/perps/perps-support-learn/perps-support-learn.tsx:100:      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/components/app/perps/perps-support-learn/perps-support-learn.tsx:101:        PERPS_EVENT_VALUE.BUTTON_CLICKED.SUPPORT,
ui/components/app/perps/perps-support-learn/perps-support-learn.tsx:120:        PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/components/app/perps/perps-support-learn/perps-support-learn.tsx:121:      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/components/app/perps/perps-support-learn/perps-support-learn.tsx:122:        PERPS_EVENT_VALUE.BUTTON_CLICKED.FEEDBACK,
ui/components/app/perps/perps-top-movers/perps-top-movers.test.tsx:282:            PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/components/app/perps/perps-top-movers/perps-top-movers.test.tsx:283:          [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/components/app/perps/perps-top-movers/perps-top-movers.test.tsx:284:            PERPS_EVENT_VALUE.BUTTON_CLICKED.TOP_MOVERS,
ui/components/app/perps/perps-top-movers/perps-top-movers.tsx:112:        PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
ui/components/app/perps/perps-top-movers/perps-top-movers.tsx:113:      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
ui/components/app/perps/perps-top-movers/perps-top-movers.tsx:114:        PERPS_EVENT_VALUE.BUTTON_CLICKED.TOP_MOVERS,
ui/components/app/perps/close-position/close-position-modal.tsx:337:  buttonClicked = PERPS_EVENT_VALUE.BUTTON_CLICKED.CLOSE,
ui/components/app/perps/close-position/close-position-modal.tsx:357:      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]: buttonClicked,
ui/components/app/perps/close-position/close-position-modal.test.tsx:187:// button_clicked / button_location props the modal forwards.
ui/components/app/perps/close-position/close-position-modal.test.tsx:353:    it('surfaces button_clicked and button_location from props', () => {
ui/components/app/perps/close-position/close-position-modal.test.tsx:372:          button_clicked: 'reduce_exposure',
ui/components/app/perps/close-position/close-position-modal.test.tsx:378:    it('defaults button_clicked to close when no trigger prop is passed', () => {
ui/components/app/perps/close-position/close-position-modal.test.tsx:393:      expect(screenView?.properties?.button_clicked).toBe('close');
ui/components/app/musd/musd-events.ts:43:  BUTTON_TYPES: {
ui/components/app/musd/musd-events.ts:175: * Properties for MUSD_FULLSCREEN_ANNOUNCEMENT_BUTTON_CLICKED event
ui/components/app/musd/musd-events.ts:183:  button_type: 'primary' | 'secondary';
/**
 * Canonical perps analytics contract from `@metamask/perps-controller`.
 *
 * Values come from the controller package (Jest-mapped via
 * `test/mocks/metamask-perps-controller.js`). A thin Extension compatibility
 * layer aliases historical Extension key names onto controller string values
 * so existing UI call sites keep compiling while emitting the controller
 * contract. Prefer controller key names in new code.
 */
import {
  PERPS_EVENT_PROPERTY as CONTROLLER_PERPS_EVENT_PROPERTY,
  PERPS_EVENT_VALUE as CONTROLLER_PERPS_EVENT_VALUE,
  PerpsAnalyticsEvent,
} from '@metamask/perps-controller';

export { PerpsAnalyticsEvent };

/**
 * Controller property keys plus Extension UI-only keys not yet in the package.
 */
export const PERPS_EVENT_PROPERTY = {
  ...CONTROLLER_PERPS_EVENT_PROPERTY,
  /** @deprecated Prefer ORDER_SIZE or POSITION_SIZE from the controller contract. */
  SIZE: 'size',
  /** Extension market-list filter property. */
  MARKET_CATEGORY_FILTER: 'market_category_filter',
  /** Extension close-all summary property. */
  NUMBER_POSITIONS_CLOSED: 'number_positions_closed',
  /**
   * Market-search funnel properties Mobile already emits but the controller
   * contract does not export yet. Kept here (not inline) so the emitted keys
   * stay snake_case without tripping the naming-convention lint rule.
   */
  QUERY_COUNT: 'query_count',
  TIME_IN_SEARCH_MS: 'time_in_search_ms',
  TIME_TO_TAP_MS: 'time_to_tap_ms',
  QUERY_TEXT: 'query_text',
  QUERY_LENGTH: 'query_length',
  HAS_RESULTS: 'has_results',
  ACTIVE_CHIPS: 'active_chips',
  /** Extension unfunded-deposit funnel: what the Add funds click actually opened. */
  DEPOSIT_CLICK_OUTCOME: 'deposit_click_outcome',
} as const;

/**
 * Controller value enums plus Extension aliases / UI-only values.
 * Alias keys keep historical Extension names; values match the controller
 * contract (or prior Extension strings when no controller equivalent exists).
 */
export const PERPS_EVENT_VALUE = {
  ...CONTROLLER_PERPS_EVENT_VALUE,
  SOURCE: {
    ...CONTROLLER_PERPS_EVENT_VALUE.SOURCE,
    /** @deprecated Use ASSET_DETAIL_SCREEN */
    ASSET_DETAILS: CONTROLLER_PERPS_EVENT_VALUE.SOURCE.ASSET_DETAIL_SCREEN,
    /** @deprecated Use PERPS_MARKET_LIST_ALL */
    MARKET_LIST: CONTROLLER_PERPS_EVENT_VALUE.SOURCE.PERPS_MARKET_LIST_ALL,
    /** @deprecated Use TRADE_SCREEN */
    TRADING: CONTROLLER_PERPS_EVENT_VALUE.SOURCE.TRADE_SCREEN,
    /** @deprecated Use HOMESCREEN_TAB */
    WALLET_HOME_PERPS_TAB: CONTROLLER_PERPS_EVENT_VALUE.SOURCE.HOMESCREEN_TAB,
    /** Extension-only: controller contract has no bottom-nav source yet. */
    BOTTOM_NAV_BAR: 'bottom_nav_bar',
    /** Extension-only: source for Hyperliquid deposit prompt. */
    HYPERLIQUID_DEPOSIT_PROMPT: 'hyperliquid_deposit_prompt',
  },
  SCREEN_TYPE: {
    ...CONTROLLER_PERPS_EVENT_VALUE.SCREEN_TYPE,
    /** @deprecated Use CREATE_TPSL */
    CREATE_TP_SL: CONTROLLER_PERPS_EVENT_VALUE.SCREEN_TYPE.CREATE_TPSL,
    /** @deprecated Use EDIT_TPSL */
    UPDATE_TP_SL: CONTROLLER_PERPS_EVENT_VALUE.SCREEN_TYPE.EDIT_TPSL,
    /**
     * Extension-only: controller dropped FLIP_POSITION; keep historical
     * `flip_position` so flip screen views are not misclassified as
     * increase_exposure.
     */
    FLIP_POSITION: 'flip_position',
  },
  BUTTON_LOCATION: {
    ...CONTROLLER_PERPS_EVENT_VALUE.BUTTON_LOCATION,
    /** @deprecated Use PERPS_TAB / PERPS_HOME */
    WALLET_HOME_PERPS_TAB:
      CONTROLLER_PERPS_EVENT_VALUE.BUTTON_LOCATION.PERPS_TAB,
    /** @deprecated Use TRADE_MENU_ACTION / keep trading location string */
    TRADING: 'trading',
    /** Extension trade-screen available-to-trade row Add funds control. */
    AMOUNT_INPUT: 'amount_input',
    /** Extension trade-screen sticky-footer primary CTA. */
    ORDER_FORM_FOOTER: 'order_form_footer',
  },
  BUTTON_CLICKED: {
    ...CONTROLLER_PERPS_EVENT_VALUE.BUTTON_CLICKED,
    /** @deprecated Use PLACE_ORDER / OPEN_POSITION */
    TRADE: CONTROLLER_PERPS_EVENT_VALUE.BUTTON_CLICKED.PLACE_ORDER,
    /** Extension support CTA */
    SUPPORT: 'support',
    /** @deprecated Use GIVE_FEEDBACK */
    FEEDBACK: CONTROLLER_PERPS_EVENT_VALUE.BUTTON_CLICKED.GIVE_FEEDBACK,
    MARGIN: 'margin',
    ADD_MARGIN: CONTROLLER_PERPS_EVENT_VALUE.ACTION.ADD_MARGIN,
    REMOVE_MARGIN: CONTROLLER_PERPS_EVENT_VALUE.ACTION.REMOVE_MARGIN,
    INCREASE_EXPOSURE: CONTROLLER_PERPS_EVENT_VALUE.ACTION.INCREASE_EXPOSURE,
    REDUCE_EXPOSURE:
      CONTROLLER_PERPS_EVENT_VALUE.BUTTON_CLICKED.REDUCE_EXPOSURE,
  },
  INTERACTION_TYPE: {
    ...CONTROLLER_PERPS_EVENT_VALUE.INTERACTION_TYPE,
    /** Extension close-all funnel (not yet in controller contract). */
    CLOSE_ALL_TAPPED: 'close_all_tapped',
    CLOSE_ALL_CONFIRMED: 'close_all_confirmed',
    CLOSE_ALL_CANCELLED: 'close_all_cancelled',
    /** Extension order-book panel open/close (not yet in controller contract). */
    ORDER_BOOK_OPENED: 'order_book_opened',
    ORDER_BOOK_CLOSED: 'order_book_closed',
    /** Extension order-entry chart panel open/close (not yet in controller contract). */
    CHART_OPENED: 'chart_opened',
    CHART_CLOSED: 'chart_closed',
    /**
     * Unfunded trade-screen deposit funnel (not yet in the controller contract).
     * Click is BUTTON_CLICKED + DEPOSIT; these cover the later drop-off points.
     */
    DEPOSIT_FLOW_OPENED: 'deposit_flow_opened',
    DEPOSIT_CONFIRMED: 'deposit_confirmed',
    TRADE_SUBMITTED_AFTER_DEPOSIT: 'trade_submitted_after_deposit',
  },
  /** What an Add funds click opened — geo-blocked clicks are a funnel drop-off. */
  DEPOSIT_CLICK_OUTCOME: {
    DEPOSIT: 'deposit',
    GEO_BLOCK_MODAL: 'geo_block_modal',
  },
  ERROR_TYPE: {
    ...CONTROLLER_PERPS_EVENT_VALUE.ERROR_TYPE,
    /**
     * Extension-only: a perps route opened with a symbol the market stream does
     * not know. The controller contract has no equivalent yet.
     */
    MARKET_NOT_FOUND: 'market_not_found',
  },
  ERROR_MESSAGE_KEY: {
    ...CONTROLLER_PERPS_EVENT_VALUE.ERROR_MESSAGE_KEY,
    /**
     * Kept as an explicit local value (not solely the controller spread) since
     * `test/mocks/metamask-perps-controller.js` does not define this key.
     */
    INSUFFICIENT_BALANCE: 'insufficient_balance',
  },
  /**
   * Extension-only: which flow a PERPS_TRANSACTION_CONSIDERED belongs to. Only
   * the trade flow emits it today; the controller contract does not export the
   * value set.
   */
  ORDER_CONTEXT: {
    TRADE: 'trade',
  },
} as const;

/** Where a tracked button click happened. Derived so typos fail to compile. */
export type PerpsButtonLocation =
  (typeof PERPS_EVENT_VALUE.BUTTON_LOCATION)[keyof typeof PERPS_EVENT_VALUE.BUTTON_LOCATION];

/** What an Add funds click opened. Derived so typos fail to compile. */
export type PerpsDepositClickOutcome =
  (typeof PERPS_EVENT_VALUE.DEPOSIT_CLICK_OUTCOME)[keyof typeof PERPS_EVENT_VALUE.DEPOSIT_CLICK_OUTCOME];

/**
 * Extension-only event properties.
 *
 * The perps controller exposes no canonical key for the gap between the
 * streamed (cached) balance and the freshly read one, which the withdraw page
 * reports when it blocks a withdrawal the provider would reject (TAT-3490).
 * Kept out of `PERPS_EVENT_PROPERTY` so the "must mirror the controller" rule
 * above stays unambiguous.
 */
export const PERPS_EXTENSION_EVENT_PROPERTY = {
  STALE_BALANCE_SHORTFALL: 'stale_balance_shortfall',
} as const;
import React, { useCallback } from 'react';
import {
  Box,
  BoxFlexDirection,
  BoxJustifyContent,
  BoxAlignItems,
  Text,
  TextVariant,
  FontWeight,
  Icon,
  IconName,
  IconSize,
  IconColor,
} from '@metamask/design-system-react';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { useAnalytics } from '../../../../hooks/useAnalytics';
import { useSegmentContext } from '../../../../hooks/useSegmentContext';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../../shared/constants/metametrics';
import {
  PERPS_EVENT_PROPERTY,
  PERPS_EVENT_VALUE,
} from '../../../../../shared/constants/perps-events';
import {
  FEEDBACK_CONFIG,
  SUPPORT_CONFIG,
} from '../../../../../shared/constants/perps';
import { setTutorialModalOpen } from '../../../../ducks/perps';
import { usePerpsEventTracking } from '../../../../hooks/perps';
import { useDispatch } from '../../../../store/hooks';

const LIST_ITEM_BASE =
  'flex items-center gap-3 px-4 py-3 bg-background-muted cursor-pointer hover:bg-hover active:bg-pressed';

type SupportListItemProps = {
  label: string;
  onClick: () => void;
  className?: string;
  'data-testid'?: string;
};

const SupportListItem = ({
  label,
  onClick,
  className,
  'data-testid': testId,
}: SupportListItemProps) => (
  <Box
    className={`${LIST_ITEM_BASE} ${className ?? ''}`}
    role="button"
    tabIndex={0}
    onClick={onClick}
    data-testid={testId}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    flexDirection={BoxFlexDirection.Row}
    justifyContent={BoxJustifyContent.Between}
    alignItems={BoxAlignItems.Center}
  >
    <Text variant={TextVariant.BodyMd} fontWeight={FontWeight.Medium}>
      {label}
    </Text>
    <Icon
      name={IconName.ArrowRight}
      size={IconSize.Sm}
      color={IconColor.IconAlternative}
    />
  </Box>
);

export const PerpsSupportLearn = () => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const { trackEvent, createEventBuilder } = useAnalytics();
  const segmentContext = useSegmentContext();
  const { track } = usePerpsEventTracking();

  const handleLearnPerps = useCallback(() => {
    track(MetaMetricsEventName.PerpsUiInteraction, {
      [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
        PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
        PERPS_EVENT_VALUE.BUTTON_CLICKED.TUTORIAL,
      [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
        PERPS_EVENT_VALUE.BUTTON_LOCATION.WALLET_HOME_PERPS_TAB,
    });
    dispatch(setTutorialModalOpen(true));
  }, [dispatch, track]);

  const handleContactSupport = useCallback(() => {
    track(MetaMetricsEventName.PerpsUiInteraction, {
      [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
        PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
        PERPS_EVENT_VALUE.BUTTON_CLICKED.SUPPORT,
      [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
        PERPS_EVENT_VALUE.BUTTON_LOCATION.WALLET_HOME_PERPS_TAB,
    });
    trackEvent(
      createEventBuilder(MetaMetricsEventName.SupportLinkClicked)
        .addCategory(MetaMetricsEventCategory.Settings)
        .addProperties({
          url: SUPPORT_CONFIG.Url,
          location: segmentContext.page?.title,
        })
        .build(),
    );
    globalThis.platform.openTab({ url: SUPPORT_CONFIG.Url });
  }, [createEventBuilder, segmentContext.page?.title, track, trackEvent]);

  const handleFeedback = useCallback(() => {
    track(MetaMetricsEventName.PerpsUiInteraction, {
      [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
        PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
      [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]:
        PERPS_EVENT_VALUE.BUTTON_CLICKED.FEEDBACK,
      [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
        PERPS_EVENT_VALUE.BUTTON_LOCATION.WALLET_HOME_PERPS_TAB,
    });
    trackEvent(
      createEventBuilder(MetaMetricsEventName.ExternalLinkClicked)
        .addCategory(MetaMetricsEventCategory.Feedback)
        .addProperties({
          url: FEEDBACK_CONFIG.Url,
          location: segmentContext.page?.title,
          text: 'perps_feedback_survey',
        })
        .build(),
    );
    globalThis.platform.openTab({ url: FEEDBACK_CONFIG.Url });
  }, [createEventBuilder, segmentContext.page?.title, track, trackEvent]);

  return (
    <Box paddingLeft={4} paddingRight={4} paddingBottom={4}>
      <Box flexDirection={BoxFlexDirection.Column} style={{ gap: '1px' }}>
        <SupportListItem
          label={t('perpsContactSupport')}
          onClick={handleContactSupport}
          className="rounded-t-xl"
          data-testid="perps-contact-support"
        />
        <SupportListItem
          label={t('perpsGiveFeedback')}
          onClick={handleFeedback}
          data-testid="perps-give-feedback"
        />
        <SupportListItem
          label={t('perpsLearnBasics')}
          onClick={handleLearnPerps}
          className="rounded-b-xl"
          data-testid="perps-learn-basics"
        />
      </Box>
    </Box>
  );
};
      window.removeEventListener('pagehide', closeSearchSession);
      closeSearchSession();
    };
  }, [flushPendingSearchQuery, emitSearchAbandoned]);

  // Handlers
  const handleBack = useCallback(() => {
    navigate(PREVIOUS_ROUTE);
  }, [navigate]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSearchClear = useCallback(() => {
    // Emptying the box is the single abandonment path: the debounce effect's
    // empty branch reports and resets the session, so clearing, backspacing to
    // empty and Escape all behave identically.
    setSearchQuery('');
  }, []);

  const handleSortChange = useCallback(
    (field: SortField, direction: SortDirection) => {
      // Sort applied — field and/or direction changed.
      track(MetaMetricsEventName.PerpsUiInteraction, {
        [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
          PERPS_EVENT_VALUE.INTERACTION_TYPE.SORT_APPLIED,
        [PERPS_EVENT_PROPERTY.SORT_FIELD]: field,
        [PERPS_EVENT_PROPERTY.SORT_DIRECTION]: direction,
      });
      setSortField(field);
      setSortDirection(direction);
    },
    [track],
  );

  const handleFilterChange = useCallback(
    (filter: MarketFilter) => {
      track(MetaMetricsEventName.PerpsUiInteraction, {
        [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
          PERPS_EVENT_VALUE.INTERACTION_TYPE.BUTTON_CLICKED,
        [PERPS_EVENT_PROPERTY.TAB_NAME]: filter,
        [PERPS_EVENT_PROPERTY.BUTTON_CLICKED]: filter,
        [PERPS_EVENT_PROPERTY.BUTTON_LOCATION]:
          PERPS_EVENT_VALUE.BUTTON_LOCATION.MARKET_LIST,
      });
      // Filter applied — market category changed.
      track(MetaMetricsEventName.PerpsUiInteraction, {
        [PERPS_EVENT_PROPERTY.INTERACTION_TYPE]:
          PERPS_EVENT_VALUE.INTERACTION_TYPE.FILTER_APPLIED,
        [PERPS_EVENT_PROPERTY.FILTER_CATEGORY]: filter,

exec
/opt/homebrew/bin/zsh -lc "rg -n 'BUTTON_CLICKED|PERPS_EVENT_PROPERTY' node_modules/@metamask/perps-controller/dist/constants/perps-analytics* node_modules/@metamask/perps-controller/dist --glob '*.js' --glob '*.d.ts' | head -100; sed -n '1,230p' test/mocks/metamask-perps-controller.js; rg -n 'usePerpsEventTracking' ui/hooks/perps* ui -g '*.ts' -g '*.tsx' | head -60; rg -n 'PerpsUiInteraction|perps_ui_interaction|button_clicked' app ui shared --glob '"'!*.test.*'"' | head -120" in /Users/deeeed/dev/metamask/metamask-extension-6
 succeeded in 212ms:
ui/hooks/perps/index.ts:45:export { usePerpsEventTracking } from './usePerpsEventTracking';
ui/hooks/perps/index.ts:50:} from './usePerpsEventTracking';
ui/hooks/perps/usePerpsAbandonOrderTracking.ts:10:import { usePerpsEventTracking } from './usePerpsEventTracking';
ui/hooks/perps/usePerpsAbandonOrderTracking.ts:52:  const { track } = usePerpsEventTracking();
ui/hooks/perps/usePerpsEventTracking.ts:36:export function usePerpsEventTracking(): {
ui/hooks/perps/usePerpsEventTracking.ts:39:export function usePerpsEventTracking(
ui/hooks/perps/usePerpsEventTracking.ts:42:export function usePerpsEventTracking(
ui/hooks/perps/usePerpsEventTracking.test.tsx:22:import { usePerpsEventTracking } from './usePerpsEventTracking';
ui/hooks/perps/usePerpsEventTracking.test.tsx:48:describe('usePerpsEventTracking', () => {
ui/hooks/perps/usePerpsEventTracking.test.tsx:63:      const { result } = renderHook(() => usePerpsEventTracking());
ui/hooks/perps/usePerpsEventTracking.test.tsx:86:          usePerpsEventTracking({
ui/hooks/perps/usePerpsEventTracking.test.tsx:115:          usePerpsEventTracking({
ui/hooks/perps/usePerpsEventTracking.test.tsx:135:          usePerpsEventTracking({
ui/hooks/perps/usePerpsEventTracking.test.tsx:155:          usePerpsEventTracking({
ui/hooks/perps/usePerpsEventTracking.test.tsx:177:          usePerpsEventTracking({
ui/hooks/perps/usePerpsEventTracking.test.tsx:209:      const { result } = renderHook(() => usePerpsEventTracking(), {
ui/hooks/perps/usePerpsEventTracking.test.tsx:234:      const { result } = renderHook(() => usePerpsEventTracking(), {
ui/hooks/perps/usePerpsEventTracking.test.tsx:257:          usePerpsEventTracking({
ui/hooks/perps/usePerpsEventTracking.test.tsx:280:      const { result } = renderHook(() => usePerpsEventTracking(), {
ui/hooks/perps/usePerpsEventTracking.test.tsx:310:      const { result } = renderHook(() => usePerpsEventTracking(), {
ui/hooks/perps/usePerpsEventTracking.test.tsx:338:        usePerpsEventTracking({
ui/hooks/perps/usePerpsEventTracking.test.tsx:379:      usePerpsEventTracking({
ui/hooks/perps/usePerpsEventTracking.test.tsx:440:      usePerpsEventTracking({
ui/hooks/perps/usePerpsEventTracking.test.tsx:485:      usePerpsEventTracking({
ui/hooks/perps/usePerpsAbandonOrderTracking.test.ts:6:jest.mock('./usePerpsEventTracking', () => ({
ui/hooks/perps/usePerpsAbandonOrderTracking.test.ts:7:  usePerpsEventTracking: () => ({ track: mockTrack }),
ui/pages/perps/perps-market-detail-page.tsx:74:  usePerpsEventTracking,
ui/pages/perps/perps-market-detail-page.tsx:296:  const { track } = usePerpsEventTracking();
ui/pages/perps/perps-market-detail-page.tsx:422:  usePerpsEventTracking({
ui/pages/perps/perps-market-detail-page.tsx:500:  usePerpsEventTracking({
ui/pages/perps/perps-withdraw-page.test.tsx:111:  usePerpsEventTracking: () => ({ track: mockTrack }),
ui/pages/perps/market-list/index.test.tsx:37:jest.mock('../../../hooks/perps/usePerpsEventTracking', () => ({
ui/pages/perps/market-list/index.test.tsx:38:  usePerpsEventTracking: (options?: unknown) =>
ui/pages/perps/perps-market-detail-page.test.tsx:272:  usePerpsEventTracking: (options?: {
ui/pages/perps/perps-withdraw-page.tsx:56:import { usePerpsEventTracking } from '../../hooks/perps';
ui/pages/perps/perps-withdraw-page.tsx:106:  const { track } = usePerpsEventTracking();
ui/pages/perps/market-list/index.tsx:71:import { usePerpsEventTracking } from '../../../hooks/perps';
ui/pages/perps/market-list/index.tsx:228:  const { track } = usePerpsEventTracking();
ui/pages/perps/market-list/index.tsx:311:  usePerpsEventTracking({
ui/pages/perps/perps-order-entry-page.tsx:105:  usePerpsEventTracking,
ui/pages/perps/perps-order-entry-page.tsx:334:  const { track } = usePerpsEventTracking();
ui/pages/perps/perps-order-entry-page.tsx:475:  usePerpsEventTracking({
ui/pages/perps/perps-order-entry-page.tsx:754:  usePerpsEventTracking({
ui/pages/perps/perps-activity-page.tsx:43:import { usePerpsEventTracking } from '../../hooks/perps';
ui/pages/perps/perps-activity-page.tsx:108:  usePerpsEventTracking({
ui/hooks/perps/index.ts:45:export { usePerpsEventTracking } from './usePerpsEventTracking';
ui/hooks/perps/index.ts:50:} from './usePerpsEventTracking';
ui/hooks/perps/usePerpsAbandonOrderTracking.ts:10:import { usePerpsEventTracking } from './usePerpsEventTracking';
ui/hooks/perps/usePerpsAbandonOrderTracking.ts:52:  const { track } = usePerpsEventTracking();
ui/hooks/perps/usePerpsEventTracking.ts:36:export function usePerpsEventTracking(): {
ui/hooks/perps/usePerpsEventTracking.ts:39:export function usePerpsEventTracking(
ui/hooks/perps/usePerpsEventTracking.ts:42:export function usePerpsEventTracking(
ui/hooks/perps/usePerpsEventTracking.test.tsx:22:import { usePerpsEventTracking } from './usePerpsEventTracking';
ui/hooks/perps/usePerpsEventTracking.test.tsx:48:describe('usePerpsEventTracking', () => {
ui/hooks/perps/usePerpsEventTracking.test.tsx:63:      const { result } = renderHook(() => usePerpsEventTracking());
ui/hooks/perps/usePerpsEventTracking.test.tsx:86:          usePerpsEventTracking({
ui/hooks/perps/usePerpsEventTracking.test.tsx:115:          usePerpsEventTracking({
ui/hooks/perps/usePerpsEventTracking.test.tsx:135:          usePerpsEventTracking({
ui/hooks/perps/usePerpsEventTracking.test.tsx:155:          usePerpsEventTracking({
ui/hooks/perps/usePerpsEventTracking.test.tsx:177:          usePerpsEventTracking({
ui/pages/multi-srp/import-srp/import-srp.tsx:67:            status: 'continue_button_clicked',
shared/constants/metametrics.ts:1069:  PerpsUiInteraction = 'Perp UI Interaction',
ui/hooks/perps/usePerpsAbandonOrderTracking.ts:86:      trackRef.current(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-market-detail-page.tsx:863:        track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-market-detail-page.tsx:907:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-market-detail-page.tsx:925:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-market-detail-page.tsx:951:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-market-detail-page.tsx:992:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-market-detail-page.tsx:1009:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-market-detail-page.tsx:1045:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-market-detail-page.tsx:1990:                track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/market-list/index.tsx:609:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/market-list/index.tsx:623:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/market-list/index.tsx:632:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/market-list/index.tsx:739:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/market-list/index.tsx:752:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-order-entry-page.tsx:774:    trackRef.current(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-order-entry-page.tsx:1610:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-order-entry-page.tsx:1806:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-order-entry-page.tsx:1824:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-order-entry-page.tsx:1874:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-order-entry-page.tsx:2197:        track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-order-entry-page.tsx:2363:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-order-entry-page.tsx:2630:              track(MetaMetricsEventName.PerpsUiInteraction, {
ui/pages/perps/perps-order-entry-page.tsx:2904:                track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-view.tsx:192:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-view.tsx:202:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-view.tsx:215:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-deposit-toast.tsx:91:        track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-top-movers/perps-top-movers.tsx:110:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-top-movers/perps-top-movers.tsx:125:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/order-entry/components/leverage-slider/leverage-slider.tsx:64:        track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx:96:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx:112:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.tsx:124:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-trade-buttons/perps-trade-buttons.tsx:128:      // Match mobile Token Details: no PerpsUiInteraction on Long/Short tap;
ui/components/app/perps/perps-candle-period-selector/perps-candle-period-selector.tsx:50:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/close-position/close-position-modal.tsx:827:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-products/perps-products.tsx:56:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-support-learn/perps-support-learn.tsx:85:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-support-learn/perps-support-learn.tsx:97:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-support-learn/perps-support-learn.tsx:118:    track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-tutorial-modal/PerpsTutorialModal.tsx:64:    eventName: MetaMetricsEventName.PerpsUiInteraction,
ui/components/app/perps/perps-tutorial-modal/PerpsTutorialModal.tsx:92:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-tutorial-modal/PerpsTutorialModal.tsx:100:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/hooks/usePerpsDepositConfirmation.ts:91:      track(MetaMetricsEventName.PerpsUiInteraction, {
ui/components/app/perps/perps-fill-tag/perps-fill-tag.tsx:59:    track(MetaMetricsEventName.PerpsUiInteraction, {

exec
/opt/homebrew/bin/zsh -lc "ls node_modules/@metamask/perps-controller 2>/dev/null | head; rg -n 'BUTTON_CLICKED: .button_clicked.|BUTTON_CLICKED = .button_clicked.|button_clicked' node_modules/@metamask/perps-controller --glob '*.{js,ts,d.ts}' | head -40; sed -n '1,130p' ui/hooks/perps/usePerpsEventTracking.ts; git diff --check ca97b63ed467e342de353b98bcd186282730f01d" in /Users/deeeed/dev/metamask/metamask-extension-6
 succeeded in 250ms:
CHANGELOG.md
dist
LICENSE
node_modules
package.json
README.md
node_modules/@metamask/perps-controller/dist/constants/eventNames.js:119:    BUTTON_CLICKED: 'button_clicked',
node_modules/@metamask/perps-controller/dist/constants/eventNames.js:424:        BUTTON_CLICKED: 'button_clicked',
node_modules/@metamask/perps-controller/dist/constants/eventNames.d.ts:101:    readonly BUTTON_CLICKED: 'button_clicked';
node_modules/@metamask/perps-controller/dist/constants/eventNames.d.ts:362:        readonly BUTTON_CLICKED: 'button_clicked';
import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Json } from '@metamask/utils';
import { PERPS_EVENT_PROPERTY } from '../../../shared/constants/perps-events';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../shared/constants/metametrics';
import {
  PerpsAttributionReactContext,
  readScreenViewedHashAttribution,
} from '../../providers/perps/PerpsAttributionContext';
import { useAnalytics } from '../useAnalytics';

export type UsePerpsEventTrackingDeclarativeOptions = {
  eventName: MetaMetricsEventName;
  /**
   * When true the event fires once. The guard resets when conditions becomes
   * false, so the event fires again the next time conditions becomes true
   * (e.g. a modal that can be opened multiple times).
   */
  conditions: boolean;
  properties?: Record<string, Json>;
  /**
   * Optional key that, when changed, resets the fire-once guard so the event
   * fires again. Use when conditions stays true but the subject changes
   * (e.g. navigating between markets while the page stays mounted).
   */
  resetKey?: string | number | boolean | null;
};

export type PerpsTrackEventFn = (
  eventName: MetaMetricsEventName,
  properties?: Record<string, Json>,
) => void;

export function usePerpsEventTracking(): {
  track: PerpsTrackEventFn;
};
export function usePerpsEventTracking(
  options: UsePerpsEventTrackingDeclarativeOptions,
): void;
export function usePerpsEventTracking(
  options?: UsePerpsEventTrackingDeclarativeOptions,
): { track: PerpsTrackEventFn } | void {
  const { trackEvent, createEventBuilder } = useAnalytics();
  const hasFiredDeclarativeRef = useRef(false);

  // Read attribution without throwing: some PERPS_SCREEN_VIEWED call sites
  // (e.g. the compliance banner) are not wrapped by PerpsAttributionProvider.
  const attributionContext = useContext(PerpsAttributionReactContext);
  const screenViewedAttribution = attributionContext?.screenViewedAttribution;

  const buildPerpsEvent = useCallback(
    (eventName: MetaMetricsEventName, properties?: Record<string, Json>) => {
      // Merge stored UTM/deeplink attribution into PERPS_SCREEN_VIEWED at emit
      // time — that event is emitted from the client, so it never passes
      // through the controller's attribution merge.
      // Attribution wins over the call-site: UTM keys are never set by call
      // sites (always safe to add), and a deeplink entry is the authoritative
      // `source`, overriding the screen's default source value.
      // `readScreenViewedHashAttribution` reads the CURRENT hash query at emit
      // time and wins over the provider store. This is the authoritative UTM
      // source: react-router applies the destination `search` one render after
      // `window.location.hash` is already correct, and the declarative fire-once
      // guard blocks any enriched re-fire — so the entry emit must read the hash
      // directly (deterministic, no re-fire). Done for every PERPS_SCREEN_VIEWED
      // regardless of whether a provider wraps the call site, since a stale or
      // absent provider store must not drop UTM. The store still supplies the
      // sticky source and later in-app navigations whose hash lost the UTM.
      const attributedProperties =
        eventName === MetaMetricsEventName.PerpsScreenViewed
          ? {
              ...properties,
              ...(screenViewedAttribution ?? {}),
              ...readScreenViewedHashAttribution(),
            }
          : properties;
      return createEventBuilder(eventName)
        .addCategory(MetaMetricsEventCategory.Perps)
        .addProperties({
          ...attributedProperties,
          [PERPS_EVENT_PROPERTY.TIMESTAMP]: Date.now(),
        })
        .build();
    },
    [createEventBuilder, screenViewedAttribution],
  );

  const track = useCallback<PerpsTrackEventFn>(
    (eventName, properties) => {
      trackEvent(buildPerpsEvent(eventName, properties));
    },
    [buildPerpsEvent, trackEvent],
  );

  const imperativeApi = useMemo(() => ({ track }), [track]);

  const resetKey = options?.resetKey;
  const prevResetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (prevResetKeyRef.current !== resetKey) {
      prevResetKeyRef.current = resetKey;
      hasFiredDeclarativeRef.current = false;
    }
  }, [resetKey]);

  useEffect(() => {
    if (!options) {
      return;
    }

    const { eventName, conditions, properties } = options;

    // Reset the guard when the condition clears so the event fires again on
    // the next open (handles modals that can be opened more than once).
    if (!conditions) {
      hasFiredDeclarativeRef.current = false;
      return;
    }

    if (hasFiredDeclarativeRef.current) {
      return;
    }

    hasFiredDeclarativeRef.current = true;
    trackEvent(buildPerpsEvent(eventName, properties));
  }, [options, trackEvent, buildPerpsEvent]);

  if (options) {

exec
/opt/homebrew/bin/zsh -lc "sed -n '280,350p' ui/pages/perps/perps-market-detail-page.test.tsx; rg -n 'beforeEach|clearAllMocks|resetAllMocks|mockPerpsTrack' ui/pages/perps/perps-market-detail-page.test.tsx; cat package.json | rg -n 'test:unit|lint:tsc' | head; rg -n 'BUTTON_TYPE' . --hidden -g '"'!node_modules'"' -g '"'!.git'"' -g '"'!yarn.lock'"' | head -80" in /Users/deeeed/dev/metamask/metamask-extension-6
 succeeded in 389ms:
    return { track: mockPerpsTrack };
  },
  usePerpsOrderForm: jest.fn(),
  useUserHistory: jest.fn(),
  usePerpsTransactionHistory: jest.fn(),
  usePerpsMarginCalculations: jest.fn(),
  usePerpsMarketFills: (...args: unknown[]) => mockUsePerpsMarketFills(...args),
  usePerpsMarketInfo: jest.fn(() => ({
    market: undefined,
    isLoading: false,
  })),
}));
// Cancel/close/reverse/TP-SL modals call usePerpsAttribution; keep them
// renderable without mounting PerpsAttributionProvider in this page suite.
const mockSetFlowAttribution = jest.fn();
jest.mock('../../hooks/perps/usePerpsAttribution', () => ({
  usePerpsAttribution: () => ({
    buildTrackingData: (input: Record<string, unknown>) => ({
      ...input,
      entryPoint: 'homescreen_tab',
      discoverySource: 'market_list',
    }),
    buildTpslTrackingData: (input: Record<string, unknown>) => input,
    setFlowAttribution: mockSetFlowAttribution,
  }),
}));
jest.mock(
  '../../components/app/perps/hooks/usePerpsDepositConfirmation',
  () => ({
    usePerpsDepositConfirmation: () => ({
      trigger: mockTriggerDeposit,
      isLoading: false,
    }),
  }),
);

const mockLivePositions = jest.fn(() => ({
  positions: mockPositions,
  isInitialLoading: false,
}));
const mockLiveMarketData = jest.fn(() => ({
  markets: [...mockCryptoMarkets, ...mockHip3Markets],
  isInitialLoading: false,
}));

// Mock the perps stream hooks
jest.mock('../../hooks/perps/stream', () => ({
  usePerpsLivePositions: () => mockLivePositions(),
  usePerpsLiveOrders: () => ({
    orders: mockOrders,
    isInitialLoading: false,
  }),
  usePerpsLiveAccount: () => mockLiveAccount(),
  usePerpsLiveMarketData: () => mockLiveMarketData(),
  usePerpsLiveCandles: () => ({
    candleData: {
      symbol: 'ETH',
      interval: '5m',
      candles: [
        {
          time: 1768188300000,
          open: '2880.0',
          high: '2920.0',
          low: '2870.0',
          close: '2900.0',
          volume: '100.0',
        },
      ],
    },
    isInitialLoading: false,
    isLoadingMore: false,
263:const mockPerpsTrack = jest.fn();
280:    return { track: mockPerpsTrack };
593:  beforeEach(() => {
594:    jest.clearAllMocks();
1009:      beforeEach(() => {
1560:      expect(mockPerpsTrack).toHaveBeenCalledWith(
1568:      mockPerpsTrack.mock.calls.forEach(([, properties]) => {
67:    "test": "yarn lint && yarn test:unit",
76:    "test:unit": "node --expose-gc ./node_modules/jest/bin/jest.js",
77:    "test:unit:update-baseline": "UPDATE_BASELINE=ratchet yarn test:unit",
78:    "test:unit:update-baseline:strict": "UPDATE_BASELINE=strict yarn test:unit",
80:    "test:unit:watch": "node --expose-gc ./node_modules/jest/bin/jest.js --watch",
81:    "test:unit:coverage": "node --expose-gc ./node_modules/jest/bin/jest.js --coverage",
82:    "test:unit:webpack": "tsx --test development/webpack/test/*.test.ts",
83:    "test:unit:webpack:coverage": "nyc --reporter=html --reporter=json --reporter=text --report-dir=./coverage/webpack tsx --test development/webpack/test/*.test.ts",
106:    "lint": "yarn lint:json && yarn lint:format && yarn lint:eslint && yarn lint:tsc && yarn lint:styles && yarn lint:images && yarn messenger-action-types:check",
125:    "lint:tsc": "NODE_OPTIONS='--max-old-space-size=6144' tsc",
./ui/pages/musd/screens/education.tsx:170:      button_type: MUSD_EVENTS_CONSTANTS.BUTTON_TYPES.PRIMARY,
./ui/pages/musd/screens/education.tsx:262:      button_type: MUSD_EVENTS_CONSTANTS.BUTTON_TYPES.SECONDARY,
./ui/components/app/musd/musd-events.ts:43:  BUTTON_TYPES: {

exec
/opt/homebrew/bin/zsh -lc 'yarn test:unit --runInBand ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx ui/components/app/perps/perps-support-learn/perps-support-learn.test.tsx ui/pages/perps/market-list/index.test.tsx ui/pages/perps/perps-market-detail-page.test.tsx ui/pages/perps/perps-order-entry-page.test.tsx --silent' in /Users/deeeed/dev/metamask/metamask-extension-6
 exited 1 in 2683ms:
2026-09-24T07:22:21,384: [] fchmod(/Users/deeeed/.local/state/watchman/deeeed-state, 2700): Operation not permitted

Watchman:  watchman --no-pretty get-sockname returned with exit code=1, signal=null, stderr= 2026-09-24T07:22:21,384: [] fchmod(/Users/deeeed/.local/state/watchman/deeeed-state, 2700): Operation not permitted

node:events:487
      throw er; // Unhandled 'error' event
      ^

Error: watchman --no-pretty get-sockname returned with exit code=1, signal=null, stderr= 2026-09-24T07:22:21,384: [] fchmod(/Users/deeeed/.local/state/watchman/deeeed-state, 2700): Operation not permitted

    at ChildProcess.<anonymous> (/Users/deeeed/dev/metamask/metamask-extension-6/node_modules/fb-watchman/index.js:198:18)
    at ChildProcess.emit (node:events:509:28)
    at maybeClose (node:internal/child_process:1141:16)
    at Socket.<anonymous> (node:internal/child_process:498:11)
    at Socket.emit (node:events:509:28)
    at Pipe.<anonymous> (node:net:355:12)
Emitted 'error' event on Client instance at:
    at spawnError (/Users/deeeed/dev/metamask/metamask-extension-6/node_modules/fb-watchman/index.js:170:10)
    at ChildProcess.<anonymous> (/Users/deeeed/dev/metamask/metamask-extension-6/node_modules/fb-watchman/index.js:198:7)
    at ChildProcess.emit (node:events:509:28)
    at maybeClose (node:internal/child_process:1141:16)
    at Socket.<anonymous> (node:internal/child_process:498:11)
    at Socket.emit (node:events:509:28)
    at Pipe.<anonymous> (node:net:355:12)

Node.js v24.19.0

exec
/opt/homebrew/bin/zsh -lc "sed -n '100,130p' node_modules/@metamask/perps-controller/dist/constants/eventNames.js; sed -n '390,450p' node_modules/@metamask/perps-controller/dist/constants/eventNames.js; sed -n '1,115p' ui/pages/perps/market-list/index.tsx; rg -n 'type MarketFilter|enum MarketFilter|MarketFilter =' ui/pages/perps/market-list/index.tsx ui/components/app/perps" in /Users/deeeed/dev/metamask/metamask-extension-6
 succeeded in 0ms:
    STATUS: 'status',
    SCREEN_TYPE: 'screen_type',
    SCREEN_NAME: 'screen_name',
    ACTION: 'action',
    RETRY_ATTEMPTS: 'retry_attempts',
    SHOW_BACK_BUTTON: 'show_back_button',
    ATTEMPT_NUMBER: 'attempt_number',
    // PnL Hero Card properties
    IMAGE_SELECTED: 'image_selected',
    TAB_NUMBER: 'tab_number',
    // VIP rewards properties
    VIP_TIER: 'vip_tier',
    VIP_DISCOUNT: 'vip_discount',
    // A/B testing properties (flat per test for multiple concurrent tests)
    // Only include AB test properties when test is enabled (event not sent when disabled)
    // Button color test
    AB_TEST_BUTTON_COLOR: 'ab_test_button_color',
    // Future tests: add as AB_TEST_{TEST_NAME} (no _ENABLED property needed)
    // Entry point tracking properties
    BUTTON_CLICKED: 'button_clicked',
    BUTTON_LOCATION: 'button_location',
    // Balance properties
    HAS_PERP_BALANCE: 'has_perp_balance',
    // Service interruption banner
    OUTAGE_BANNER_SHOWN: 'outage_banner_shown',
    // Geo-blocking properties (TAT-2337: track geo-blocked withdrawals for monitoring)
    IS_GEO_BLOCKED: 'is_geo_blocked',
    // TP/SL differentiation properties
    HAS_TAKE_PROFIT: 'has_take_profit',
    HAS_STOP_LOSS: 'has_stop_loss',
    TAKE_PROFIT_PERCENTAGE: 'take_profit_percentage',
    SECTION_NAME: {
        BALANCE: 'balance',
        POSITIONS: 'positions',
        ORDERS: 'orders',
        WATCHLIST: 'watchlist',
        WHATS_HAPPENING: 'whats_happening',
        PRODUCTS: 'products',
        TOP_MOVERS: 'top_movers',
        EXPLORE_CRYPTO: 'explore_crypto',
        EXPLORE_COMMODITIES: 'explore_commodities',
        EXPLORE_STOCKS: 'explore_stocks',
        EXPLORE_FOREX: 'explore_forex',
        RECENT_ACTIVITY: 'recent_activity',
    },
    INTERACTION_TYPE: {
        TAP: 'tap',
        ZOOM: 'zoom',
        SLIDE: 'slide',
        SEARCH_CLICKED: 'search_clicked',
        ORDER_TYPE_VIEWED: 'order_type_viewed',
        ORDER_TYPE_SELECTED: 'order_type_selected',
        /** @deprecated Use LEVERAGE_CHANGED instead for clarity */
        SETTING_CHANGED: 'setting_changed',
        /**
         * Perp UI Interaction `leverage_changed`. Properties include `leverage`
         * and `previous_leverage`.
         */
        LEVERAGE_CHANGED: 'leverage_changed',
        TUTORIAL_STARTED: 'tutorial_started',
        TUTORIAL_COMPLETED: 'tutorial_completed',
        TUTORIAL_NAVIGATION: 'tutorial_navigation',
        CANDLE_PERIOD_VIEWED: 'candle_period_viewed',
        CANDLE_PERIOD_CHANGED: 'candle_period_changed',
        FAVORITE_TOGGLED: 'favorite_toggled',
        BUTTON_CLICKED: 'button_clicked',
        // Position management interactions
        CONTACT_SUPPORT: 'contact_support',
        STOP_LOSS_ONE_CLICK_PROMPT: 'stop_loss_one_click_prompt',
        ADD_MARGIN: 'add_margin',
        REMOVE_MARGIN: 'remove_margin',
        INCREASE_EXPOSURE: 'increase_exposure',
        REDUCE_EXPOSURE: 'reduce_exposure',
        FLIP_POSITION: 'flip_position',
        // Hero card interactions
        DISPLAY_HERO_CARD: 'display_hero_card',
        SHARE_PNL_HERO_CARD: 'share_pnl_hero_card',
        // Chart interactions
        FULL_SCREEN_CHART: 'full_screen_chart',
        // Pay-with interactions
        PAYMENT_TOKEN_SELECTOR: 'payment_token_selector',
        PAYMENT_METHOD_CHANGED: 'payment_method_changed',
        // Deposit + order (pay-with token) cancel
        CANCEL_TRADE_WITH_TOKEN: 'cancel_trade_with_token',
        // Slippage interactions
        SLIPPAGE_CONFIG_OPENED: 'slippage_config_opened',
        SLIPPAGE_CONFIG_CHANGED: 'slippage_config_changed',
        SLIPPAGE_LIMIT_BLOCKED_ORDER: 'slippage_limit_blocked_order',
        SCALE_CONFIG_CHANGED: 'scale_config_changed',
        SCALE_VALIDATION_ERROR_SHOWN: 'scale_validation_error_shown',
        // Auto Close TP/SL RoE sign toggle
        TPSL_ROE_SIGN_TOGGLED: 'tpsl_roe_sign_toggled',
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  BoxFlexDirection,
  BoxAlignItems,
  BoxJustifyContent,
  Text,
  TextVariant,
  FontWeight,
  Icon,
  IconName,
  IconSize,
  IconColor,
  TextColor,
  ButtonBase,
} from '@metamask/design-system-react';
import {
  getMarketTypeFilter,
  MARKET_CATEGORIES,
  matchesCategory,
  type PerpsMarketData,
} from '@metamask/perps-controller';
import { usePerpsEntryTrace } from '../../../hooks/perps/usePerpsEntryTrace';
import {
  PERPS_EVENT_PROPERTY,
  PERPS_EVENT_VALUE,
} from '../../../../shared/constants/perps-events';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  usePerpsLiveAccount,
  usePerpsLiveMarketListData,
} from '../../../hooks/perps/stream';
import {
  filterMarketsByQuery,
  isCryptoMarket,
  isHip3Market,
} from '../../../components/app/perps/utils';
import {
  DEFAULT_ROUTE,
  PERPS_MARKET_DETAIL_ROUTE,
  PREVIOUS_ROUTE,
} from '../../../helpers/constants/routes';
import {
  getIsPerpsExperienceAvailable,
  getHip3AllowedSourcesSet,
} from '../../../selectors/perps/feature-flags';
import {
  selectPerpsIsTestnet,
  selectPerpsWatchlistMarkets,
} from '../../../selectors/perps-controller';
import {
  sortMarkets,
  type SortField,
  type SortDirection,
} from '../utils/sortMarkets';
import {
  normalizeMarketFilter,
  WATCHLIST_MARKET_FILTER,
  type MarketFilter,
} from '../../../../shared/constants/perps';
import { MetaMetricsEventName } from '../../../../shared/constants/metametrics';
import { usePerpsEventTracking } from '../../../hooks/perps';
import { usePerpsAttribution } from '../../../hooks/perps/usePerpsAttribution';
import { getTradeableBalance } from '../../../hooks/perps/getTradeableBalance';
import { MarketRow } from '../../../components/app/perps/market-row';
import { PerpsCategoryRail } from '../../../components/app/perps/perps-market-categories';
import { MarketRowSkeleton } from './components/market-row-skeleton';
import { SortDropdown, SORT_FIELD_OPTIONS } from './components/sort-dropdown';
import { SearchInput } from './components/search-input';

/**
 * Settle window before a typed query counts as a real search, matching mobile
 * so the two clients report comparable search funnels.
 */
const SEARCH_QUERY_DEBOUNCE_MS = 500;

/**
 * `mode` values reported on the market-search funnel events. Values match
 * mobile's inline literals in `PerpsMarketListView` so both clients report the
 * same vocabulary.
 */
const SEARCH_MODE = {
  DISCOVERY: 'discovery',
  INTENT: 'intent',
  BROWSE: 'browse',
} as const;

/** A short ticker-like token ("btc", "hype2") reads as a targeted lookup. */
const TICKER_LIKE_QUERY = /^[a-z0-9]{1,6}$/u;

/**
 * Sort values accepted on the `sort` / `direction` search params. The fields
 * are the ones the sort dropdown itself offers, so a deeplink can never select
 * a ranking the user could not reach from the UI.
 */
const SORT_DIRECTIONS: SortDirection[] = ['asc', 'desc'];
const DEFAULT_SORT_FIELD: SortField = 'volume';
const DEFAULT_SORT_DIRECTION: SortDirection = 'desc';

const isSortField = (value: string | null): value is SortField =>
  SORT_FIELD_OPTIONS.some((option) => option.id === value);

const isSortDirection = (value: string | null): value is SortDirection =>
  SORT_DIRECTIONS.some((direction) => direction === value);

/**
ui/pages/perps/market-list/index.tsx:68:  type MarketFilter,
ui/components/app/perps/constants.ts:12:  type MarketFilter,

exec
/opt/homebrew/bin/zsh -lc 'yarn test:unit --watchman=false --runInBand ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx ui/components/app/perps/perps-support-learn/perps-support-learn.test.tsx ui/pages/perps/market-list/index.test.tsx ui/pages/perps/perps-market-detail-page.test.tsx ui/pages/perps/perps-order-entry-page.test.tsx --silent' in /Users/deeeed/dev/metamask/metamask-extension-6
 succeeded in 44956ms:
PASS ui/pages/perps/perps-order-entry-page.test.tsx (20.891 s)
PASS ui/pages/perps/perps-market-detail-page.test.tsx (7.963 s)
PASS ui/pages/perps/market-list/index.test.tsx (7.242 s)
PASS ui/components/app/perps/perps-market-balance-actions/perps-market-balance-actions.test.tsx
PASS ui/components/app/perps/perps-support-learn/perps-support-learn.test.tsx

Test Suites: 5 passed, 5 total
Tests:       332 passed, 332 total
Snapshots:   0 total
Time:        41.74 s, estimated 176 s


════════════════════════════════════════════════════════════════════════════════
  Console Baseline Report (Per-File)
════════════════════════════════════════════════════════════════════════════════

✨ CONSOLE IMPROVEMENTS DETECTED

  Great job! The following warnings were reduced:

  📁 ui/pages/perps/perps-order-entry-page.test.tsx
     🎉 FIXED: React: componentWill* lifecycle deprecations
        All 1 occurrences eliminated!

  📁 ui/pages/perps/perps-market-detail-page.test.tsx
     🎉 FIXED: React: Act warnings (component updates not wrapped)
        All 5 occurrences eliminated!

  💡 To lock in improvements:
     - Edit baseline manually, OR
     - Run yarn test:unit:update-baseline:strict (allows decreases - use with caution)

════════════════════════════════════════════════════════════════════════════════
  SUMMARY
    Files analyzed: 5
    Violations: 0
    Improvements: 2
    New files: 0
════════════════════════════════════════════════════════════════════════════════



codex
The changes consistently replace the perps-only button_type property with the controller's button_clicked property. All five affected test suites passed.
The changes consistently replace the perps-only button_type property with the controller's button_clicked property. All five affected test suites passed.
