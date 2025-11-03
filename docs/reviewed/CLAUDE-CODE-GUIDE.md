# Transitioning to Claude Code

## 🤖 What is Claude Code?

**Claude Code** is Anthropic's command-line tool for agentic coding. It allows Claude to work directly in your codebase, making changes, running commands, and helping with development tasks.

**Key Benefits:**
- Claude can directly edit files in your project
- Run tests and see results
- Make multi-file changes
- Better context awareness
- Faster iteration

---

## 🚀 Setting Up Claude Code

### **Step 1: Install Claude Code**

**Via NPM** (Recommended):
```bash
npm install -g @anthropic-ai/claude-code
```

**Verify Installation:**
```bash
claude-code --version
```

### **Step 2: Authenticate**

```bash
claude-code login
```

This will:
1. Open your browser
2. Ask you to log in to Claude
3. Grant access to Claude Code
4. Save credentials locally

### **Step 3: Initialize in Your Project**

Navigate to your project:
```bash
cd /path/to/world-papers-nextjs
```

Initialize Claude Code:
```bash
claude-code init
```

This creates a `.claude` directory with configuration.

---

## 📦 Migrating Your Project

### **Step 1: Commit Current Work**

Before switching, commit everything:

```bash
git add .
git commit -m "Pre Claude Code migration - working state"
```

### **Step 2: Create Claude Code Configuration**

**File: `.claude/config.json`**
```json
{
  "project": "world-papers",
  "language": "typescript",
  "framework": "nextjs",
  "includes": [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.ts",
    "scripts/**/*.ts"
  ],
  "excludes": [
    "node_modules/**",
    ".next/**",
    "dist/**",
    "*.log"
  ],
  "context": {
    "readme": "README.md",
    "documentation": ["docs/**/*.md"],
    "plan": "docs/PRODUCTION-PLAN.md"
  }
}
```

### **Step 3: Create Claude Instructions**

**File: `.claude/instructions.md`**
```markdown
# World Papers - Claude Code Instructions

## Project Context
This is a Next.js 14 application for World Papers, a global digital policy analysis platform.

## Current Phase
Following PRODUCTION-PLAN.md - currently in Phase [X], Day [Y]

## Key Files
- Main page: app/page.tsx
- Components: components/ui/*
- Database: lib/supabase.ts
- Mock data: lib/mockData.ts

## Development Guidelines
1. Use TypeScript strictly
2. Follow Tailwind CSS conventions
3. Use Next.js 14 App Router patterns
4. Server components by default, 'use client' when needed
5. Always update PRODUCTION-PLAN.md progress

## Current Tasks
See PRODUCTION-PLAN.md Day [X] for current objectives

## Testing
- Run `pnpm dev` to test changes
- Check browser at localhost:3000
- Verify three-column layout at ≥1024px width

## Database
Using Supabase:
- Connection details in .env.local
- Schema in docs/schema.sql
- Seed with scripts/seed.ts
```

---

## 🎯 Using Claude Code

### **Basic Commands**

**Start a session:**
```bash
claude-code start
```

**Ask Claude to make changes:**
```bash
claude-code "Add error handling to the newsletter API route"
```

**Work on specific files:**
```bash
claude-code --files app/api/newsletter/route.ts "Improve validation"
```

**Run with context:**
```bash
claude-code --context docs/PRODUCTION-PLAN.md "Continue with Day 3 tasks"
```

### **Interactive Mode**

```bash
claude-code interactive
```

This opens a chat interface where you can:
- Ask questions
- Request changes
- Review diffs before applying
- Iterate on solutions

---

## 💡 Example Workflows

### **Workflow 1: Implementing a Task from the Plan**

```bash
# Start Claude Code with the plan
claude-code --context docs/PRODUCTION-PLAN.md

# Ask Claude
> "I'm on Day 3. Help me create the API routes as specified in the plan."

# Claude will:
# 1. Read the plan
# 2. Create the files
# 3. Show you diffs
# 4. Ask for confirmation
# 5. Apply changes
```

