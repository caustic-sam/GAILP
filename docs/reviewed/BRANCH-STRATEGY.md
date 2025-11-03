# Branch Strategy - World Papers (GAILP)

Last Updated: November 1, 2025

## Overview

This project uses a feature-branch workflow with dedicated branches for each major work tranche.

## Branch Structure

### Main Branches

- **`main`** - Production-ready code
  - Protected branch
  - Deploy target for Vercel
  - All changes must come via PR from feature branches
  - Always in working state

### Active Feature Branches

| Branch | Purpose | Status | Notes |
|--------|---------|--------|-------|
| `integration/freshrss` | FreshRSS feed integration | ✅ Active | Feed API, components, fallback system |
| `feature/wordpress-migration` | WordPress content import | 🔄 Ready | Planned 11-17 hour implementation |
| `feature/fix-article-editor` | Article editor fixes | 📋 Staged | Deployment & operations guide added |
| `feature/layout-experiments` | Design experiments | 📋 Staged | Sprint planning docs |

## Workflow

### Creating New Feature Branches

```bash
# Always branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# For integration work
git checkout -b integration/your-integration-name
```

### Naming Conventions

- `feature/*` - New features or enhancements
- `integration/*` - Third-party integrations
- `fix/*` - Bug fixes
- `refactor/*` - Code refactoring
- `docs/*` - Documentation updates

### Working on a Feature

```bash
# Make changes
git add .
git commit -m "Clear description of changes"

# Push to remote
git push -u origin feature/your-feature-name

# Keep branch updated with main
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main
```

### Completing a Feature

1. Ensure all tests pass
2. Update relevant documentation
3. Create Pull Request to `main`
4. Review and merge
5. Delete feature branch after merge

```bash
# After PR is merged
git checkout main
git pull origin main
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Current Status

**Active Branch**: `integration/freshrss`
**Main Status**: 1 commit ahead of origin (pending cleanup commit)

### Branch Relationships

```
main (production)
├── integration/freshrss (current work - FreshRSS)
├── feature/wordpress-migration (next priority)
├── feature/fix-article-editor (staged)
└── feature/layout-experiments (staged)
```

## Submodule: NIST_LLM

The NIST_LLM submodule has its own branch strategy:
- Uses `main` branch
- Nested `scripts` submodule also tracked
- Keep submodule commits separate from parent repo

### Working with Submodules

```bash
# Update submodule
cd NIST_LLM
git pull origin main
cd ..
git add NIST_LLM
git commit -m "Update NIST_LLM submodule"

# Initialize submodules after clone
git submodule update --init --recursive
```

## Best Practices

1. **One Feature Per Branch** - Keep changes focused
2. **Regular Commits** - Small, atomic commits with clear messages
3. **Stay Current** - Regularly merge `main` into feature branches
4. **Clean History** - Squash commits before merging if needed
5. **Document Changes** - Update CHANGELOG.md for significant features
6. **Test Before PR** - Ensure all tests pass locally

## Commit Message Format

```
<type>: <short summary>

<optional body>

<optional footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semi colons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Maintain build, dependencies, etc.

### Examples

```bash
git commit -m "feat: Add FreshRSS feed integration with 3-tier fallback"
git commit -m "fix: Resolve article editor validation issues"
git commit -m "docs: Update deployment guide with Docker instructions"
git commit -m "chore: Clean up cache files and update .gitignore"
```

## Emergency Hotfixes

For critical production issues:

```bash
# Create hotfix from main
git checkout main
git checkout -b hotfix/critical-issue-name

# Fix and test
# ... make changes ...

# Merge directly to main (skip normal PR process)
git checkout main
git merge hotfix/critical-issue-name
git push origin main

# Clean up
git branch -d hotfix/critical-issue-name
```

## Protected Branch Rules

`main` branch protection (recommended for team work):
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- No force pushes
- No deletions

## Questions?

See [CLAUDE-CODE-GUIDE.md](./CLAUDE-CODE-GUIDE.md) for AI-assisted development workflow.
