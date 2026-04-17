# Time Zone Overlap Planner

Greenfield React + TypeScript SPA for planning overlap across multiple IANA time zones for 24x7 operations.

## Current Status

Iterations 0–7 complete. The app is a fully interactive timezone overlap planning tool.

- Vite + React + TypeScript scaffold with ESLint, Prettier, and Vitest
- Zustand state management with 9 actions; seeded with New York, London, Tokyo
- 81-timezone IANA search with live dropdown, duplicate prevention, and remove controls
- Drag-and-drop zone reordering (@dnd-kit) plus keyboard controls (↑/↓)
- Target-zone selection with visual distinction and timeline anchoring
- Per-zone editable business hours (start/end, supports midnight-crossing windows)
- UTC-anchored 24-hour timeline: target zone's business hours centered; all zones aligned to real offset
- Per-card local hour rulers; business-hour cells highlighted with zone accent color
- **All-zone overlap visualization**: shared overlap windows shown with blue gradient cells and a legend
- DST-safe timezone utilities (18 functions): UTC interval math, pairwise/all-zone overlaps, coverage gaps
- 56 automated tests (35 timezone utilities + 13 store unit + 8 app integration)
- Responsive layout: sidebar + timeline on desktop; single column on mobile; 12-hour rulers on narrow screens

## Latest Checkpoint

Run the app and explore the full feature set.

- Search and add timezones from the 81-zone dropdown; duplicates are blocked.
- Remove any zone with ×; the target reassigns automatically.
- Drag zones to reorder or use the ↑/↓ arrow controls.
- Toggle target zones to shift the visual center of the timeline to that zone's business hours.
- Edit start/end times per zone to see the business-hour highlighting update live.
- Set overlapping business hours across zones to see the blue all-zone overlap indicator appear on the timeline.
- The legend below the heading explains the overlap highlight when visible.

## Commands

```bash
npm install
npm run dev
```

```bash
npm run build
npm run lint
npm run test
```

```bash
npm run format
npm run format:check
```

## Validation

For the latest checkpoint, run the automated checks and then do a quick browser pass.

```bash
npm run test
npm run lint
npm run build
npm run format:check
```

Then run `npm run dev` and exercise the reorder, target toggle, and reset flows in the UI.

## Dependencies Added For The Project

- `luxon` for DST-safe timezone calculations
- `zustand` for lightweight state management
- `@dnd-kit/*` for timezone ordering interactions
- `vitest` and Testing Library for component and logic tests
- `prettier` for formatting

## Next Slice

Iteration 8: pairwise overlap matrix — a table showing the total overlap duration for each pair of selected zones.
