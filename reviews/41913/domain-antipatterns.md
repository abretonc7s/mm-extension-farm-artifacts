# Domain Anti-Pattern Review

- Import boundaries: no new `app/` imports into `ui/`, no `shared` boundary violations, no new restricted-path suppressions.
- Controller usage: selector-only UI changes; no new controller instantiation, direct storage writes, or state-shape migrations.
- LavaMoat/dependencies: no `package.json` or `yarn.lock` changes, so no LavaMoat policy update required.
- MV3 service worker: no `chrome.runtime.getBackgroundPage()`, persistent timers, or service-worker module state added.
- Component hierarchy: existing `Toast` and design-system icons are reused; no new custom component layer.
- Magic strings/numbers: transaction statuses/types use controller enums; existing toast timeout uses `SECOND`.
- Test patterns: tests use existing providers and i18n messages; existing `fireEvent` usage is pre-existing test style in the touched page suite.
- Feature flags: no new ungated feature, only behavior correction inside existing Perps surfaces.
- Agentic testability: no new interactive UI controls requiring test IDs; the existing `perps-deposit-toast` test ID remains available for validation.
