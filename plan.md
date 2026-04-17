## Plan: Time Zone Overlap SPA

Build a greenfield React + TypeScript SPA for comparing multiple IANA time zones, visualizing local business hours, and analyzing overlap for 24x7 operations planning. Use a timeline-first UI with complementary overlap summaries. For v1, keep business-hours rules to recurring weekly schedules only, persist state in both local storage and shareable URLs, and compute exact overlap windows with DST-safe timezone handling.

**Current Status**

Iterations 0–8, 10, 11, and 12 complete, Iteration 9 cancelled, plus out-of-iteration work. App features:

- React + TypeScript SPA with Vite, Zustand state, @dnd-kit drag-and-drop, luxon for timezone math.
- Seeded with 3 zones (New York, London, Tokyo); searchable ~160-entry city database (new IANA zones + aliases).
- **Timeline view**: 24-hour grid per zone (12 on mobile) with hourly rulers, current-time highlighting, business-hour background colors, and all-zone overlap visualization.
- **Overlap calculation**: Computes shared windows across ALL selected zones using DST-safe UTC interval math.
- **Overlap legend**: Visual indicator and explanatory text when shared overlap windows exist.
- **Overlap explanation cleanup**: Shared overlap meaning is presented in the timeline legend only; the redundant standalone overlap panel was removed.
- **Pairwise overlap matrix**: Table below the timeline stack; shows total overlap minutes for every zone pair with intensity-scaled cell backgrounds; horizontally scrollable.
- **Persistence and share URLs**: Restore scenarios from local storage, hydrate from URL state when present, and copy a shareable URL from the sidebar.
- **Accessibility and responsive pass**: Keyboard-selectable timezone search, visible focus treatment, explicit timeline legend and status text, and horizontal scrolling for dense timeline tracks on narrow screens.
- **Playwright E2E enablement**: Chromium smoke tests cover app load, keyboard timezone add flow, and overlap legend behavior against a real Vite server.
- Business-hours configuration (start/end times, support for overnight spans) with live timeline updates.
- Drag-and-drop zone reordering plus keyboard controls (arrow keys).
- Target zone marking with visual distinction and timeline anchoring.
- DST-safe timezone conversion utilities with UTC interval calculations.
- **Light and dark theme**: radio toggle in the page header; persisted via local storage.
- **Overlap UTC-window fix**: pairwise and all-zone overlap now compare all zones against the same UTC day window; resolves incorrect "none" results for half-hour-offset zones (e.g. Asia/Kolkata) that have crossed midnight locally.
- Comprehensive test coverage (70 in-repo checks: 36 timezone + 16 store + 14 app + 4 Playwright E2E smoke).
- Responsive layout: desktop (2-column sidebar + timeline), mobile (single column, 12-hour timeline).
- All validation passing: tests, Playwright E2E, lint, build, format.

Next: stretch items or v2 planning.

**Cancelled Work**

- Iteration 9: handoff gap analysis was implemented experimentally, then removed because the meaning was confusing in the current product model and did not add enough value relative to the added complexity.

**Steps**

1. Phase 1: Foundation. Scaffold a React + TypeScript SPA with a lightweight build tool, define application state shape for ordered selected zones, target zones, per-zone business-hours rules, display settings, and persisted/shareable state, and choose a DST-safe timezone library plus a drag-and-drop library. This phase blocks all later work.
2. Phase 2: Domain model and timezone engine. Implement the core domain model for selected zones, target flags, recurring weekly business-hours rules, overlap windows, pairwise overlap summaries, and handoff gaps. Normalize all calculations around UTC while storing business-hours definitions as local wall-clock times per zone. This depends on step 1.
3. Phase 3: Timezone selection and ordering UI. Build the selector for full IANA timezone search/lookup, selected-zone list, remove actions, and ordering controls with both drag-and-drop and accessible keyboard reordering. This depends on step 1 and can run in parallel with step 4 once the shared state contract is defined.
4. Phase 4: Business-hours configuration. Add per-timezone configurable business hours with country/region-aware defaults where feasible, falling back to a weekday 09:00-17:00 local schedule. Keep v1 limited to recurring weekly hours only, with no holiday or exception modeling. This depends on step 2 and can run in parallel with step 3.
5. Phase 5: Core visualization. Implement the main 24-hour comparison surface, preferably with two synchronized views: a timeline/grid for each zone's local day and a derived overlap layer that highlights business-hour windows, all-zone shared windows, and target-relevant windows. This depends on steps 2, 3, and 4.
6. Phase 6: Analytical outputs. Add computed shared overlap windows across all selected zones, a pairwise overlap summary matrix, and handoff-gap detection for 24x7 planning. Prioritize analysis around marked target zones by highlighting, filtering, and sorting relevant overlaps. This depends on step 5.
7. Phase 7: Persistence and sharing. Persist the current scenario in local storage and mirror it into shareable URL state with versioning and migration guards. Include load/reset behavior and clearly define conflict precedence if both URL state and local state exist. This depends on steps 2 and 3 and should be finalized after step 5 so URL shape matches the real product state.
8. Phase 8: Accessibility, responsiveness, and polish. Ensure keyboard support for selection and reordering, accessible timeline semantics, color-independent overlap cues, mobile-friendly layouts, and performance checks with larger timezone sets. This depends on steps 3 through 7.
9. Phase 9: Verification. Validate DST transitions, non-integer offsets, target-zone filtering, state persistence, URL restoration, and overlap correctness with both automated tests and manual scenario checks. This runs throughout, with final pass after step 8.

