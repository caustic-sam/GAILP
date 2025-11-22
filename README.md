# Global AI & Policy Observatory (GAILP)

> **Digital Policy Analysis Platform with Web3 Integration**

A modern, production-ready Next.js application for analyzing and tracking AI and digital policy developments worldwide. Features real-time updates, expert analysis, comprehensive policy intelligence, and planned Web3 integration for decentralized archiving and governance.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

---

## 📚 For Students: What You'll Learn

This codebase is designed to be educational. By studying and contributing to this project, you'll learn:

- **Modern React Patterns**: Server Components, Client Components, hooks, context
- **Full-Stack Development**: Next.js App Router, API routes, database integration
- **Authentication & Authorization**: Supabase Auth, JWT tokens, protected routes
- **Real-Time Features**: Database subscriptions, live updates
- **Web3 Integration** (coming soon): Wallet authentication, blockchain integration
- **Production Best Practices**: TypeScript, testing, deployment, monitoring
- **Solo Founder Workflow**: Dual-track development, time management, documentation

💡 **Tip**: Look for comments marked with `// LEARNING:` throughout the codebase for educational explanations!

---

## 🌟 Current Features

### ✅ Production Ready (Tested & Deployed)

#### **User Authentication**
- Email/password registration and login
- OAuth integration (GitHub, Google)
- Protected admin routes with middleware
- JWT session management
- User profile management

**Learn**: See [contexts/AuthContext.tsx](contexts/AuthContext.tsx) for authentication patterns

#### **Article Management System**
- Full CRUD operations (Create, Read, Update, Delete)
- Rich text editor with formatting
- Draft/Published/Scheduled status workflow
- Featured image upload to Supabase Storage
- SEO metadata (title, description, tags)
- Slug generation and validation

**Learn**: See [app/admin/articles/](app/admin/articles/) for admin interface patterns

#### **Media Vault**
- File upload with drag & drop
- Image preview with quick view modal
- Delete with confirmation
- Cache-busting for fresh images
- Organized grid layout with metadata

**Learn**: See [app/admin/media/page.tsx](app/admin/media/page.tsx) for file handling patterns

#### **Publishing Desk (Admin Dashboard)**
- Article list with status indicators
- Quick actions (Edit, Delete, View)
- Dashboard statistics (total articles, drafts, scheduled)
- Real-time updates from database
- Toast notifications for user feedback

**Learn**: See [app/admin/page.tsx](app/admin/page.tsx) for dashboard patterns

#### **Quick Posts Integration**
- Webhook endpoint for external draft apps
- Token-based authentication
- Auto-publish short-form content
- Integrates with Drafts app on iOS/Mac

**Learn**: See [app/api/webhooks/quick-post/route.ts](app/api/webhooks/quick-post/route.ts) for webhook patterns

### 🚧 In Development

#### **Scheduled Publishing**
- UI complete with date/time picker
- Database column exists (`scheduled_for`)
- Needs cron job implementation for auto-publish

#### **View & Revision Tracking**
- Database columns ready (`view_count`, `revision_count`)
- Tracking logic not yet implemented
- Requires middleware or page view events

### 🗓️ Planned (V1.1+)

#### **Web3 Integration** (70+ hours estimated)
- **Phase 0**: Wallet authentication (MetaMask, WalletConnect)
- **Phase 1**: NFT-gated content, on-chain publishing (IPFS/Arweave)
- **Phase 2**: Token subscriptions, DAO governance
- **Phase 3**: Decentralized identity, Web3 analytics

**Why Web3?** Combining global policy analysis with blockchain creates:
- Decentralized policy archiving (immutable records)
- Token-gated premium insights
- DAO governance for policy discussions
- NFT credentials for policy experts
- Blockchain-verified article authenticity

**Learn**: See [docs/WEB3-IMPLEMENTATION-PLAN.md](docs/WEB3-IMPLEMENTATION-PLAN.md) for full roadmap

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14 (App Router)** - React framework with server-side rendering
  - Server Components: Default, render on server, no client JS
  - Client Components: `'use client'` directive, interactive UI
