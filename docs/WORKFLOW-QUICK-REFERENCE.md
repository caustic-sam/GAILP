# Workflow Quick Reference

**Project:** GAILP Platform
**Last Updated:** November 2, 2025

---

## 🚀 Daily Workflow

### 1️⃣ Starting Your Day

```bash
# Update local repository
git checkout main
git pull origin main

# Check Jira board
open https://cortexaillc.atlassian.net/jira/software/projects/GAILP/board

# Review assigned issues
# Pick top priority issue from "To Do" column
```

### 2️⃣ Starting a New Task

```bash
# Move Jira issue to "In Progress"
# Create feature branch
git checkout -b feature/GAILP-XXX-short-description

# Example:
git checkout -b feature/GAILP-15-image-upload
```

### 3️⃣ During Development

```bash
# Commit regularly with Jira key
git commit -m "GAILP-XXX: Add image upload endpoint"

# Smart commit examples:
git commit -m "GAILP-XXX #comment Fixed validation bug"
git commit -m "GAILP-XXX #time 2h #comment Implemented API"
```

### 4️⃣ Ready for Review

```bash
# Push branch
git push -u origin feature/GAILP-XXX-short-description

# Create PR on GitHub
# PR will auto-link to Jira and move issue to "Review"

# Update Confluence if needed
# Link PR in Jira issue
```

### 5️⃣ After Merge

```bash
# Jira issue auto-moves to "Done"
# Delete local branch
git checkout main
git pull origin main
git branch -d feature/GAILP-XXX-short-description

# Pick next issue
```

---

## 📝 Commit Message Format

### Standard Format
```
GAILP-XXX: Brief description

Longer explanation if needed.

- Bullet points for details
- What changed and why
```

### Smart Commit Commands

```bash
# Add comment to Jira
GAILP-XXX #comment This is a comment

# Log time
GAILP-XXX #time 2h 30m

# Transition issue
GAILP-XXX #close
GAILP-XXX #start-progress
GAILP-XXX #resolve

# Combine commands
GAILP-XXX #time 3h #comment Fixed bug #close
```

---

## 🔀 Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/GAILP-XXX-description` | `feature/GAILP-15-image-upload` |
| Bug Fix | `bugfix/GAILP-XXX-description` | `bugfix/GAILP-99-editor-crash` |
| Hotfix | `hotfix/GAILP-XXX-description` | `hotfix/GAILP-101-security-patch` |
| Epic | `epic/GAILP-XXX-description` | `epic/GAILP-20-web3-integration` |

---

## 🎫 Jira Issue Lifecycle

```
📥 Backlog → 📋 To Do → 🏗️ In Progress → 👀 Review → ✅ Done
```

### Status Transitions

| From | To | Trigger |
|------|------|---------|
| Backlog | To Do | Sprint planning / Manual |
| To Do | In Progress | Start work / Create branch |
| In Progress | Review | Open PR |
| Review | In Progress | Changes requested |
| Review | Done | PR merged |

---

## 🏷️ Labels Guide

| Label | Emoji | Use For | Color |
|-------|-------|---------|-------|
| `frontend` | 🎨 | UI/React changes | Blue |
| `backend` | ⚙️ | API/server changes | Green |
| `database` | 🗄️ | Schema/migration | Purple |
| `security` | 🔒 | Security issues | Orange |
| `performance` | ⚡ | Performance work | Yellow |
| `ui-ux` | 💅 | Design/UX | Pink |
| `integration` | 🔗 | Third-party integration | Teal |
| `web3` | ⛓️ | Blockchain/Web3 | Cyan |
| `ai-ml` | 🤖 | AI/ML features | Violet |
| `quick-win` | 🎯 | Fast, easy wins | Lime |
| `tech-debt` | 🧹 | Refactoring | Brown |
| `breaking-change` | ⚠️ | Breaking changes | Red |

---

## 🔍 JQL Quick Queries

### Your Work
```jql
# Your current work
assignee = currentUser() AND status = "In Progress"

# Your open issues
assignee = currentUser() AND status != Done

# Your recent activity
assignee = currentUser() AND updated >= -7d
```

### Team Queries
```jql
# Sprint work
project = GAILP AND sprint in openSprints()

# High priority bugs
project = GAILP AND type = Bug AND priority in (Highest, High) AND status != Done

# Ready for review
project = GAILP AND status = "Review"

# Blocked issues
project = GAILP AND status = "In Progress" AND labels = blocked
```

