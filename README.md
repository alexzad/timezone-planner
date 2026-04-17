# Time Zone Overlap Planner

Greenfield React + TypeScript SPA for planning overlap across multiple IANA time zones for 24x7 operations.

## Current Status

Iterations 0–8 and 10 are complete. Iteration 9 was cancelled. The app is a fully interactive timezone overlap planning tool.

- Vite + React + TypeScript scaffold with ESLint, Prettier, and Vitest
- Zustand state management with 9 actions; seeded with New York, London, Tokyo
- ~160-entry IANA city search (new IANA zones + aliases for major cities) with live dropdown, duplicate prevention, and remove controls
- Drag-and-drop zone reordering (@dnd-kit) plus keyboard controls (↑/↓)
- Target-zone selection with visual distinction and timeline anchoring
- Per-zone editable business hours (start/end, supports midnight-crossing windows)
- UTC-anchored 24-hour timeline: target zone's business hours centered; all zones aligned to real offset
- Per-card local hour rulers; business-hour cells highlighted with zone accent color
- **All-zone overlap visualization**: shared overlap windows shown with blue gradient cells and a legend
- **Pairwise overlap matrix**: table showing total overlap duration for every zone pair; intensity-colored cells; scrollable for many zones
- **Persistence and sharing**: selected zones, order, target flags, and business hours restore from local storage, load from share URLs, and can be copied from the sidebar
- DST-safe timezone utilities (18 functions): UTC interval math, pairwise/all-zone overlaps, coverage gaps
- 61 automated tests (35 timezone utilities + 16 store unit + 10 app integration)
- Responsive layout: sidebar + timeline on desktop; single column on mobile; 12-hour rulers on narrow screens

## Latest Checkpoint

Run the app and explore the full feature set, including persisted and shareable scenarios.

- Search and add timezones from the ~160-city dropdown; duplicates are blocked.
- Try searching for Hyderabad, Barcelona, São Paulo, Phoenix, Tbilisi, Vladivostok — all searchable now.
- Remove any zone with ×; the target reassigns automatically.
- Drag zones to reorder or use the ↑/↓ arrow controls.
- Toggle target zones to shift the visual center of the timeline to that zone's business hours.
- Edit start/end times per zone to see the business-hour highlighting update live.
- Set overlapping business hours across zones to see the blue all-zone overlap indicator appear on the timeline.
- The legend below the heading explains the overlap highlight when visible.
- Scroll down below the zone timeline cards to see the **pairwise overlap matrix** — a table of total overlap minutes for every zone pair.
- Reload the page to confirm the current scenario restores automatically.
- Use **Copy share URL** in the sidebar, open the link in a clean tab, and confirm the same scenario loads from the URL.

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

Then run `npm run dev` and exercise the reorder, target toggle, reset, reload, and share-link restore flows in the UI.

## Deployment Note

- Publish GitHub Pages from a separate checkout or git worktree dedicated to the `deploy` branch.
- Do not reuse the main development checkout for deploy-branch cleanup or publishing.
- Reason: deploy publishing may replace the full branch contents with built static artifacts, which can remove local untracked dependencies such as `node_modules` from the development checkout.

## Dependencies Added For The Project

- `luxon` for DST-safe timezone calculations
- `zustand` for lightweight state management
- `@dnd-kit/*` for timezone ordering interactions
- `vitest` and Testing Library for component and logic tests
- `prettier` for formatting

## Next Slice

Iteration 11: responsive and accessible interaction pass.

## Roadmap Docs

- plan.md: high-level implementation plan and architecture notes
- todo.md: iteration backlog with per-iteration status
