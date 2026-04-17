---
name: deploy-github-pages
description: "Deploy this Vite React app to GitHub Pages using the repo's deploy-branch workflow. Use when publishing a new release, updating the deploy branch, checking GitHub Pages build assumptions, or preparing a safe worktree-based Pages deploy without touching the main development checkout."
argument-hint: 'Optional: branch name, worktree path, or whether this is the first deploy'
---

# Deploy GitHub Pages

Deploy this repository to GitHub Pages by building the app in the main checkout and publishing the built static files from a dedicated `deploy` branch worktree.

This skill is repo-specific. It reflects the documented rule in the project docs: never do deploy-branch cleanup in the main development checkout, because that can remove untracked files such as `node_modules`.

## When To Use

- Publish a new GitHub Pages release for this app.
- Refresh the `deploy` branch after merging changes to the main branch.
- Check whether the current Vite base path matches the intended Pages URL.
- Recreate the safe deploy workflow when the repo has not been published recently.

## Repo Assumptions

- The app is built with Vite and React.
- The production artifact is the `dist/` directory.
- The recommended validation commands are `npm run test`, `npm run lint`, `npm run build`, and `npm run format:check`.
- The documented publishing workflow uses a separate checkout or git worktree for the `deploy` branch.
- The current Vite production base path is `/timezone-planner/`, so GitHub Pages should serve the app from that repository path unless a custom domain or different repo slug is configured.

Load [repo deployment notes](./references/repo-deployment-notes.md) before running commands.

## Procedure

1. Confirm the publish target.

Check whether GitHub Pages will be served from `https://<owner>.github.io/timezone-planner/`. If the Pages URL uses a different repository slug and there is no custom domain compensating for it, update the Vite build base before publishing.

2. Validate from the main development checkout.

Run the normal repo checks before publishing:

```bash
npm run test
npm run lint
npm run build
npm run format:check
```

3. Prepare a dedicated deploy worktree.

Never reuse the main checkout for deploy cleanup. Use a sibling directory such as `../time-zones-deploy`.

If the local `deploy` branch already exists:

```bash
git worktree add ../time-zones-deploy deploy
```

If this is the first deploy or you want to recreate the local deploy branch from the current commit:

```bash
git worktree add -B deploy ../time-zones-deploy HEAD
```

4. Rebuild from the main checkout.

Build in the main checkout so the deploy worktree only receives finished static assets:

```bash
npm run build
```

5. Mirror `dist/` into the deploy worktree root.

Use a sync step that deletes old deployed files only inside the deploy worktree:

```bash
rsync -a --delete --exclude '.git' --exclude '.git/' dist/ ../time-zones-deploy/
touch ../time-zones-deploy/.nojekyll
```

6. Commit and push from the deploy worktree.

```bash
git -C ../time-zones-deploy status --short
git -C ../time-zones-deploy add -A
git -C ../time-zones-deploy commit -m "Deploy GitHub Pages"
git -C ../time-zones-deploy push origin deploy
```

If there are no file changes after syncing `dist/`, do not create an empty deploy commit.

7. Verify GitHub Pages settings.

Ensure the repository Pages source is configured to deploy from the `deploy` branch root. If Pages is already configured this way, no change is needed.

8. Smoke check the published site.

Open the published Pages URL and confirm the app loads assets from the expected base path, the main UI renders, and no obvious console or asset-loading errors appear.

## Safety Rules

- Do not delete files in the main development checkout as part of deployment.
- Do not run `rsync --delete` against the main checkout.
- Do not publish directly from `dist/` in the main checkout by rewriting the current branch.
- If `vite.config.ts` base does not match the final Pages URL, fix that mismatch before pushing a deploy commit.

## Expected Inputs

- GitHub owner or org name if the final Pages URL is uncertain.
- Whether the `deploy` branch already exists.
- The intended deploy worktree path if not using `../time-zones-deploy`.

## Output

The deploy branch contains only the built static site, and GitHub Pages serves the app from the correct base path without modifying the main development checkout.
