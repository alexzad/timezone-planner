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

Status

- Complete.
- 81 curated IANA timezones in src/data/timezones.ts, searchable by city name or zone id.
- addZone and removeZone actions in the store backed by 17 passing tests.
- If the removed zone was the only target, the first remaining zone becomes the new target automatically.

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

- Complete.
- Complete: keyboard move earlier or later controls backed by app state.
- Complete: target-zone toggles with visual distinction in sidebar and timeline.
- Complete: UTC-anchored timeline — target zone's business hours centered, all rows shifted by real timezone offset.
- Complete: per-card local hour rulers that show each zone's actual local time rather than a shared 0–23 scale.
- Complete: business-hour highlighting derived from each zone's configured window including overnight spans.
- Complete (landed with iteration 2): timezone search, add, and remove flows are available in the sidebar.
- Complete: drag-and-drop ordering (SortableZoneCard with @dnd-kit) with reorderZones store action.

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

Status

- Complete.
- Complete: editable start/end time inputs on each zone card.
- Complete: live timeline update when business hours change.
- Complete: setBusinessHours store action with immutable per-zone updates.
- Complete: midnight-crossing windows supported and visually highlighted.
- Complete: store tests pass for reorderZones and setBusinessHours actions.
- Complete: app integration tests pass for business-hours time input changes.

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

Status

- Complete.
- Created src/lib/timezone.ts with 18 utility functions for DST-safe conversions and overlap calculations.
- Key utilities: parseTimeToMinutes, convertLocalToUtc, convertUtcToLocal, getBusinessHoursUtcInterval, computePairwiseOverlapDuration, computeAllZoneOverlap, computeCoverageGaps.
- Created comprehensive test suite (35 tests) covering DST transitions (North America spring/fall, Europe spring/fall) and non-whole-hour offsets (Kolkata +5:30, Eucla +8:45, Nepal +5:45).
- All tests passing (55 total: 35 timezone + 13 store + 7 app).
- All validation passing: lint, build, format.

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

Status

- Complete.
- Timeline view already implemented via 24-column grid per zone with hourly rulers.
- Current local time displayed via badges and outline on current-hour cells.
- Business-hour highlighting applied with color-mixed background per zone's accent color.
- Responsive design: full 24 hours on desktop, 12 hours on mobile; single-column layout on narrow screens.
- Refactored App.tsx to import parseTimeToMinutes from timezone utilities (Iteration 5) for consistency.
- Seeded with 3 zones (New York, London, Tokyo) displaying correctly on timeline.
- All tests passing (55 total), lint clean, build successful (28 modules).

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

Status

- Complete.
- Imported computeAllZoneOverlap from timezone utilities and integrated into App component.
- Added helper function isHourInAllZoneOverlap to check if local hours fall within all-zone overlap intervals.
- Updated timeline cell rendering to include is-all-zone-overlap class for cells within shared windows.
- Added overlap legend component (overlap-legend) that displays when overlaps exist.
- One-line overlap legend shows "Shared overlap window" with indicator and explanation.
- Added CSS styling for overlap visualization: blue gradient backgrounds with box shadow for distinctiveness.
- Legend has dedicated styles: light blue background panel, styled indicator box, and descriptive text.
- Added new integration test verifying overlap legend structure and composition.
- All tests passing (56 total: 35 timezone + 13 store + 8 app), lint clean, build successful (28 modules, CSS 7.70 KB).

## Iteration 8: Pairwise Overlap Matrix

- Build a pairwise overlap summary matrix for all selected zones.
- Show total overlap duration for each pair within the chosen planning window.
- Allow matrix cells to highlight the corresponding zones in the main view.
- Keep the matrix readable for at least 6 zones.

Checkpoint

- The matrix renders correct pairwise overlap summaries.
- Clicking a matrix cell visibly focuses the relevant pair in the main view.
- Matrix results match expected values in test fixtures.

Status

- Complete.
- Added PairwiseMatrix inline below the timeline stack; renders when 2+ zones are selected.
- Calls computePairwiseOverlapDuration from timezone utilities for every unique pair.
- Self-diagonal cells show em-dash; overlap cells show duration formatted as "Xh Ym" or "Xh" or "none".
- Cell background intensity scales linearly with duration (0=transparent, 8h=full blue).
- Horizontally scrollable wrapper so wide tables stay readable at any viewport width.
- Added CSS: .overlap-matrix, .overlap-matrix\_\_cell, --has-overlap, --no-overlap, --self, col/row headers.
- Added 2 new integration tests: matrix structure (headers, self-cells) and known 3h NY↔London overlap.
- All tests passing (58 total: 35 timezone + 13 store + 10 app), lint clean, build successful (CSS 8.89 KB).

## Out-of-Iteration: Timezone Database Expansion

Status

- Complete (landed alongside Iteration 8 fixes).
- Expanded src/data/timezones.ts from 81 to ~160 entries.
- Added new IANA zones: America/Phoenix, America/Edmonton, America/Winnipeg, America/Guatemala, America/Panama, America/Montevideo, Africa/Algiers, Africa/Tunis, Africa/Accra, Africa/Khartoum, Africa/Addis_Ababa, Africa/Luanda, Africa/Kinshasa, Asia/Kuwait, Asia/Baghdad, Asia/Muscat, Asia/Jerusalem, Asia/Tbilisi, Asia/Yerevan, Asia/Yekaterinburg, Asia/Novosibirsk, Asia/Ulaanbaatar, Asia/Vladivostok, Pacific/Port_Moresby.
- Added city aliases for major cities sharing a zone (e.g., Beijing, Osaka, Barcelona, Milan, Boston, São Paulo, Lahore).
- Fixed React key collision in search dropdown: key changed from zone → zone::city to support multiple entries per IANA zone.
- Updated search test to use getAllByRole instead of getByRole for cities with multiple matches.

## Iteration 9: Handoff Gap Analysis

- Compute handoff gaps for 24x7 coverage planning.
- Show uncovered windows clearly in an analysis panel.
- Highlight whether a gap is covered by any target zone.
- Add at least one fixed scenario test that proves the gap logic.

Checkpoint

- Gaps appear when coverage is incomplete.
- Changing schedules updates the reported gaps.
- Gap calculations pass fixture-based tests.

Status

- Cancelled.
- The section was implemented experimentally, then removed from the UI.
- Reason: the meaning was too easy to misread because it showed gaps in non-target coverage rather than true global uncovered time.
- Decision: keep pairwise overlap and shared overlap views, and do not ship handoff-gap analysis in v1.

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