### **Workflow 2: Fixing a Bug**

```bash
claude-code "There's an error in app/page.tsx line 45 where the policy status isn't displaying correctly. Fix it."

# Claude will:
# 1. Read the file
# 2. Identify the issue
# 3. Propose a fix
# 4. Apply if you approve
```

### **Workflow 3: Refactoring**

```bash
claude-code "Extract the newsletter form into a separate component in components/NewsletterForm.tsx"

# Claude will:
# 1. Create new file
# 2. Move code
# 3. Update imports
# 4. Test that it still works
```

---

## 🔄 Daily Workflow with Claude Code

### **Morning Startup:**

```bash
# 1. Navigate to project
cd /path/to/world-papers-nextjs

# 2. Check current status
git status

# 3. Start Claude Code with plan
claude-code --context docs/PRODUCTION-PLAN.md interactive

# 4. Ask Claude
> "What's the next task according to the plan?"

# 5. Work through tasks with Claude
> "Help me complete Task 3.1"
```

### **During Development:**

```bash
# Quick changes
claude-code "Add loading state to the policies list"

# Multi-file changes
claude-code "Implement SEO for all article pages"

# Testing
claude-code "Run the dev server and check if the newsletter form works"
```

### **End of Day:**

```bash
# Update progress
claude-code "Update PRODUCTION-PLAN.md with today's completed tasks"

# Commit
git add .
git commit -m "Day 3 complete: API routes created"

# Exit
exit
```

---

## 📋 Claude Code Best Practices

### **1. Always Provide Context**

**Good:**
```bash
claude-code --context docs/PRODUCTION-PLAN.md "Continue Day 5 tasks"
```

**Bad:**
```bash
claude-code "Make it better"
```

### **2. Be Specific**

**Good:**
```bash
claude-code "Add TypeScript types to the getPolicies function in lib/api.ts"
```

**Bad:**
```bash
claude-code "Fix types"
```

### **3. Review Changes**

Always review diffs before applying:
```bash
# Claude shows diff
Would you like me to apply these changes? [y/n]

# Review carefully, then approve
y
```

### **4. Commit Frequently**

After each successful change:
```bash
git add .
git commit -m "Descriptive message"
```

### **5. Use the Plan**

Reference the production plan:
```bash
claude-code --context docs/PRODUCTION-PLAN.md "What's next?"
```

---

## 🔧 Advanced Features

### **Multi-File Edits**

```bash
claude-code "Refactor all components to use the new Button component from components/ui/Button.tsx"
```

Claude will:
- Find all button usage
- Update imports
- Replace with new component
- Show all changes
- Ask for confirmation

### **Terminal Commands**

Claude Code can run commands:
```bash
claude-code "Install the Zod library and add validation to the newsletter API"

# Claude will:
# 1. Run: pnpm add zod
# 2. Update the API route
# 3. Add validation schema
```

### **Testing Integration**

```bash
claude-code "Run the dev server, test the newsletter form, and tell me if there are any errors"

# Claude will:
# 1. Run pnpm dev
# 2. Check logs
# 3. Report any errors
```

---

## 🆚 VS Code vs Claude Code

### **Use VS Code When:**
- Browsing code
- Manual edits
- Using VS Code extensions
- Visual debugging

### **Use Claude Code When:**
- Implementing features
- Refactoring
- Following the plan
- Multi-file changes
- Need AI assistance

### **Best Approach: Use Both**

```bash
# Terminal 1: VS Code
code .

# Terminal 2: Claude Code
claude-code interactive

# Terminal 3: Dev Server
pnpm dev
```

Work in VS Code, ask Claude Code for help, test in browser.

---

## 📊 Tracking Progress

### **Claude Code Status Command**

```bash
claude-code status
```

Shows:
- Current phase/day from plan
- Completed tasks
- Next tasks
- Files changed today

