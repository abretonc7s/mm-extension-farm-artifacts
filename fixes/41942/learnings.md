# Learnings — TAT-2847

- **Investigation vs fix ratio**: Investigation took ~60% of time due to analyzing CSS flex behavior in multiple viewport contexts. The actual fix was 1 line. The key insight (box is content-sized vs full-width) required CDP measurements to confirm.

- **CDP fullscreen vs popup**: The bug only manifests in popup mode (~360px). The CDP test environment uses `home.html` (fullscreen, 500px+). Recipe assertions need to test the structural property (heroFillsParent: widthRatio >= 0.95) not just the visual centering, otherwise the bug is invisible in fullscreen.

- **Recipe action `click` doesn't exist**: Use `press` for button clicks, `set_input` for text inputs. The `click` action is not in the recipe runner. Don't guess action names.

- **Screenshots go to test-artifacts/screenshots/**: Recipe screenshots are saved at `temp/agentic/recipes/test-artifacts/screenshots/` with a timestamp suffix, not in the artifacts dir. The recipe rename loop assumes a relative path; fix by using the actual screenshot dir.

- **`w-full` is the right centering pattern**: When a flex-row container needs to center content at all viewport sizes, it must be full-width (`w-full`) so `justify-content: center` has space to work in. Content-sized boxes rely on the parent to center them, which breaks in narrow viewports.
