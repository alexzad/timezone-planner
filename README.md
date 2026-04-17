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

## Latest Checkpoint

You can now test a real state-backed scenario in the browser.

- Reorder seeded zones with the arrow controls in the sidebar.
- Verify the timeline rows follow the same order immediately.
- Toggle target zones and confirm the target count and highlighted rows update.
- Reset targets and confirm the primary seeded zone becomes the only target again.

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