### **Integration with Plan**

Claude Code reads `PRODUCTION-PLAN.md` and:
- Knows what phase you're in
- Tracks completed tasks
- Suggests next steps
- Updates the plan automatically

---

## 🐛 Troubleshooting

### **Claude Code Not Finding Files**

```bash
# Reinitialize
claude-code init --force
```

### **Authentication Issues**

```bash
# Re-login
claude-code logout
claude-code login
```

### **Context Too Large**

```bash
# Use specific files
claude-code --files app/page.tsx "Make changes"

# Or exclude directories
claude-code --exclude node_modules,.next "Make changes"
```

---

## 🔐 Security Notes

- Claude Code runs **locally** on your machine
- Your code stays on your computer
- Only sends necessary context to Claude API
- API keys and secrets stay in `.env.local`
- `.claude/` should be in `.gitignore`

**Add to `.gitignore`:**
```
.claude/
```

---

## 📖 Quick Reference

### **Essential Commands**

```bash
# Start interactive session
claude-code interactive

# Quick task
claude-code "task description"

# With context
claude-code --context file.md "task"

# Specific files
claude-code --files file1.ts,file2.ts "task"

# Status
claude-code status

# Help
claude-code --help
```

### **Common Tasks**

```bash
# Follow the plan
claude-code --context docs/PRODUCTION-PLAN.md "Continue Day 3"

# Create component
claude-code "Create a SearchBar component"

# Fix bug
claude-code "Fix the TypeScript error in app/page.tsx"

# Add feature
claude-code "Add dark mode toggle to header"

# Refactor
claude-code "Extract inline styles to Tailwind classes"

# Test
claude-code "Run tests and fix any failures"
```

---

## 🎓 Learning Resources

- **Claude Code Docs**: https://docs.claude.com/claude-code
- **GitHub Examples**: https://github.com/anthropics/claude-code-examples
- **Community**: Claude Discord server

---

## ✅ Migration Checklist

- [ ] Claude Code installed (`claude-code --version`)
- [ ] Authenticated (`claude-code login`)
- [ ] Project initialized (`claude-code init`)
- [ ] `.claude/config.json` created
- [ ] `.claude/instructions.md` created
- [ ] `.claude/` added to `.gitignore`
- [ ] Current work committed
- [ ] Tested basic command (`claude-code "Show project structure"`)
- [ ] Reviewed plan with Claude (`--context docs/PRODUCTION-PLAN.md`)

---

## 🚀 Ready to Start!

Once everything is set up:

```bash
# Navigate to project
cd world-papers-nextjs

# Start Claude Code with the plan
claude-code --context docs/PRODUCTION-PLAN.md interactive

# Begin working
> "I'm ready to start Phase 1, Day 1. What's the first task?"
```

Claude will guide you through the entire production plan! 🎉

---

## 💬 Example Session

```bash
$ claude-code --context docs/PRODUCTION-PLAN.md interactive

Claude Code v1.0.0
Loaded context: docs/PRODUCTION-PLAN.md

You: Where are we in the plan?

Claude: Based on the production plan, we're set to begin Phase 1: Database & Backend Setup.
The first task is Day 1: Database Setup, which includes:
1. Choosing and setting up a database (Supabase recommended)
2. Installing dependencies
3. Creating database schema

Would you like me to help you get started with setting up Supabase?

You: Yes, let's start with Supabase

Claude: Great! I'll guide you through setting up Supabase. First, I need you to:
1. Go to https://supabase.com and create an account
2. Create a new project
3. Once it's ready (2-3 minutes), go to Project Settings > API
4. Copy your project URL and anon key

Let me know when you have those, and I'll help you configure the .env.local file.

[... continues with step-by-step guidance]
```

---

**You're now ready to use Claude Code to build World Papers!** 🚀

The combination of the detailed production plan + Claude Code's assistance will make development much faster and smoother.
