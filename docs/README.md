# GAILP Documentation Index

**Last Updated:** 2025-11-12

Welcome to the GAILP (Global AI & Law Policy) platform documentation. This index helps you find the right documentation quickly.

---

## 🚀 Getting Started

**New to the project?** Start here:

1. **[Main README](../README.md)** - Project overview and quick start
2. **[Agent Briefing](../AGENT-BRIEFING.md)** - AI assistant onboarding
3. **[Supabase OAuth Setup](./SUPABASE-OAUTH-SETUP.md)** - Authentication configuration

---

## 📚 Documentation Sections

### Getting Started
- **[Supabase OAuth Setup](./SUPABASE-OAUTH-SETUP.md)** - Complete OAuth configuration guide
- **Setup Guide** - _(Coming soon)_
- **Deployment Guide** - _(See CONFLUENCE-OPS-GUIDE.md for now)_

### Operations
- **[Confluence Ops Guide](../CONFLUENCE-OPS-GUIDE.md)** - Confluence sync operations
- **Security** - _(See SECURITY-AUDIT-FINDINGS.md for now)_

### Development
- **[Tech Debt](../TECH-DEBT.md)** - Known issues and priorities
- **Design System** - _(See archive/security-audit-2025-11-03/ for historical design docs)_

### Planning
- **[Future Features](../FUTURE-FEATURES.md)** - Product roadmap and feature specs
- **[Policy Sources Status](../POLICY-SOURCES-STATUS.md)** - Policy feed implementation plan
- **[Minor Release Plan](./MINOR-RELEASE-PLAN.md)** - Current release planning

### Reference
- **[QA Response](../QA-RESPONSE.md)** - QA findings and fixes
- **[Security Audit Findings](../SECURITY-AUDIT-FINDINGS.md)** - Security review results

### Jira/Project Management
- **[Jira Documentation](./jira/)** - Jira integration and progress tracking
- **[Templates](./templates/)** - Story and epic templates

---

## 📦 Archives

Historical documentation (for reference only):

- **[Security Audit 2025-11-03](./archive/security-audit-2025-11-03/)** - Complete security audit archive (46 files)
- **[Sessions](./archive/sessions/)** - Old session notes and UI improvement logs
- **[Migrations](./archive/migrations/)** - Completed migration documentation
- **[World Papers](./archive/world-papers/)** - Legacy prototype documentation

---

## 🔍 Quick Reference

### Authentication & OAuth
- Primary: [SUPABASE-OAUTH-SETUP.md](./SUPABASE-OAUTH-SETUP.md)
- Testing: See archive for TEST-AUTH-FLOW.md and OAUTH-TESTING-GUIDE.md

### Design & UI
- Current: [TECH-DEBT.md](../TECH-DEBT.md) (includes UI issues)
- Historical: [archive/security-audit-2025-11-03/DESIGN-UPDATE.md](./archive/security-audit-2025-11-03/DESIGN-UPDATE.md)
- Historical: [archive/security-audit-2025-11-03/LAYOUT-GUIDE.md](./archive/security-audit-2025-11-03/LAYOUT-GUIDE.md)

### Integrations
- FreshRSS: [archive/security-audit-2025-11-03/FRESHRSS-SETUP.md](./archive/security-audit-2025-11-03/FRESHRSS-SETUP.md)
- Atlassian: [archive/security-audit-2025-11-03/ATLASSIAN-MCP-SETUP.md](./archive/security-audit-2025-11-03/ATLASSIAN-MCP-SETUP.md)
- Future: [FUTURE-FEATURES.md](../FUTURE-FEATURES.md)

### Database
- Schema: [archive/security-audit-2025-11-03/DATABASE-SETUP.md](./archive/security-audit-2025-11-03/DATABASE-SETUP.md)
- Current issues: [TECH-DEBT.md](../TECH-DEBT.md)

---

## 📝 Document Types

| Type | Location | Purpose |
|------|----------|---------|
| **Setup Guides** | `/docs/` | How to configure systems |
| **Operations** | `/docs/` & root | Day-to-day operations |
| **Planning** | `/docs/planning/` & root | Roadmaps and features |
| **Reference** | `/docs/reference/` & root | Technical reference |
| **Archives** | `/docs/archive/` | Historical documentation |

---

## 🎯 Common Tasks

### Setting Up Authentication
1. Read [SUPABASE-OAUTH-SETUP.md](./SUPABASE-OAUTH-SETUP.md)
2. Configure GitHub OAuth in Supabase
3. Test with instructions in archived TEST-AUTH-FLOW.md

### Deploying to Production
1. Read [CONFLUENCE-OPS-GUIDE.md](../CONFLUENCE-OPS-GUIDE.md)
2. Follow deployment checklist
3. Monitor with Vercel dashboard

### Adding New Features
1. Check [FUTURE-FEATURES.md](../FUTURE-FEATURES.md) for specs
2. Review [TECH-DEBT.md](../TECH-DEBT.md) for constraints
3. Create Jira story using [templates](./templates/)

### Troubleshooting
1. Check [TECH-DEBT.md](../TECH-DEBT.md) for known issues
2. Review [QA-RESPONSE.md](../QA-RESPONSE.md) for recent fixes
3. Check archived session notes for context

---

## 🤝 Contributing

### Documentation Standards
- Keep docs in `/docs/` or root (not both)
- Use clear, descriptive file names
- Update this index when adding new docs
- Archive obsolete docs (don't delete)
- Reference line numbers when citing code

### Where to Add New Docs
- **Setup/Config** → `/docs/getting-started/`
- **Operations** → `/docs/operations/`
- **Development** → `/docs/development/`
- **Planning** → `/docs/planning/`
- **Reference** → `/docs/reference/`
- **Project-wide** → Root directory

---

## 📞 Getting Help

- **For AI Assistants:** Read [AGENT-BRIEFING.md](../AGENT-BRIEFING.md) first
- **For Developers:** Start with main [README.md](../README.md)
- **For Ops:** Check [CONFLUENCE-OPS-GUIDE.md](../CONFLUENCE-OPS-GUIDE.md)

---

**Note:** This documentation structure was reorganized on 2025-11-12 to reduce redundancy and improve findability. Previous documentation (46 files) archived to `archive/security-audit-2025-11-03/`.