- **React 18** - UI library with concurrent features
- **TypeScript** - Type-safe JavaScript with interfaces and type checking
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library (open-source Feather fork)

### **Backend**
- **Next.js API Routes** - Serverless functions in `/api` folder
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication (email, OAuth, JWT)
  - Storage buckets for file uploads
  - Real-time subscriptions

### **Database**
- **PostgreSQL** (via Supabase) - Relational database
- **Migrations** - Sequential SQL files in `supabase/migrations/`
- **Tables**:
  - `articles` - Article content and metadata
  - `user_profiles` - Extended user information
  - Future: `categories`, `tags`, `comments`

### **Authentication**
- **Supabase Auth** - Email/password, OAuth providers
- **JWT Tokens** - Secure session management
- **Protected Routes** - Middleware checks authentication state
- **Row Level Security (RLS)** - Database-level access control

### **Deployment**
- **Vercel** - Hosting, CI/CD, edge functions
- **Supabase Cloud** - Managed database and auth

### **Planned Web3 Stack**
- **Wagmi + Viem** - React hooks for Ethereum
- **RainbowKit** - Wallet connection UI
- **Polygon** - Low-fee Ethereum Layer 2
- **Arweave** - Permanent decentralized storage

---

## 📁 Project Structure (Explained for Students)

```
www-GAILP-prd/
├── app/                          # Next.js App Router (NEW in Next.js 13+)
│   ├── api/                      # Backend API endpoints (serverless functions)
│   │   ├── admin/                # Admin-only endpoints
│   │   │   └── articles/         # Article CRUD operations
│   │   │       ├── route.ts      # GET (list), POST (create)
│   │   │       └── [id]/         # Dynamic route
│   │   │           └── route.ts  # GET, PUT, DELETE by ID
│   │   └── webhooks/             # External integrations
│   │       └── quick-post/       # Quick Posts webhook
│   │
│   ├── admin/                    # Admin interface (protected routes)
│   │   ├── page.tsx              # Publishing Desk dashboard
│   │   ├── articles/             # Article management
│   │   │   ├── new/              # Create article form
│   │   │   └── [id]/edit/        # Edit article form
│   │   ├── media/                # Media Vault
│   │   └── studio/               # Content studio
│   │
│   ├── articles/                 # Public article pages
│   │   └── [slug]/               # Dynamic article route
│   │       └── page.tsx          # Article detail view
│   │
│   ├── auth/                     # Authentication pages
│   │   ├── login/                # Login form
│   │   ├── signup/               # Registration form
│   │   └── callback/             # OAuth callback handler
│   │
│   ├── page.tsx                  # Homepage (root route)
│   ├── layout.tsx                # Root layout (wraps all pages)
│   └── globals.css               # Global styles
│
├── components/                   # Reusable React components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx            # Button variants
│   │   ├── Card.tsx              # Card layouts
│   │   └── Input.tsx             # Form inputs
│   ├── Header.tsx                # Site navigation
│   ├── Footer.tsx                # Site footer
│   └── RightSidebar.tsx          # Admin sidebar navigation
│
├── contexts/                     # React Context providers
│   └── AuthContext.tsx           # Global authentication state
│
├── lib/                          # Utility libraries
│   ├── supabase.ts               # Supabase client (server-side)
│   ├── supabase-browser.ts       # Supabase client (browser-side)
│   ├── mockData.ts               # Mock data for development
│   └── database/                 # Database utilities
│
├── supabase/                     # Supabase configuration
│   └── migrations/               # Database migrations (sequential SQL)
│       ├── 001_initial_schema.sql
│       ├── 002_add_auth.sql
│       └── 011_add_article_metrics.sql
│
├── scripts/                      # Automation scripts
│   ├── audit-site.ts             # Comprehensive site audit
│   └── audit-web3-readiness.ts   # Web3 integration planner
│
├── docs/                         # Documentation
│   ├── SESSION-HANDOFF-2025-11-16.md      # Latest session summary
│   ├── DUAL-TRACK-EXECUTION-GUIDE.md      # Development workflow
│   ├── QA-BRIEFING-KAN-77.md              # Testing guide
│   └── confluence/                         # Confluence/Jira docs
│
├── .env.example                  # Environment variables template
├── .env.local                    # Your local secrets (git-ignored)
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## 🚀 Quick Start (Step-by-Step)

### **Prerequisites**

Before you begin, ensure you have:
- **Node.js 18+** - [Download](https://nodejs.org/)
- **pnpm** - Fast package manager
  ```bash
  npm install -g pnpm
  ```
- **Git** - Version control
- **Code Editor** - VS Code recommended

### **Step 1: Clone Repository**

```bash
git clone <repository-url>
cd www-GAILP-prd
```

### **Step 2: Install Dependencies**

```bash
pnpm install
```

This installs all packages from `package.json`:
- Next.js, React, TypeScript
- Supabase client libraries
- Tailwind CSS
- Lucide icons
- And more...

### **Step 3: Environment Variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Supabase (Required for database)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Quick Posts (Optional - for mobile drafts)
QUICK_POST_TOKEN="your-secret-token"
```