### Epic Tracking
```jql
# Stories in epic
"Epic Link" = GAILP-XXX

# Epic progress
type = Epic AND status != Done ORDER BY priority DESC
```

### Labels & Components
```jql
# Frontend work
project = GAILP AND labels = frontend AND status != Done

# Quick wins
project = GAILP AND labels = quick-win AND status = "To Do"

# Security issues
project = GAILP AND labels = security ORDER BY priority DESC
```

---

## 📚 Confluence Quick Actions

### Creating Pages

```
Parent Page → Create → Select template → Fill content
```

**Common Templates:**
- Epic Page
- Meeting Notes
- Decision Record (ADR)
- User Guide
- Technical Spec

### Linking Content

```markdown
# Link to Jira
[GAILP-123] or {{jira:GAILP-123}}

# Link to Confluence page
[Page Title](page-url)

# Link to GitHub
[PR #123](github-url)
```

### Macros to Use

| Macro | Purpose |
|-------|---------|
| Jira Issue/Filter | Embed Jira issues |
| Status | Add status badges |
| Table of Contents | Auto-generate TOC |
| Code Block | Syntax-highlighted code |
| Info/Warning | Callout boxes |
| Children Display | Show child pages |

---

## 🤖 GitHub Actions

### Automated Workflows

**On PR Open:**
- Extracts Jira key from title/branch
- Moves Jira issue to "Review"
- Adds PR link to Jira
- Comments on PR with Jira link

**On PR Merge:**
- Moves Jira issue to "Done"
- Syncs docs to Confluence (if doc changes)
- Updates changelog

**On Push to Main:**
- Syncs markdown docs to Confluence
- Links commits to Jira issues
- Updates project status

---

## 📞 Quick Links

### Essential URLs

| Resource | URL |
|----------|-----|
| Jira Board | https://cortexaillc.atlassian.net/jira/software/projects/GAILP/board |
| Confluence | https://cortexaillc.atlassian.net/wiki/spaces/G |
| GitHub Repo | https://github.com/yourusername/www-GAILP-prd |
| GitHub Issues | https://github.com/yourusername/www-GAILP-prd/issues |
| GitHub PRs | https://github.com/yourusername/www-GAILP-prd/pulls |

### Documentation

| Doc | Location |
|-----|----------|
| Integration Plan | [docs/ATLASSIAN-INTEGRATION-PLAN.md](./ATLASSIAN-INTEGRATION-PLAN.md) |
| Quick Execute | [docs/QUICK-EXECUTE-ATLASSIAN.md](./QUICK-EXECUTE-ATLASSIAN.md) |
| Templates | [docs/templates/](./templates/) |
| Session Notes | [docs/SESSION-NOTES-2025-11-02.md](./SESSION-NOTES-2025-11-02.md) |

---

## 🆘 Common Issues

### "Can't push branch"
```bash
# Update main and rebase
git checkout main
git pull origin main
git checkout your-branch
git rebase main
git push -f origin your-branch
```

### "Jira issue not auto-linking"
- Ensure branch/PR title contains `GAILP-XXX`
- Check GitHub Jira integration is enabled
- Manually link in Jira if needed

### "Confluence sync failed"
- Check API token is valid
- Verify page titles match mapping
- Check rate limits

### "PR checks failing"
```bash
# Run locally
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

---

## 💡 Pro Tips

1. **Use Jira keyboard shortcuts:** Press `?` in Jira to see all shortcuts
2. **Star important pages:** In Confluence, star pages you reference often
3. **Create saved JQL filters:** Save frequent queries for quick access
4. **Use labels generously:** Makes filtering and searching easier
5. **Cross-link everything:** Jira ↔ Confluence ↔ GitHub
6. **Update status regularly:** Keep team informed of progress
7. **Log time in commits:** Use `#time` for accurate tracking
8. **Comment on PRs:** Good reviews make better code
9. **Update Confluence:** Keep business docs current
10. **Close completed issues:** Clean board = happy team

---

**Need Help?**
- Check [ATLASSIAN-INTEGRATION-PLAN.md](./ATLASSIAN-INTEGRATION-PLAN.md)
- Ask in team Slack
- Review Confluence documentation
- Reach out to @James or @Elizabeth
