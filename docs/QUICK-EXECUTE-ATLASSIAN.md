# Quick Execute: Atlassian Integration

**Time to Complete:** 30-45 minutes
**Status:** Ready to execute
**Difficulty:** Easy (mostly UI clicks)

---

## ⚡ Quick Start (Recommended)

### Step 1: Create Jira Project (10 min) - MANUAL

Jira Cloud templates differ per instance. Create manually:

1. Go to https://cortexaillc.atlassian.net/jira/projects/create
2. Choose **"Kanban"** template (or any team-managed board)
3. Configure:
   - **Name:** GAILP Platform
   - **Key:** GAILP
   - **Type:** Team-managed or Company-managed

4. After creation, configure:
   - **Issue Types:** Add Epic, Story, Task, Bug (default usually has these)
   - **Labels:** Will be created automatically when first used
   - **Board Columns:** Backlog → To Do → In Progress → Review → Done

**Result:** https://cortexaillc.atlassian.net/jira/software/projects/GAILP/board

---

### Step 2: Create Confluence Pages (15 min) - AUTOMATED

```bash
# Set environment variable (use your actual token from Atlassian)
export ATLASSIAN_API_TOKEN="your-atlassian-api-token-here"

# Run script
npx tsx scripts/atlassian/create-confluence-structure.ts
```

This creates:
- 📋 Project Overview
- 🗺️ Product & Roadmap
- 📚 User Guides
- 🎨 Design System
- 💼 Business & Operations
- 🔧 Developer Resources
- 🤖 AI Agent Guides
- 📝 Session Archive

**Result:** https://cortexaillc.atlassian.net/wiki/spaces/G

---

### Step 3: Import Top Issues (10 min) - AUTOMATED

```bash
# Same environment variable from Step 2
npx tsx scripts/atlassian/backlog-to-jira.ts
```

This imports top 10 issues from BACKLOG.md to Jira.

**Result:** Issues created in https://cortexaillc.atlassian.net/jira/software/projects/GAILP/board

---

### Step 4: Manual Refinement (10 min)

1. **In Jira:**
   - Review created issues
   - Adjust priorities
   - Add story points
   - Assign to yourself if needed

2. **In Confluence:**
   - Review page structure
   - Customize homepage
   - Add welcome content

---

## 🎯 What You'll Have

After completion:

✅ **Jira Project "GAILP"**
- Kanban board with proper columns
- 10+ issues from backlog
- Labels initialized
- Ready for sprint planning

✅ **Confluence Space "GAILP"**
- 8 main section pages
- ~30 child pages
- Organized hierarchy with emojis
- Ready for content migration

✅ **Foundation for Automation**
- GitHub Actions ready to be configured
- Sync scripts ready to use
- Templates for new content

---

## 📋 Phase 2: Content Migration (Next Session)

After structure is in place, migrate documentation:

### High Priority Docs to Move:

```bash
# Run migration script (to be created)
npx tsx scripts/atlassian/migrate-docs.ts

# Or manually copy these to Confluence:
docs/00-START-HERE.md → Project Overview/Getting Started
docs/PRODUCTION-PLAN.md → Product & Roadmap/Product Roadmap
PROJECT-STATUS.md → Product & Roadmap/Project Status
docs/QUICK-START.md → Project Overview/Quick Start Guide
docs/CLAUDE-CODE-GUIDE.md → AI Agent Guides/Claude Code Integration
docs/ATLASSIAN-MCP-SETUP.md → AI Agent Guides/Atlassian MCP Setup
```

---

## 🤖 Automation Setup (Phase 3)

After manual setup works, add automation:

1. **GitHub Actions** (in `.github/workflows/`)
   - `confluence-sync.yml` - Auto-sync docs
   - `jira-pr-integration.yml` - Link PRs to issues

2. **Jira Automation Rules**
   - PR opened → Move issue to "In Progress"
   - PR merged → Move issue to "Done"
   - Epic created → Create Confluence page

3. **Smart Commits**
   - Enable in Jira settings
   - Configure GitHub integration

---

## 🚨 Troubleshooting

### "Module not found: axios"
```bash
pnpm add -D axios
```

### "API Token invalid"
Check token in `/Users/jm/Library/Application Support/Claude/claude_desktop_config.json`

### "Project template not found"
Create project manually in Jira UI instead (Step 1)

### "Page already exists"
Script will skip existing pages - safe to re-run

---

## 📊 Success Criteria

You'll know it worked when:

- [ ] Can open https://cortexaillc.atlassian.net/jira/software/projects/GAILP/board
- [ ] See 10+ issues in Jira backlog
- [ ] Can open https://cortexaillc.atlassian.net/wiki/spaces/G
- [ ] See 8 emoji-titled main sections in Confluence
- [ ] Can navigate through Confluence page hierarchy
- [ ] Issues have proper labels (frontend, backend, etc.)

---

## 🔗 Quick Links

- **Jira Board:** https://cortexaillc.atlassian.net/jira/software/projects/GAILP/board
- **Confluence Space:** https://cortexaillc.atlassian.net/wiki/spaces/G
- **Full Plan:** [ATLASSIAN-INTEGRATION-PLAN.md](./ATLASSIAN-INTEGRATION-PLAN.md)
- **Status:** [ATLASSIAN-IMPLEMENTATION-STATUS.md](./ATLASSIAN-IMPLEMENTATION-STATUS.md)

---

## 💡 Tips

1. **Don't stress about perfection** - Structure can be reorganized later
2. **Start small** - Get 5 issues and 5 docs migrated first
3. **Use emojis liberally** - Makes navigation visual and fun
4. **Cross-link everything** - Jira issues ↔ Confluence pages
5. **Automate incrementally** - Manual first, automate what hurts

---

**Last Updated:** November 2, 2025
**Estimated Time:** 30-45 minutes for Phase 1
**Next:** Phase 2 - Content Migration (see implementation status doc)
