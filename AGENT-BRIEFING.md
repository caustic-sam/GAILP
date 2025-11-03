# Agent Briefing - GAILP Platform

**For:** Any AI agent (Claude, GPT, Gemini, etc.)
**Purpose:** Get up to speed in <2 minutes, <1000 tokens
**Date Created:** 2025-11-03

---

## 🚀 Quick Start (30 seconds)

**Project:** GAILP (Global AI & Innovation Leadership Portal)
**Tech Stack:** Next.js 14, TypeScript, Tailwind, Supabase, FreshRSS
**Status:** Active development, production-ready foundation
**Your Role:** Software development assistant

**First Steps:**
1. ✅ Read `CURRENT-WORK.md` (current status, active tasks)
2. ✅ Run `git status` and `git log --oneline -5`
3. ✅ Ask user: "What would you like to work on?"
4. ❌ Don't read all docs unless specifically needed

---

## 📁 Project Structure (1 minute)

```
www-GAILP-prd/
├── app/              # Next.js 14 app directory
│   ├── page.tsx      # Homepage (navy blue theme, 3-column)
│   ├── articles/     # Article management system
│   ├── policy-pulse/ # Policy tracking (FreshRSS)
│   └── ...           # Other pages
├── components/       # React components
│   ├── Header.tsx    # Top navigation
│   ├── RightSidebar.tsx  # Vertical navigation
│   └── ...
├── lib/              # Utilities
│   ├── freshrss.ts   # FreshRSS API client (working)
│   └── supabase.ts   # Database client
├── docs/             # 45+ documentation files
│   ├── CURRENT-WORK.md         # ← Read this first
│   ├── 00-START-HERE.md        # Project overview
│   ├── SESSION-COMPLETE-*.md   # Recent work logs
│   └── ...
├── scripts/          # Automation
│   └── atlassian/    # Confluence/Jira integration
└── .env.local        # Environment config (not in git)
```

---

## 🎨 Design System (30 seconds)

**Theme:** Navy blue professional
- Primary: `#1e3a8a` (navy)
- Accent: `#3b82f6` (blue-500)
- Background: `#f8fafc` (slate-50)
- Text: White on dark, dark on light

**Layout:** Three-column responsive
- Left sidebar: Policy feed (hidden <1024px)
- Center: Main content
- Right sidebar: Navigation (hidden <1280px)

**Components:** Tailwind utility-first, consistent styling

---

## 🔧 Key Integrations (30 seconds)

| Integration | Status | Location | Notes |
|-------------|--------|----------|-------|
| **FreshRSS** | ✅ Working | `lib/freshrss.ts` | Policy feed aggregation, don't modify |
| **Supabase** | ⚙️ Configured | `lib/supabase.ts` | Database, auth ready |
| **Atlassian** | 🟡 85% done | `scripts/atlassian/` | Confluence live, Jira pending |
| **Vercel** | ✅ Deployed | N/A | Production hosting |

---

## 📋 Common Tasks (reference)

**Development:**
```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm lint         # Run linter
```

**Git Workflow:**
```bash
git status                    # Check current state
git log --oneline -10        # Recent commits
git checkout -b feature/x    # New feature branch
```

**Documentation:**
- Current work: `CURRENT-WORK.md`
- Recent sessions: `docs/SESSION-COMPLETE-*.md`
- Feature docs: `docs/*.md`

---

## ✅ What's Working (don't break)

- ✅ Build process (clean, no errors)
- ✅ FreshRSS integration (tested, production-ready)
- ✅ Right sidebar navigation (styled, functional)
- ✅ Policy Pulse page (complete, working)
- ✅ Atlassian MCP server (configured)
- ✅ Homepage layout (navy blue, 3-column)

---

## 🎯 Current Priorities (see CURRENT-WORK.md for details)

1. Complete Atlassian integration (Jira setup, doc migration)
2. Enhance Policy Pulse features
3. Production optimization (SEO, performance, analytics)

---

## 🚫 Common Pitfalls to Avoid

❌ **Don't:** Read all 45+ docs in `/docs` unless needed
✅ **Do:** Read `CURRENT-WORK.md` + ask user what's needed

❌ **Don't:** Modify working integrations (FreshRSS, auth)
✅ **Do:** Ask before changing production-ready code

❌ **Don't:** Change design system colors/layout without approval
✅ **Do:** Follow established navy blue theme

❌ **Don't:** Create new docs without user request
✅ **Do:** Update existing docs when making changes

---

## 💡 Development Philosophy

**Code Quality:**
- TypeScript strict mode
- Component-based architecture
- Utility-first CSS (Tailwind)
- API routes for backend logic

**Documentation:**
- Update `CURRENT-WORK.md` after significant changes
- Add session notes to `docs/` for major work
- Keep docs concise and actionable
- Don't over-document

**Workflow:**
- Use TodoWrite tool for multi-step tasks
- Work incrementally, test frequently
- Commit with clear messages
- Ask before major architectural changes

---

## 📞 Quick Links

| Resource | Location |
|----------|----------|
| **Current status** | `CURRENT-WORK.md` |
| **Project overview** | `docs/00-START-HERE.md` |
| **Recent work** | `docs/SESSION-COMPLETE-2025-11-02.md` |
| **Policy Pulse docs** | `docs/POLICY-PULSE-FEATURE.md` |
| **Atlassian docs** | `docs/ATLASSIAN-*.md` |
| **Confluence space** | https://cortexaillc.atlassian.net/wiki/spaces/G |

---

## 🎓 Agent-Specific Notes

**Token Efficiency:**
- This file + `CURRENT-WORK.md` = ~1500 tokens
- Full context read = 15,000+ tokens
- **Savings: 90%** by reading these first

**Best Practices:**
1. Start with `CURRENT-WORK.md` (current state)
2. Check git history (`git log --oneline -5`)
3. Ask user for clarification
4. Read specific docs only if needed
5. Use TodoWrite for tracking progress

**User Preferences:**
- Concise updates preferred
- No emojis in code unless requested
- Edit existing files > create new files
- Ask before major changes
- Keep docs lightweight

---

## ✨ You're Ready!

**Total read time:** <2 minutes
**Token usage:** ~1500 tokens
**Next step:** Check `CURRENT-WORK.md` and ask user what to work on

---

*This file is agent-agnostic and maintained for efficient onboarding*