**Getting Supabase Credentials:**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project (2-3 min wait)
3. Go to Settings → API
4. Copy `URL` and `anon public` key

### **Step 4: Database Setup**

Run migrations in Supabase SQL Editor:

```bash
# Copy each file from supabase/migrations/ in order
# Paste into Supabase SQL Editor → Run
```

Or use Supabase CLI:
```bash
supabase db push
```

### **Step 5: Run Development Server**

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

### **Step 6: Create Admin Account**

1. Go to `/auth/signup`
2. Register with email/password
3. Check email for verification link
4. Login at `/auth/login`

---

## 💻 Available Scripts

### **Development**

```bash
pnpm dev              # Start development server (port 3000)
pnpm build            # Build for production
pnpm start            # Run production build locally
pnpm lint             # Run ESLint
pnpm typecheck        # Check TypeScript errors
```

### **Audit & Testing** (NEW!)

```bash
pnpm audit            # Run comprehensive site audit
                      # → Generates docs/AUDIT-REPORT.md
                      # → Generates docs/AUDIT-JIRA-IMPORT.csv

pnpm audit:web3       # Run Web3 readiness audit
                      # → Generates docs/WEB3-IMPLEMENTATION-PLAN.md
```

**What the audits check:**
- All routes (public + admin)
- API endpoints (methods, exports)
- Environment variables (missing values)
- Components (test coverage)
- Database migrations
- Web3 dependencies and integration planning

---

## 🔑 Key Concepts (For Students)

### **1. Next.js App Router**

Next.js 14 uses a file-system router where folders = routes:

```
app/
├── page.tsx              → /
├── about/
│   └── page.tsx          → /about
└── articles/
    └── [slug]/
        └── page.tsx      → /articles/:slug (dynamic)
```

**Server vs Client Components:**
```tsx
// Server Component (default) - NO 'use client'
// Renders on server, can access database directly
export default async function Page() {
  const data = await fetchFromDatabase();
  return <div>{data}</div>;
}

// Client Component - Needs 'use client' directive
'use client';
// Runs in browser, can use useState, useEffect, onClick
export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### **2. Supabase Authentication**

```tsx
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

**How it works:**
1. User enters credentials
2. Supabase validates and returns JWT token
3. Token stored in cookie
4. Every request includes token
5. Server validates token for protected routes

### **3. Database Queries (Supabase)**

