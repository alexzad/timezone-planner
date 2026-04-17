# Time Zone Overlap Planner

Greenfield React + TypeScript SPA for planning overlap across multiple IANA time zones for 24x7 operations.

## Current Status

Iteration 0 is in place.

- Vite + React + TypeScript scaffold
- Core dependencies for timezone math, app state, and drag-and-drop
- Basic app shell with sidebar, timeline, and analysis regions
- ESLint, Prettier, and Vitest configured

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

## Dependencies Added For The Project

- `luxon` for DST-safe timezone calculations
- `zustand` for lightweight state management
- `@dnd-kit/*` for timezone ordering interactions
- `vitest` and Testing Library for component and logic tests
- `prettier` for formatting

## Next Slice

Iteration 1 replaces the preview content with real application state and seeded timezone data.
