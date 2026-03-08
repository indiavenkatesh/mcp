# Changesets

This repo uses [changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## Adding a changeset

When you make a change that should be released, run:

```bash
npx changeset
```

This will ask you:
1. **Which packages changed?** → select `@indiavenkatesh/mcp-threejs`
2. **Bump type?**
   - `patch` — bug fixes (1.0.0 → 1.0.1)
   - `minor` — new features, backward compatible (1.0.0 → 1.1.0)
   - `major` — breaking changes (1.0.0 → 2.0.0)
3. **Summary?** → write a short description of the change

This creates a `.md` file in `.changeset/`. Commit it with your PR.

## How releases work

1. You open a PR with your changes + a changeset file
2. The `Release` GitHub Action opens a **"Version Packages" PR** automatically
3. When that PR is merged → the action publishes to npm and creates a GitHub release

## Manual version bump (no CI)

```bash
npx changeset version   # bumps versions + updates CHANGELOG.md
npx changeset publish   # publishes to npm
```
