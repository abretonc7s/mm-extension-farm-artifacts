# Merge Report

## Conflicted Files

- `ui/components/app/perps/edit-margin/edit-margin-modal-content.test.tsx` — manual resolution.

## Resolution Notes

- Kept the branch tests for liquidation-distance formatting, including the nonpositive liquidation price fallback to `--`.
- Kept main's new auto-focus, select-all, and Enter-key submission tests. These cover independent input behavior and do not conflict with the PR's liquidation fallback intent.

## Risks / Manual Verification

- Feature/app code had manual test conflict resolution. The targeted component test should be run after the merge to confirm both the fallback and new input behavior remain covered.
