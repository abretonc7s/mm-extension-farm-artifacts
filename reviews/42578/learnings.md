# Learnings — PR #42578

- **Playwright locator `wait_for` fails on MM modals**: The `Modal` component renders a wrapper div with `data-testid` even when `isOpen=false`, causing `wait_for` to find the element but report it as "hidden". Use `eval_sync` to check for a child element that only renders when the modal content is actually visible (e.g., a specific option button).

- **`ext_navigate_hash` + `wait_for` is unreliable for perps pages**: The perps market list at `#/perps/market-list` loads via React Router lazy loading. `eval_sync` with `location.hash = '#/perps/market-list'` + fixed wait (5s) + assert is more reliable than `ext_navigate_hash` + Playwright `wait_for`.

- **Tailwind class matching must be exact**: `className.includes('bg-hover')` matches both `bg-hover` (selected state) and `hover:bg-hover` (hover pseudo-class on unselected items). Use `className.split(' ').some(c => c === 'bg-hover')` for precise matching.

- **Market list route**: The perps market list is at `/perps/market-list` (not just `/perps`). The `navigate-perps-tab` flow goes to PerpsHome (`/perps`), which is the portfolio view. For market list reviews, navigate directly to `/perps/market-list`.

- **FilterSelect uses Dropdown component**: The `FilterSelect` wrapper passes `testId="filter-select"` to the generic `Dropdown` component, generating test IDs like `filter-select-button`, `filter-select-menu`, `filter-select-option-all`, `filter-select-option-crypto`, etc.

- **SortDropdown testIDs**: `sort-dropdown-button`, `sort-field-modal`, `sort-field-option-{volume,priceChange,openInterest,fundingRate}`, `sort-direction-{desc,asc}`, `sort-modal-cancel`, `sort-modal-apply`.

- **Mobile vs extension design divergence in sort**: Mobile uses a flat list with direction toggle on the selected item. Extension uses separate "SORT BY" and "RANK" sections. This is intentional per extension-specific Figma spec — not a bug.

- **`all` not `and` for composite assertions**: The recipe runner uses `all: [...]` for AND logic, not `and: [...]`. Similarly `any` for OR.

- **Recipe runner saves screenshots in `artifacts/screenshots/`**: Not in the `evidence/` directory. Copy evidence files manually to `artifacts/evidence/` after a run.

- **Use `eval_sync` clicks over `press` for modals**: `document.querySelector('[data-testid="..."]').click()` via `eval_sync` is more reliable than the `press` action for elements inside modals or dynamically rendered components.
