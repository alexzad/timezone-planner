# Repo Deployment Notes

These notes are distilled from the repository docs and config so the deployment workflow stays aligned with the project.

## Source Facts

- `README.md` says to publish GitHub Pages from a separate checkout or git worktree dedicated to the `deploy` branch.
- `README.md` warns not to reuse the main development checkout for deploy cleanup or publishing because static-site publishing may remove local untracked dependencies such as `node_modules`.
- `plan.md` repeats the same deployment rule as a project decision.
- `todo.md` repeats the same working rule for all future publishing.
- `package.json` defines `build` as `tsc -b && vite build`.
- `vite.config.ts` sets the build base to `/timezone-planner/` for production builds and `/` for development.

## Recommended Validation

Run these in the main checkout before deploying:

```bash
npm run test
npm run lint
npm run build
npm run format:check
```

## Practical Deployment Pattern

1. Keep the main checkout for development and validation only.
2. Use a sibling worktree for the `deploy` branch.
3. Build in the main checkout.
4. Sync the contents of `dist/` into the deploy worktree root.
5. Commit and push from the deploy worktree.

When syncing into a git worktree, exclude both `.git` and `.git/`. A worktree stores git linkage as a `.git` file, and deleting it breaks the checkout.

## Important Mismatch To Check

The workspace folder is named `time-zones`, but the Vite production base path is `/timezone-planner/`.

That is fine only if the GitHub Pages site is actually hosted at a `timezone-planner` repository path or a custom domain that makes the path correct. If the repository slug differs, update the base path before deployment.