**Relevant files**

- /Users/alexzad/epm/time-zones/package.json - project dependencies and scripts for the SPA scaffold.- /Users/alexzad/epm/time-zones/src/data/timezones.ts — curated IANA timezone list with city labels used for search and add flows.- /Users/alexzad/epm/time-zones/src/app - app shell, routing or top-level composition, and persistence bootstrapping.
- /Users/alexzad/epm/time-zones/src/features/timezones - timezone search, selected list, ordering, and target selection.
- /Users/alexzad/epm/time-zones/src/features/business-hours - recurring weekly business-hours editor and defaults.
- /Users/alexzad/epm/time-zones/src/features/visualization - timeline/grid rendering and overlap overlays.
- /Users/alexzad/epm/time-zones/src/features/analysis - pairwise matrix, shared windows, and handoff-gap summaries.
- /Users/alexzad/epm/time-zones/src/lib/timezone - DST-safe conversion, overlap computation, and formatting utilities.
- /Users/alexzad/epm/time-zones/src/state - app state, selectors, URL serialization, and storage sync.
- /Users/alexzad/epm/time-zones/src/test or /Users/alexzad/epm/time-zones/tests - unit tests for timezone logic and integration tests for the main flows.

**Verification**

1. Unit-test timezone conversion and overlap calculations across DST boundaries in North America, Europe, and zones without DST.
2. Unit-test half-hour and quarter-hour offset zones such as Asia/Kolkata and Australia/Eucla to avoid assuming whole-hour offsets.
3. Unit-test recurring weekly business-hours logic, including windows that cross midnight.
4. Integration-test adding, removing, reordering, and marking target zones, including keyboard accessibility paths.
5. Integration-test overlap summaries, pairwise matrix outputs, and handoff-gap detection against fixed known scenarios.
6. Validate local storage persistence, URL round-tripping, and state restoration precedence rules.
7. Manually verify responsive behavior for desktop and mobile widths and ensure the timeline remains readable with 6-10 zones selected.

**Decisions**

- Stack: React + TypeScript SPA.
- Timezone selection: full IANA list with search/lookup.
- Targets: target zones should highlight, prioritize overlap calculations, and support target-focused filtering. The target zone's business-hours midpoint drives the UTC anchor of the shared timeline so that zone always appears centered.
- Business hours: per-timezone configurable with region-aware defaults where feasible; v1 excludes holidays and one-off exceptions. Overnight windows (e.g. 22:00–06:00) are supported.
- Timeline rendering: slot-based with a shared UTC reference window. Each card derives local hours from the zone's real UTC offset. The target zone's business-hours midpoint is computed in UTC and used as the center column, so all zone tracks are horizontally aligned to real time differences.
- Persistence: both local storage and shareable URL state.
- Deployment workflow: publish the `deploy` branch from a separate checkout or git worktree, not from the main development checkout.
- UI validation workflow: keep a small Playwright smoke suite for load, keyboard interaction, and overlap-meaning regressions.
- Core outputs for v1: business-hours visualization, computed shared overlap windows, pairwise overlap matrix, and coverage or handoff-gap analysis.
- Preferred technical direction: exact interval-based calculations for overlap logic plus slot-based rendering for the visualization layer.

**Further Considerations**

1. Recommended additional feature: a reference-time scrubber that lets the user move through a 24-hour UTC window and see each zone update in sync. This improves operational planning and debugging of overlap logic.
2. Recommended additional feature: saved named scenarios such as Follow-the-sun support, Americas plus EMEA, or custom team presets. This fits naturally with local persistence and URL sharing.
3. Recommended alternative view: add a coverage heatmap as a secondary analysis tab if the main timeline becomes visually dense with many zones. It is especially useful for identifying 24x7 handoff gaps faster than a pure timeline.
4. Explicitly exclude for v1 unless requirements change: public holiday calendars, staffing capacity modeling, real-time roster imports, and meeting-booking workflows.