```tsx
// Create
const { data, error } = await supabase
  .from('articles')
  .insert({ title: 'New Article', content: '...' });

// Read (single)
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .eq('slug', 'my-article')
  .single();

// Read (list with filters)
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .limit(10);

// Update
const { data, error } = await supabase
  .from('articles')
  .update({ title: 'Updated Title' })
  .eq('id', articleId);

// Delete
const { data, error } = await supabase
  .from('articles')
  .delete()
  .eq('id', articleId);
```

### **4. API Routes (Serverless Functions)**

API routes are files in `app/api/` that export HTTP methods:

```tsx
// app/api/articles/route.ts
import { NextResponse } from 'next/server';

// GET /api/articles
export async function GET(request: Request) {
  const articles = await fetchArticles();
  return NextResponse.json({ articles });
}

// POST /api/articles
export async function POST(request: Request) {
  const body = await request.json();
  const article = await createArticle(body);
  return NextResponse.json({ article }, { status: 201 });
}

// app/api/articles/[id]/route.ts
// PUT /api/articles/:id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const article = await updateArticle(id, body);
  return NextResponse.json({ article });
}

// DELETE /api/articles/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteArticle(id);
  return NextResponse.json({ success: true });
}
```

### **5. TypeScript Interfaces**

Define data shapes for type safety:

```tsx
// Article interface
interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: 'draft' | 'published' | 'scheduled';
  published_at: string | null;
  scheduled_for: string | null;
  featured_image_url: string | null;
  author_id: string;
  view_count: number;
  revision_count: number;
  created_at: string;
  updated_at: string;
}

// Use in component
function ArticleCard({ article }: { article: Article }) {
  return (
    <div>
      <h2>{article.title}</h2>
      <p>{article.excerpt}</p>
    </div>
  );
}
```

### **6. React Context (Global State)**

Context provides state to entire component tree:

```tsx
// contexts/AuthContext.tsx
'use client';
import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // ... auth logic

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Use in any component
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

---

## 🧪 Testing Workflow

### **Manual Testing**

1. **Review QA Briefing**: [docs/QA-BRIEFING-KAN-77.md](docs/QA-BRIEFING-KAN-77.md)
2. **Test each feature** systematically
3. **Check console** for errors
4. **Verify mobile** responsiveness
5. **Document issues** in Jira

### **Automated Testing** (Coming Soon)

```bash
pnpm test              # Run Jest tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

---

## 📊 Development Workflow (Dual-Track)

This project uses a **dual-track development strategy**:

### **Track 1: Stabilization** (60% time)
- Fix bugs from audit
- Improve test coverage
- Optimize performance
- Complete V1.0 launch prep

### **Track 2: Web3 Integration** (40% time)
- Install Web3 libraries
- Build wallet authentication
- Implement NFT gating
- Deploy smart contracts

**Daily Schedule (Solo Founder):**
```
09:00-11:00  Deep Work (Web3 features - requires focus)
11:00-12:00  Break / Admin
12:00-15:00  Bug Fixing (context switching OK)
15:00-16:00  Testing
16:00-17:00  Documentation / Planning
```

See [docs/DUAL-TRACK-EXECUTION-GUIDE.md](docs/DUAL-TRACK-EXECUTION-GUIDE.md) for full workflow.

---

## 📚 Learning Resources

