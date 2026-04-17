# Time Zone Overlap SPA Todo

This backlog is organized into short iterations. Each iteration should end with a working state you can run and test before moving on.

## Working Rules

- Keep each iteration small enough to complete in one focused session.
- Do not start the next iteration until the current checkpoint passes.
- Prefer shipping a thin vertical slice over building multiple incomplete subsystems in parallel.
- Keep a visible changelog in the app UI only when it helps testing; otherwise rely on git history.

## Iteration 0: Project Setup

- Scaffold the React + TypeScript SPA with the chosen toolchain.
- Add linting, formatting, and a basic test runner.
- Add the core dependencies for timezone math, state management, and drag-and-drop.
- Create the top-level app shell with placeholder regions for sidebar, timeline, and analysis panel.
- Add a README section with run, test, and build commands.

Checkpoint

- App starts locally.
- The page renders a stable shell with placeholder sections.
- Lint and test commands run successfully.

## Iteration 1: Core State and Sample Data

- Define the core types for selected timezones, target flags, business-hours rules, UI settings, and derived overlap results.
- Build the initial app store or reducer.
- Seed the app with a small hardcoded scenario such as New York, London, and Tokyo.
- Render the selected zones list from state only, with no editing yet.

Checkpoint

- App shows the seeded timezones from real state, not hardcoded UI markup.
- Reloading the page keeps the app stable.
- Tests cover the basic state transitions.

Status

- Complete.

## Iteration 2: Timezone Search and Add Flow

- Add timezone search over the full IANA timezone list.
- Support search by city-like label and timezone id.
- Prevent duplicate selection.
- Add a timezone to the selected list.
- Remove a timezone from the selected list.

Checkpoint

- You can add multiple timezones through search.
- Duplicate adds are blocked.
- Removing a timezone updates the list immediately.

## Iteration 3: Ordering and Target Selection

- Add reordering controls for selected timezones.
- Support drag-and-drop ordering.
- Add keyboard-accessible move up and move down controls as a fallback.
- Add target-zone selection.
- Visually distinguish target zones in the list.

Checkpoint

- You can reorder zones and the order persists in app state.
- One or more zones can be marked as target.
- Target zones are visually obvious.

Status

- In progress.
- Complete: keyboard move earlier or later controls backed by app state.
- Complete: target-zone toggles with visual distinction in sidebar and timeline.
- Verified: seeded reorder flow updates the sidebar list and timeline rows together.
- Next: drag-and-drop ordering to complement the keyboard controls.

## Iteration 4: Business Hours Model

- Define recurring weekly business-hours rules per timezone.
- Add fallback defaults of weekdays 09:00-17:00 local time.
- Support custom start and end times per timezone.
- Support windows that cross midnight.
- Add unit tests for business-hours rule evaluation.

Checkpoint

- Each timezone shows editable business hours.
- Updating a zone's hours changes the stored state correctly.
- Midnight-crossing schedules are handled in tests.

## Iteration 5: DST-Safe Timezone Engine

- Implement timezone conversion utilities using a DST-safe library.
- Normalize overlap calculations around UTC.
- Convert local business-hours windows into UTC intervals for a chosen day.
- Add tests for DST boundaries in at least North America and Europe.
- Add tests for half-hour and quarter-hour offset zones.

Checkpoint

- Utility tests pass for DST transitions.
- Utility tests pass for non-whole-hour offsets.
- The app can compute local and UTC values for selected zones without UI errors.

## Iteration 6: Basic Timeline View

- Render a 24-hour timeline/grid for each selected timezone.
- Show hourly markers and each zone's local-day alignment.
- Show current local time for each zone.
- Highlight normal business hours on the timeline.
- Keep the view readable with at least 4 selected zones.

Checkpoint

- You can visually compare local times across zones on one screen.
- Business hours are clearly visible for each row.
- Reordering zones changes the timeline row order immediately.

## Iteration 7: Shared Overlap Visualization

- Compute exact shared overlap windows across all selected zones.
- Overlay all-zone shared windows on the main timeline.
- Highlight target-relevant overlap windows separately.
- Add a simple legend that explains business hours, target zones, and overlap states.
- Add tests for overlap calculations using fixed known scenarios.

Checkpoint

- Shared overlap windows appear in the timeline.
- Changing business hours or targets changes the overlap overlay immediately.
- Fixed overlap test scenarios pass.

## Iteration 8: Pairwise Overlap Matrix

- Build a pairwise overlap summary matrix for all selected zones.
- Show total overlap duration for each pair within the chosen planning window.
- Allow matrix cells to highlight the corresponding zones in the main view.
- Keep the matrix readable for at least 6 zones.

Checkpoint

- The matrix renders correct pairwise overlap summaries.
- Clicking a matrix cell visibly focuses the relevant pair in the main view.
- Matrix results match expected values in test fixtures.

## Iteration 9: Handoff Gap Analysis

- Compute handoff gaps for 24x7 coverage planning.
- Show uncovered windows clearly in an analysis panel.
- Highlight whether a gap is covered by any target zone.
- Add at least one fixed scenario test that proves the gap logic.

Checkpoint

- Gaps appear when coverage is incomplete.
- Changing schedules updates the reported gaps.
- Gap calculations pass fixture-based tests.

## Iteration 10: Persistence and Shareable URLs

- Save selected zones, order, targets, business hours, and view settings to local storage.
- Serialize the same state into a shareable URL.
- Restore app state from URL on load.
- Define and implement precedence rules when URL state and local state both exist.
- Add versioning to persisted state.

Checkpoint

- Reloading restores the previous scenario.
- Opening a shared URL restores the same scenario on a clean load.
- Persistence tests pass.

## Iteration 11: Responsive and Accessible Interaction Pass

- Ensure keyboard access for search, add, remove, reorder, and target selection.
- Make timeline and matrix interaction usable on tablet and mobile widths.
- Add non-color cues for overlap and target states.
- Verify labels, focus order, and basic screen-reader semantics.

Checkpoint

- Core flows work without a mouse.
- The layout remains usable on narrow screens.
- Overlap meaning is understandable without relying on color alone.

## Iteration 12: Polish and Release Candidate

- Clean up rough UI edges and inconsistent spacing.
- Remove debug-only scaffolding.
- Add empty, loading, and error states where needed.
- Review naming, copy, and visual hierarchy.
- Run the full test suite and fix only issues related to shipped scope.

Checkpoint

- The app feels coherent end to end.
- There are no blocking UI or logic issues in the planned scope.
- Build, lint, and tests all pass.

## Stretch Items After v1

- Add a UTC reference-time scrubber.
- Add saved named scenarios and quick presets.
- Add a secondary coverage heatmap view.
- Add export or import of saved scenarios.

## Suggested Execution Rhythm

- End every iteration with a quick manual demo.
- After iterations 3, 7, 10, and 12, pause for a slightly deeper review before continuing.
- Do not merge more than one major logic change and one major UI change into the same checkpoint.

## Review Gates

### Gate A: After Iteration 3

- Confirm the app structure and interaction model before deeper time logic work.
- Verify the selected-zone workflow feels efficient enough to keep.
- Current result: ready for that review with seeded ordering and target-selection behavior in place.

### Gate B: After Iteration 7

- Confirm the timeline is the right primary visualization.
- Verify the overlap presentation is understandable before building more analysis views.

### Gate C: After Iteration 10

- Confirm the saved and shared scenario model is stable.
- Verify the URL shape is acceptable before locking it in.

### Gate D: After Iteration 12

- Final acceptance for v1 scope.
- Decide whether any stretch item should move into the next milestone.
