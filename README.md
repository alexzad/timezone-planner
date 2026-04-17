# Time Zone Overlap Planner

Greenfield React + TypeScript SPA for planning overlap across multiple IANA time zones for 24x7 operations.

## Current Status

Iteration 3 is partially in place.

- Vite + React + TypeScript scaffold
- Core dependencies for timezone math, app state, and drag-and-drop
- Basic app shell with sidebar, timeline, and analysis regions
- ESLint, Prettier, and Vitest configured
- Seeded timezone scenario rendered from Zustand state
- Target-zone toggles wired through the app store
- Keyboard reorder controls for moving zones earlier or later
- Per-card hour rulers showing each timezone's local time of day
- UTC-anchored timeline: target zone's business hours centered; all other zones shifted by real offset
- Business-hour highlighting derived from each zone's configured window, including overnight spans
- Timezone search box (81 IANA zones) with live dropdown, duplicate prevention, and remove controls

## Latest Checkpoint

Test the timezone comparison view in the browser.

- Type in the search box to find and add new timezones from the dropdown.
- Duplicate adds are silently blocked.
- Remove any zone with the × button; the target is reassigned automatically if needed.
- Reorder zones with the arrow controls and verify the timeline rows update immediately.
- Toggle target zones and confirm that zone's business hours move to the visual center.
- Each row's hour ruler shows its own local times — London is shifted ~5 h right of New York, Tokyo ~13 h.

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

Iteration 2 adds timezone search, duplicate prevention, and add or remove flows.
