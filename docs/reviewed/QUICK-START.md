# Quick Start Guide

Get World Papers running in under 5 minutes.

## Instant Preview (No Setup)

**View the Interactive Prototype**:

[View world-papers-prototype.jsx](computer:///mnt/user-data/outputs/world-papers-prototype.jsx)

This fully functional React demo shows all pages and features. You can:
- Navigate between all pages
- Test search and filters
- See the complete UI/UX
- Experience the design system

## Local Setup (10 minutes)

### Prerequisites
```bash
node --version  # Should be 18+
pnpm --version  # Should be 8+
```

Don't have pnpm? Install it:
```bash
npm install -g pnpm
```

### Steps

1. **Extract Repository**
   ```bash
   tar -xzf world-papers-nextjs.tar.gz
   cd world-papers-nextjs
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```
   
   This takes 2-3 minutes on first run.

3. **Set Up Environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Default values work for development.

4. **Create Seed Data**
   
   ⚠️ **NOTE**: The seed script needs to be implemented. For now, you can:
   
   **Option A**: Copy mock data from prototype
   - Extract JSON data from `world-papers-prototype.jsx`
   - Save to `data/seed/*.json`
   
   **Option B**: Manually create sample files
   ```bash
   mkdir -p data/seed
   # Create policies.json, articles.json, etc.
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```
   
   Opens at `http://localhost:3000`

## Docker Setup (5 minutes)

### With Docker Compose

```bash
cd world-papers-nextjs
docker-compose up -d
```

View at: `http://localhost`

### Build from Dockerfile

```bash
docker build -t world-papers .
docker run -p 3000:3000 world-papers
```

## What You'll See

### ✅ Working Now (Prototype)

The prototype demonstrates:
- Home page with hero, timeline, content grids
- Policies database with advanced filters
- Policy detail pages
- Analysis/articles section
- Thoughts (micro-posts)
- Videos library
- Events calendar
- Glossary with A-Z navigation
- About page
- Responsive design
- Dark mode interface

### 🔨 Needs Implementation (Starter Repo)

To get the Next.js version working, you need to:

1. **Create Page Components**
   - Copy UI from prototype into Next.js pages
   - File locations: `app/(site)/*/page.tsx`

2. **Add Mock Data**
   - Implement seed script OR
   - Manually create JSON files in `data/seed/`

3. **Implement Data Fetching**
   - Create adapters in `lib/adapters/`
   - Read from JSON files
   - Return typed data

## Development Workflow

### Typical Development Session

```bash
# Start dev server
pnpm dev

# In another terminal, watch types
pnpm typecheck --watch

# Run linting
pnpm lint

# Format code
pnpm format
```

### Adding a New Policy

1. Edit `data/seed/policies.json`
2. Add entry following schema in `docs/content-model.md`
3. Restart dev server
4. View at `http://localhost:3000/policies`

### Creating an Article

1. Create file: `content/articles/YYYY-MM-DD-slug.mdx`
2. Add frontmatter (see `docs/content-model.md`)
3. Write content in MDX
4. View at `http://localhost:3000/analysis/slug`

## Project Structure at a Glance

```
world-papers-nextjs/
├── app/              # Next.js pages (TO IMPLEMENT)
├── components/       # React components (TO IMPLEMENT)
├── lib/             # Utilities (TO IMPLEMENT)
│   ├── adapters/   # Data loading
│   ├── search/     # Search engine
│   └── utils/      # Helpers
├── data/            # Data files
│   └── seed/       # Mock JSON data
├── content/         # MDX content
│   ├── articles/   # Long-form
│   └── glossary/   # Terms
├── styles/          # Global CSS (✅ DONE)
├── docs/            # Documentation (✅ DONE)
└── public/          # Static files
```

## Common Issues

### "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
```

### "Port 3000 already in use"
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use different port
pnpm dev -- -p 3001
```

### TypeScript Errors
```bash
# Regenerate types
pnpm typecheck
```

## Next Steps

1. **Review the Prototype**
   - Understand UI/UX decisions
   - See component patterns
   - Test all functionality

2. **Read Documentation**
   - `README.md` - Complete guide
   - `docs/design-system.md` - Visual specs
   - `docs/content-model.md` - Data schemas

3. **Start Implementation**
   - Begin with home page
   - Add data adapters
   - Implement routing
   - Add search functionality

4. **Test & Refine**
   - Run Lighthouse audits
   - Test accessibility
   - Optimize performance

## Resources

- **Prototype**: Interactive demo of all features
- **Docs**: Complete specifications
- **README**: Detailed setup guide
- **HANDOFF**: Project overview

## Getting Help

### Documentation
- `README.md` - Setup and configuration
- `docs/design-system.md` - Design specifications
- `docs/content-model.md` - Data structures
- `HANDOFF.md` - Project summary

### Code Reference
- Prototype (`world-papers-prototype.jsx`) - Working UI/UX
- Design system (`styles/globals.css`) - Implemented styles
- Config files - All properly configured

---

## Ready to Build?

```bash
# Extract
tar -xzf world-papers-nextjs.tar.gz

# Install
cd world-papers-nextjs && pnpm install

# Run
pnpm dev

# Start building! 🚀
```

---

*Have questions? Review the prototype and documentation first.*
*Everything you need is included in the deliverables.*