### **Next.js**
- [Official Docs](https://nextjs.org/docs) - Comprehensive guide
- [Learn Next.js](https://nextjs.org/learn) - Interactive tutorial
- [App Router Guide](https://nextjs.org/docs/app) - NEW routing system

### **React**
- [React Docs](https://react.dev/) - Official documentation
- [React Hooks](https://react.dev/reference/react) - useState, useEffect, etc.
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### **TypeScript**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript for React](https://react-typescript-cheatsheet.netlify.app/)

### **Supabase**
- [Supabase Docs](https://supabase.com/docs)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### **Tailwind CSS**
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Utility-First CSS](https://tailwindcss.com/docs/utility-first)

### **Web3** (For future work)
- [Wagmi Docs](https://wagmi.sh/) - React hooks for Ethereum
- [RainbowKit](https://www.rainbowkit.com/) - Wallet UI
- [Polygon Docs](https://polygon.technology/developers) - Layer 2 blockchain
- [IPFS Docs](https://docs.ipfs.tech/) - Decentralized storage

---

## 🐛 Known Issues & Roadmap

### **Known Issues**
- View count tracking not implemented (columns exist)
- Revision history not tracked (columns exist)
- Scheduled publishing needs cron job

### **V1.0 Launch Checklist**
- [ ] Run comprehensive site audit
- [ ] Fix critical bugs
- [ ] Achieve 90%+ feature completion
- [ ] Performance optimization (Lighthouse >90)
- [ ] Security review
- [ ] Documentation complete

### **V1.1 Roadmap (Web3)**
- [ ] Wallet authentication (8h)
- [ ] NFT-gated content (12h)
- [ ] On-chain publishing (16h)
- [ ] Token subscriptions (14h)
- [ ] DAO governance (20h)

See [docs/WEB3-IMPLEMENTATION-PLAN.md](docs/WEB3-IMPLEMENTATION-PLAN.md) for detailed roadmap.

---

## 🤝 Contributing (For Students)

### **Getting Started**

1. **Fork** the repository
2. **Clone** your fork
3. **Create branch**: `git checkout -b feature/amazing-feature`
4. **Make changes** with clear commit messages
5. **Push**: `git push origin feature/amazing-feature`
6. **Open Pull Request** with description

### **Code Style**

```tsx
// ✅ GOOD: Descriptive names, types, comments
interface ArticleCardProps {
  article: Article;
  onDelete?: (id: string) => void;
}

/**
 * Displays article preview with title, excerpt, and metadata.
 * Used on homepage and category pages.
 */
export function ArticleCard({ article, onDelete }: ArticleCardProps) {
  // ... implementation
}

// ❌ BAD: Vague names, no types, no comments
function Card({ a, cb }) {
  // ... implementation
}
```

### **Commit Messages**

```bash
# Format: <type>(<scope>): <subject>

fix(media): Resolve cache-busting issue in media vault
feat(web3): Add wallet connection button
docs(readme): Update setup instructions for students
test(api): Add tests for article CRUD endpoints
```

### **Testing Before PR**

```bash
pnpm lint        # No linting errors
pnpm typecheck   # No TypeScript errors
pnpm build       # Production build succeeds
pnpm audit       # Review audit report
```

---

## 🔒 Security

- ✅ Environment variables secured (never commit `.env.local`)
- ✅ JWT tokens for authentication
- ✅ Row Level Security (RLS) on database
- ✅ Input validation on API routes
- ✅ CSRF protection via SameSite cookies
- ✅ SQL injection prevention (parameterized queries)

**Security Best Practices:**
- Never log sensitive data (tokens, passwords)
- Always validate user input
- Use HTTPS in production
- Keep dependencies updated
- Follow principle of least privilege

---

## 📄 License

**Proprietary** - All rights reserved

This is a private educational project. Unauthorized copying, distribution, or modification is prohibited.

© 2024-2025 Global AI & Policy Observatory

---

## 🎓 Final Tips for Students

1. **Read the code** - Don't just copy/paste. Understand what each line does.
2. **Experiment** - Break things! That's how you learn. (Use git to revert)
3. **Ask questions** - Use comments, discussions, or issues
4. **Start small** - Pick ONE feature to understand deeply
5. **Document** - Write notes as you learn
6. **Share** - Teach others what you learned

**Recommended Learning Path:**
1. **Week 1**: Setup project, understand folder structure
2. **Week 2**: Study authentication flow (AuthContext, API routes)
3. **Week 3**: Build a simple CRUD feature (create, read, update, delete)
4. **Week 4**: Add tests and deploy to Vercel

---

**Built with ❤️ for learning - Next.js, TypeScript, Supabase, and Web3**

**Questions?** Open an issue or check [docs/](docs/) folder for guides!
