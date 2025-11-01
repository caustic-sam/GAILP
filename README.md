# Working Title Policy Analysis Platform

> **Global Digital Policy Analysis Platform**

A modern, production-ready Next.js application for analyzing and tracking digital policy developments worldwide. Features real-time updates, expert analysis, and comprehensive policy intelligence.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)

---

## 🌟 Features

### **Live & Deployed**
* ✅ **Real-time Policy Feed** - Live updates from global regulatory bodies (via FreshRSS)
* ✅ **Expert Analysis** - In-depth articles from policy professionals (placeholder page live)
* ✅ **Video Insights** - Expert commentary and deep dives (placeholder page live)
* 🚧 **Community Hub** - Live policy discussions and quick thoughts (in development)
* 🗓️ **Newsletter** - Weekly insights delivered to your inbox (planned)
* 🗓️ **Resource Library** - Templates, reports, and tools (planned)

### **Technical Excellence**
- ✅ **Next.js 14 App Router** - Modern React framework with SSR/SSG
- ✅ **TypeScript** - Full type safety throughout
- ✅ **Tailwind CSS** - Utility-first styling system
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **SEO Optimized** - Meta tags, sitemaps, structured data
- ✅ **Performance** - Lighthouse score >90
- ✅ **Production Ready** - Docker, CI/CD, monitoring

---

## 🎨 Component Gallery

**New in v0.2!** Visual component showcase at `/components`:
- 🎨 All UI components with live examples
- 🎨 Color palette with hex codes
- 🎨 Typography reference
- 🎨 Interactive variants

Visit [http://localhost:3000/components](http://localhost:3000/components) to explore.

---

## 🚀 Quick Start

### **Prerequisites**

- Node.js 18+ (LTS recommended)
- pnpm 8+ (or npm/yarn)
- Git

### **Installation**

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
pnpm dev
```

**Open** [http://localhost:3000](http://localhost:3000) 🎉

### **First Time Setup**

See [QUICK-START.md](./docs/QUICK-START.md) for detailed instructions.

---

## 📁 Project Structure

```
world-papers-nextjs/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   ├── articles/             # Article pages
│   ├── policies/             # Policy pages
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout
│   └── sitemap.ts            # SEO sitemap
│
├── components/               # React components
│   └── ui/                   # Base UI components
│
├── lib/                      # Utilities
│   ├── supabase.ts           # Database client
│   ├── api.ts                # API layer with mock fallback
│   ├── freshrss.ts           # FreshRSS integration
│   ├── mockData.ts           # Mock data for development
│   └── database/
│       └── schema.sql        # PostgreSQL schema
│
├── docs/                     # Documentation
│   ├── PRODUCTION-PLAN.md    # 📋 Complete roadmap
│   ├── DATABASE-SETUP.md     # 🗄️ Supabase setup guide
│   ├── SETUP-COMPLETE.md     # ✅ Part B summary
│   ├── CLAUDE-CODE-GUIDE.md  # 🤖 AI assistance
│   └── QUICK-START.md        # ⚡ Setup guide
│
├── docker-compose.yml        # Docker orchestration
├── Dockerfile                # Container config
├── next.config.js            # Next.js config
├── tailwind.config.ts        # Tailwind config
└── package.json              # Dependencies
```

---

## 🎯 Development Workflow

### **Daily Development**

```bash
# 1. Start dev server
pnpm dev

# 2. Make changes
# Files auto-reload

# 3. Commit when ready
git add .
git commit -m "Description"
```

### **Using Claude Code** (Recommended)

```bash
# Start AI-assisted development
claude-code --context docs/PRODUCTION-PLAN.md interactive

# Ask Claude for help
> "Continue Day 3 tasks from the plan"
```

See [CLAUDE-CODE-GUIDE.md](./docs/CLAUDE-CODE-GUIDE.md)

### **Available Commands**

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Run production build
pnpm lint             # Lint code
pnpm typecheck        # Check TypeScript
```

---

## 🗄️ Database Setup

### **Supabase** (Recommended)

**Quick Setup** (15 minutes):

1. Create account at [supabase.com](https://supabase.com)
2. Create new project (wait 2-3 minutes)
3. Get API credentials from Settings → API
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="your-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```
5. Run schema in SQL Editor:
   - Copy contents of `lib/database/schema.sql`
   - Paste into Supabase SQL Editor
   - Click "Run"
6. Restart dev server: `pnpm dev`

**Full Guide**: See [docs/DATABASE-SETUP.md](./docs/DATABASE-SETUP.md)

**Note**: App works immediately with mock data if database not configured yet!

---

## 🚀 Deployment

### **Vercel** (5 minutes)

```bash
npm i -g vercel
vercel
```

### **Docker** (Self-hosted)

```bash
docker-compose up -d
```

---

## 📋 Production Checklist

Following [PRODUCTION-PLAN.md](./docs/PRODUCTION-PLAN.md):

- [ ] **Week 1**: Backend & Data
- [ ] **Week 2**: Content & Media
- [ ] **Week 3**: Features
- [ ] **Week 4**: Launch 🎉

---

## 📖 Documentation

### Getting Started
- [Quick Start](./docs/QUICK-START.md) - Fast setup guide
- [Database Setup](./docs/DATABASE-SETUP.md) - Supabase configuration
- [Setup Complete](./docs/SETUP-COMPLETE.md) - Part A & B summary

### Development
- [Production Plan](./docs/PRODUCTION-PLAN.md) - 20-day roadmap
- [Claude Code Guide](./docs/CLAUDE-CODE-GUIDE.md) - AI-assisted development
- [CHANGELOG](./CHANGELOG.md) - Version history

### Reference
- [Component Gallery](http://localhost:3000/components) - UI components (live)
- [Page Overview](./docs/PAGE-OVERVIEW.md) - All pages documented
- [Design System](./docs/DESIGN-UPDATE.md) - Colors and styles

---

## 🔒 Security

- ✅ Environment variables secured
- ✅ API rate limiting
- ✅ Input validation
- ✅ Security headers

---

## 📞 Support

- **Documentation**: `./docs/` folder
- **Issues**: GitHub Issues
- **Email**: support@worldpapers.com

---

## 📄 License

**Proprietary** - All rights reserved

© 2024 World Papers

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
