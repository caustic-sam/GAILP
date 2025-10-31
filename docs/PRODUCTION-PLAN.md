# World Papers - Production-Ready Project Plan

**Option 2: Production-Ready Implementation**  
**Timeline**: 2-4 weeks  
**Goal**: Launch-ready, scalable, professional site

---

## 🎯 Project Overview

**Current State**: Functional prototype with mock data  
**Target State**: Production-ready site with real data, SEO, performance optimization

**Success Criteria**:
- [ ] Real data from database
- [ ] SEO optimized for all pages
- [ ] Lighthouse score >90
- [ ] Newsletter signup functional
- [ ] Analytics tracking
- [ ] Deployed to production
- [ ] Documentation complete

---

## 📅 Timeline & Milestones

### **Week 1: Foundation & Data Layer**
- Days 1-2: Database setup & schema design
- Days 3-4: API routes & data fetching
- Day 5: Testing & documentation

### **Week 2: Content & Media**
- Days 1-2: Real content integration
- Days 3-4: Image optimization & CDN
- Day 5: SEO implementation

### **Week 3: Features & Optimization**
- Days 1-2: Newsletter & analytics
- Days 3-4: Performance optimization
- Day 5: Testing & bug fixes

### **Week 4: Launch Prep**
- Days 1-2: Security audit & polish
- Days 3-4: Deployment & monitoring
- Day 5: Launch & documentation

---

## 📊 Phase Breakdown

---

# PHASE 1: Database & Backend Setup (Days 1-5)

## 🎯 Objectives
- Set up production database
- Create data schema
- Build API routes
- Replace mock data with real data

## 📋 Tasks

### **Day 1: Database Setup** ⏱️ 4-6 hours

**Task 1.1: Choose & Set Up Database**
- [ ] Decision: Supabase (recommended) vs. PlanetScale vs. Vercel Postgres
- [ ] Create account
- [ ] Create new project
- [ ] Get connection string
- [ ] Add to `.env.local`

**Supabase Setup** (Recommended):
```bash
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Wait 2-3 minutes for provisioning
# 4. Go to Project Settings > API
# 5. Copy these values to .env.local:

NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Task 1.2: Install Database Dependencies**
```bash
# For Supabase
pnpm add @supabase/supabase-js

# For Prisma (if using PlanetScale/Postgres)
pnpm add -D prisma
pnpm add @prisma/client
```

**Task 1.3: Create Database Schema**

Create `prisma/schema.prisma` OR Supabase SQL tables:

```sql
-- Supabase: Run in SQL Editor

-- Policies table
CREATE TABLE policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT,
  status TEXT NOT NULL, -- 'draft', 'adopted', 'in_force', 'repealed'
  category TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  author_title TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  read_time TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  published_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Thoughts table (Policy Pulse)
CREATE TABLE thoughts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Videos table
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  duration TEXT NOT NULL,
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX idx_policies_date ON policies(date DESC);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_thoughts_created ON thoughts(created_at DESC);
```

**Checkpoint**: ✅ Database created, tables set up, connection tested

**Save Point**: If stopping here, document:
- Database URL saved in `.env.local`
- Schema created and tested
- Next: Create API routes

---

### **Day 2: Seed Database with Real Data** ⏱️ 4-6 hours

**Task 2.1: Create Database Client**

Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Task 2.2: Create Seed Script**

Create `scripts/seed.ts`:
```typescript
import { supabase } from '../lib/supabase'
import { mockPolicies, mockArticles, mockThoughts, mockVideos } from '../lib/mockData'

async function seed() {
  console.log('🌱 Seeding database...')
  
  // Insert policies
  const { error: policiesError } = await supabase
    .from('policies')
    .insert(mockPolicies)
  
  if (policiesError) console.error('Policies error:', policiesError)
  else console.log('✅ Policies seeded')
  
  // Insert articles
  const { error: articlesError } = await supabase
    .from('articles')
    .insert(mockArticles)
  
  if (articlesError) console.error('Articles error:', articlesError)
  else console.log('✅ Articles seeded')
  
  // Insert thoughts
  const { error: thoughtsError } = await supabase
    .from('thoughts')
    .insert(mockThoughts)
  
  if (thoughtsError) console.error('Thoughts error:', thoughtsError)
  else console.log('✅ Thoughts seeded')
  
  // Insert videos
  const { error: videosError } = await supabase
    .from('videos')
    .insert(mockVideos)
  
  if (videosError) console.error('Videos error:', videosError)
  else console.log('✅ Videos seeded')
  
  console.log('🎉 Database seeding complete!')
}

seed()
```

**Run seed script**:
```bash
npx tsx scripts/seed.ts
```

**Task 2.3: Verify Data**
- [ ] Check Supabase dashboard
- [ ] See all tables populated
- [ ] Test queries

**Checkpoint**: ✅ Database has real data

**Save Point**: If stopping here, document:
- Seed script ran successfully
- Data visible in Supabase dashboard
- Next: Create API routes to fetch this data

---

### **Day 3: Create API Routes** ⏱️ 4-6 hours

**Task 3.1: Create API Routes**

**File: `app/api/policies/route.ts`**
```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') || '10'
  const status = searchParams.get('status')
  
  let query = supabase
    .from('policies')
    .select('*')
    .order('date', { ascending: false })
    .limit(parseInt(limit))
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
```

**File: `app/api/articles/route.ts`**
```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') || '10'
  
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(parseInt(limit))
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
```

**File: `app/api/thoughts/route.ts`**
```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('thoughts')
    .insert([body])
    .select()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data[0])
}
```

**File: `app/api/videos/route.ts`**
```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(10)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
```

**Task 3.2: Test API Routes**
```bash
# Start dev server
pnpm dev

# Test in browser or curl:
# http://localhost:3000/api/policies
# http://localhost:3000/api/articles
# http://localhost:3000/api/thoughts
# http://localhost:3000/api/videos
```

**Checkpoint**: ✅ API routes working, returning data

**Save Point**: If stopping here, document:
- API routes created in `app/api/*`
- All routes tested and working
- Next: Update homepage to fetch from API

---

### **Day 4: Update Homepage to Use Real Data** ⏱️ 4-6 hours

**Task 4.1: Create Data Fetching Utilities**

**File: `lib/api.ts`**
```typescript
export async function getPolicies(limit = 10, status?: string) {
  const params = new URLSearchParams({ limit: limit.toString() })
  if (status) params.append('status', status)
  
  const res = await fetch(`/api/policies?${params}`, { 
    cache: 'no-store' // or 'force-cache' for static
  })
  
  if (!res.ok) throw new Error('Failed to fetch policies')
  return res.json()
}

export async function getArticles(limit = 10) {
  const res = await fetch(`/api/articles?limit=${limit}`, {
    cache: 'no-store'
  })
  
  if (!res.ok) throw new Error('Failed to fetch articles')
  return res.json()
}

export async function getThoughts() {
  const res = await fetch('/api/thoughts', {
    cache: 'no-store'
  })
  
  if (!res.ok) throw new Error('Failed to fetch thoughts')
  return res.json()
}

export async function getVideos() {
  const res = await fetch('/api/videos', {
    cache: 'no-store'
  })
  
  if (!res.ok) throw new Error('Failed to fetch videos')
  return res.json()
}
```

**Task 4.2: Update Homepage**

**File: `app/page.tsx`** (Key changes):
```typescript
// Change from:
import { mockPolicies, mockArticles, ... } from '@/lib/mockData'

// To server component with real data:
import { getPolicies, getArticles, getThoughts, getVideos } from '@/lib/api'

export default async function HomePage() {
  // Fetch real data
  const policies = await getPolicies(4)
  const articles = await getArticles(3)
  const thoughts = await getThoughts()
  const videos = await getVideos()
  
  // Rest of component stays the same, just use real data
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... */}
      {policies.map(policy => (
        // Same component code
      ))}
    </div>
  )
}
```

**Task 4.3: Handle Loading & Error States**

Create `app/loading.tsx`:
```typescript
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading World Papers...</p>
      </div>
    </div>
  )
}
```

Create `app/error.tsx`:
```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
```

**Checkpoint**: ✅ Homepage using real database data

**Save Point**: If stopping here, document:
- Homepage converted to server component
- Real data flowing from DB → API → Homepage
- Loading and error states added
- Next: Add more pages

---

### **Day 5: Create Additional Pages** ⏱️ 4-6 hours

**Task 5.1: Policies Page**

**File: `app/policies/page.tsx`**
```typescript
import { getPolicies } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { StatusDot } from '@/components/ui/StatusDot'
// ... create full policies list page with filters
```

**Task 5.2: Articles Page**

**File: `app/articles/page.tsx`**
```typescript
import { getArticles } from '@/lib/api'
// ... create articles list page
```

**Task 5.3: Individual Article Page**

**File: `app/articles/[id]/page.tsx`**
```typescript
import { supabase } from '@/lib/supabase'

export async function generateStaticParams() {
  const { data: articles } = await supabase.from('articles').select('id')
  return articles?.map((article) => ({ id: article.id })) || []
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', params.id)
    .single()
  
  // Render full article
}
```

**Checkpoint**: ✅ Phase 1 Complete - Backend & Data Layer Done

**End of Week 1 Save Point**:
- ✅ Database set up and populated
- ✅ API routes created and tested
- ✅ Homepage using real data
- ✅ Additional pages created
- 📝 Next: Phase 2 - Content & Media

---

# PHASE 2: Content & Media (Days 6-10)

## 🎯 Objectives
- Add real images
- Optimize media delivery
- Implement proper SEO
- Content management

## 📋 Tasks

### **Day 6: Image Optimization** ⏱️ 4-6 hours

**Task 6.1: Set Up Image Storage**

**Option A: Supabase Storage** (Recommended)
```typescript
// Upload images to Supabase Storage
// lib/uploadImage.ts
import { supabase } from './supabase'

export async function uploadImage(file: File, bucket: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file)
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)
  
  return publicUrl
}
```

**Option B: Cloudinary**
```bash
pnpm add cloudinary
```

**Task 6.2: Replace Placeholder Images**

Update components to use Next.js Image:
```tsx
import Image from 'next/image'

// Instead of:
<div className="w-full h-48 bg-gradient...">
  Placeholder
</div>

// Use:
<Image
  src={article.image_url}
  alt={article.title}
  width={400}
  height={250}
  className="w-full h-48 object-cover"
/>
```

**Task 6.3: Configure Next.js for External Images**

Update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-supabase-project.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

module.exports = nextConfig
```

**Checkpoint**: ✅ Real images loading and optimized

**Save Point**: If stopping here, document:
- Image storage solution chosen and configured
- All placeholder images replaced
- Next.js Image component implemented
- Next: SEO implementation

---

### **Day 7-8: SEO Implementation** ⏱️ 8-10 hours

**Task 7.1: Create SEO Component**

**File: `components/SEO.tsx`**
```typescript
import { Metadata } from 'next'

interface SEOProps {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  authors?: string[]
}

export function generateMetadata({
  title,
  description,
  image = '/og-image.jpg',
  url,
  type = 'website',
  publishedTime,
  authors
}: SEOProps): Metadata {
  const siteName = 'World Papers'
  const fullTitle = `${title} | ${siteName}`
  
  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      images: [{ url: image }],
      type,
      ...(publishedTime && { publishedTime }),
      ...(authors && { authors }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}
```

**Task 7.2: Add Metadata to Pages**

**File: `app/page.tsx`** (add):
```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'World Papers - Global Digital Policy Analysis',
  description: 'Independent analysis of global digital policy, data protection, and AI governance. Expert insights and real-time updates.',
  openGraph: {
    title: 'World Papers - Global Digital Policy Analysis',
    description: 'Independent analysis of global digital policy',
    images: ['/og-home.jpg'],
  },
}
```

**File: `app/articles/[id]/page.tsx`** (add):
```typescript
export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  const article = await getArticle(params.id)
  
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.author_name],
      images: [article.image_url],
    },
  }
}
```

**Task 7.3: Create Sitemap**

**File: `app/sitemap.ts`**
```typescript
import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://worldpapers.com'
  
  // Get all articles
  const { data: articles } = await supabase
    .from('articles')
    .select('id, updated_at')
  
  const articleUrls = articles?.map((article) => ({
    url: `${baseUrl}/articles/${article.id}`,
    lastModified: article.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || []
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/policies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...articleUrls,
  ]
}
```

**Task 7.4: Create Robots.txt**

**File: `app/robots.ts`**
```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://worldpapers.com/sitemap.xml',
  }
}
```

**Task 7.5: Add Structured Data**

**File: `components/StructuredData.tsx`**
```typescript
export function ArticleStructuredData({ article }: { article: any }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    image: article.image_url,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Person',
      name: article.author_name,
    },
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
```

**Checkpoint**: ✅ Full SEO implementation complete

**Save Point**: If stopping here, document:
- Metadata added to all pages
- Sitemap and robots.txt created
- Structured data implemented
- Next: Performance optimization

---

### **Day 9-10: Content Management** ⏱️ 8-10 hours

**Task 9.1: Create Admin Dashboard (Optional)**

Simple admin for adding content:

**File: `app/admin/page.tsx`**
```typescript
// Protected admin page for adding articles, policies, etc.
// Can use NextAuth for authentication
```

**OR use Supabase Dashboard directly** (easier for now)

**Task 9.2: Create Content Guidelines**

**File: `docs/CONTENT-GUIDE.md`**
```markdown
# Content Guidelines

## Adding Articles
1. Go to Supabase Dashboard
2. Navigate to Table Editor > articles
3. Click "Insert row"
4. Fill in required fields...

## Image Requirements
- Format: JPG or PNG
- Size: 1200x630px for OG images
- Max file size: 500KB
...
```

**Checkpoint**: ✅ Phase 2 Complete - Content & Media Done

**End of Week 2 Save Point**:
- ✅ Real images implemented
- ✅ SEO fully configured
- ✅ Content management process defined
- 📝 Next: Phase 3 - Features & Optimization

---

# PHASE 3: Features & Optimization (Days 11-15)

## 🎯 Objectives
- Newsletter signup (functional)
- Analytics integration
- Performance optimization
- Lighthouse score >90

## 📋 Tasks

### **Day 11: Newsletter Integration** ⏱️ 4-6 hours

**Task 11.1: Newsletter API Route**

**File: `app/api/newsletter/route.ts`**
```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }
    
    // Insert into database
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }])
      .select()
    
    if (error) {
      if (error.code === '23505') { // Duplicate email
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 409 }
        )
      }
      throw error
    }
    
    // Optional: Send welcome email via Resend or SendGrid
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed!' 
    })
    
  } catch (error) {
    console.error('Newsletter error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
```

**Task 11.2: Newsletter Form Component**

**File: `components/NewsletterForm.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { Button } from './ui/Button'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setStatus('success')
        setMessage(data.message)
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error)
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to subscribe. Please try again.')
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        disabled={status === 'loading'}
        className="flex-1 px-5 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
      />
      <Button 
        variant="primary" 
        size="lg"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </Button>
      
      {message && (
        <p className={`text-sm mt-2 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </form>
  )
}
```

**Task 11.3: Update Homepage**

Replace static newsletter section with `<NewsletterForm />`.

**Checkpoint**: ✅ Newsletter signup functional

**Save Point**: If stopping here, document:
- Newsletter API working
- Form functional and validated
- Emails stored in database
- Next: Analytics

---

### **Day 12: Analytics & Monitoring** ⏱️ 4-6 hours

**Task 12.1: Google Analytics 4**

**Install:**
```bash
pnpm add @next/third-parties
```

**File: `app/layout.tsx`** (add):
```typescript
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

**Task 12.2: Vercel Analytics** (if using Vercel)

```bash
pnpm add @vercel/analytics
```

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Task 12.3: Error Monitoring (Sentry)**

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Follow setup wizard.

**Checkpoint**: ✅ Analytics tracking all pages

**Save Point**: If stopping here, document:
- GA4 installed and tracking
- Vercel Analytics (if applicable)
- Error monitoring configured
- Next: Performance optimization

---

### **Day 13-14: Performance Optimization** ⏱️ 8-10 hours

**Task 13.1: Image Optimization Audit**

Run Lighthouse and check:
- [ ] All images use Next.js Image component
- [ ] Proper width/height attributes
- [ ] Lazy loading enabled
- [ ] WebP format used

**Task 13.2: Code Splitting**

**Implement dynamic imports for heavy components:**
```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false // if client-only
})
```

**Task 13.3: Database Query Optimization**

Add database indexes (if not done):
```sql
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_policies_date ON policies(date DESC);
```

Enable query caching:
```typescript
// In API routes
export const revalidate = 60 // Revalidate every 60 seconds
```

**Task 13.4: Font Optimization**

**File: `app/layout.tsx`**
```typescript
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

**Task 13.5: Implement Caching Strategy**

**Static pages** (articles, policies):
```typescript
export const revalidate = 3600 // 1 hour
```

**Dynamic pages** (homepage):
```typescript
export const revalidate = 60 // 1 minute
```

**Task 13.6: Run Lighthouse**

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view
```

**Target scores**:
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

**Checkpoint**: ✅ Performance optimized, Lighthouse >90

**Save Point**: If stopping here, document:
- Lighthouse scores recorded
- Optimizations implemented
- Next: Bug fixes and polish

---

### **Day 15: Testing & Bug Fixes** ⏱️ 4-6 hours

**Task 15.1: Cross-Browser Testing**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Task 15.2: Responsive Testing**
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px)
- [ ] Large Desktop (1920px)

**Task 15.3: Fix Issues**
- [ ] Log and fix any bugs
- [ ] Test all links
- [ ] Test forms
- [ ] Test API routes

**Checkpoint**: ✅ Phase 3 Complete - Features & Optimization Done

**End of Week 3 Save Point**:
- ✅ Newsletter functional
- ✅ Analytics tracking
- ✅ Performance optimized
- ✅ Bugs fixed
- 📝 Next: Phase 4 - Launch Prep

---

# PHASE 4: Launch Preparation (Days 16-20)

## 🎯 Objectives
- Security audit
- Deployment setup
- Monitoring
- Documentation
- Launch!

## 📋 Tasks

### **Day 16: Security Audit** ⏱️ 4-6 hours

**Task 16.1: Environment Variables**

Check `.env.local` is NOT in git:
```bash
# Should be in .gitignore
.env.local
.env*.local
```

**Task 16.2: API Route Security**

Add rate limiting:
```bash
pnpm add @upstash/ratelimit @upstash/redis
```

**File: `lib/ratelimit.ts`**
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

Use in API routes:
```typescript
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // ... rest of handler
}
```

**Task 16.3: CORS Configuration**

**File: `middleware.ts`**
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // CORS headers
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}
```

**Task 16.4: Input Validation**

Add Zod for validation:
```bash
pnpm add zod
```

Example:
```typescript
import { z } from 'zod'

const newsletterSchema = z.object({
  email: z.string().email()
})

// In API route:
const result = newsletterSchema.safeParse(await request.json())
if (!result.success) {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
}
```

**Checkpoint**: ✅ Security hardened

---

### **Day 17: Deployment Setup** ⏱️ 4-6 hours

**Task 17.1: Choose Hosting**

**Recommended: Vercel** (easiest for Next.js)

**Setup:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

**Alternative: Railway, Netlify, AWS, etc.**

**Task 17.2: Configure Production Environment**

In Vercel Dashboard:
1. Go to Settings > Environment Variables
2. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Google Analytics ID
   - etc.

**Task 17.3: Set Up Custom Domain**

In Vercel:
1. Settings > Domains
2. Add domain: `worldpapers.com`
3. Follow DNS instructions
4. Wait for SSL certificate

**Task 17.4: Configure CI/CD**

**File: `.github/workflows/deploy.yml`**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

**Checkpoint**: ✅ Deployed to production

---

### **Day 18: Monitoring Setup** ⏱️ 4-6 hours

**Task 18.1: Uptime Monitoring**

Use **Better Uptime** or **Pingdom**:
1. Create account
2. Add website URL
3. Set alert email

**Task 18.2: Error Tracking**

Verify Sentry is working:
1. Trigger test error
2. Check Sentry dashboard
3. Set up alert rules

**Task 18.3: Performance Monitoring**

Set up **Vercel Analytics** (if not done):
- Real User Monitoring
- Web Vitals tracking

**Task 18.4: Database Monitoring**

Supabase Dashboard:
- Check query performance
- Set up connection alerts

**Checkpoint**: ✅ Full monitoring in place

---

### **Day 19: Documentation** ⏱️ 4-6 hours

**Task 19.1: Update README**

(See separate README update below)

**Task 19.2: Create Runbook**

**File: `docs/RUNBOOK.md`**
```markdown
# World Papers Operations Runbook

## Daily Tasks
- Check error logs in Sentry
- Review analytics dashboard
- Monitor uptime status

## Weekly Tasks
- Review performance metrics
- Update content
- Backup database

## Emergency Procedures
### Site Down
1. Check Vercel status
2. Check Supabase status
3. Review error logs
4. ...

### Database Issues
1. Check connection pool
2. Review slow queries
3. ...
```

**Task 19.3: Create Content Calendar**

Plan content updates, policy monitoring, etc.

**Checkpoint**: ✅ Documentation complete

---

### **Day 20: Launch!** ⏱️ 4-6 hours

**Task 20.1: Pre-Launch Checklist**

- [ ] All pages working
- [ ] All links tested
- [ ] Newsletter tested
- [ ] Analytics tracking
- [ ] Monitoring active
- [ ] SSL certificate valid
- [ ] Custom domain working
- [ ] Mobile responsive
- [ ] Lighthouse >90
- [ ] No console errors

**Task 20.2: Soft Launch**

1. Share with small group
2. Gather feedback
3. Fix critical issues

**Task 20.3: Full Launch**

1. Announce on social media
2. Email existing contacts
3. Submit to directories
4. Monitor closely

**Task 20.4: Post-Launch**

- [ ] Monitor error rates
- [ ] Check analytics
- [ ] Respond to feedback
- [ ] Plan next features

**Checkpoint**: ✅ 🎉 LAUNCHED! 🎉

---

## 📊 Project Tracking

### **Daily Status Template**

Copy this at end of each day:

```markdown
## Day X Progress - [Date]

**Completed:**
- [ ] Task 1
- [ ] Task 2

**In Progress:**
- [ ] Task 3

**Blockers:**
- Issue with X

**Next Session:**
- Start Task 4
- File to open: path/to/file.tsx
- Line: 123

**Notes:**
- Important decisions made
- Questions to research
```

---

## 🔧 Quick Reference Commands

```bash
# Start development
pnpm dev

# Build for production
pnpm build

# Run production locally
pnpm start

# Type check
pnpm typecheck

# Lint
pnpm lint

# Deploy to Vercel
vercel --prod

# Run seed script
npx tsx scripts/seed.ts

# Check database
psql [connection-string]

# Run Lighthouse
lighthouse http://localhost:3000
```

---

## 📁 File Structure Reference

```
world-papers-nextjs/
├── app/
│   ├── api/
│   │   ├── policies/route.ts
│   │   ├── articles/route.ts
│   │   ├── thoughts/route.ts
│   │   ├── videos/route.ts
│   │   └── newsletter/route.ts
│   ├── articles/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── policies/
│   │   └── page.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   └── StatusDot.tsx
│   ├── NewsletterForm.tsx
│   ├── SEO.tsx
│   └── StructuredData.tsx
├── lib/
│   ├── supabase.ts
│   ├── api.ts
│   ├── mockData.ts
│   └── ratelimit.ts
├── scripts/
│   └── seed.ts
├── docs/
│   ├── PRODUCTION-PLAN.md
│   ├── RUNBOOK.md
│   └── CONTENT-GUIDE.md
└── .env.local
```

---

## 🆘 Troubleshooting

### **Database Connection Issues**
```bash
# Check connection string
echo $NEXT_PUBLIC_SUPABASE_URL

# Test connection
curl $NEXT_PUBLIC_SUPABASE_URL/rest/v1/
```

### **Build Failures**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### **API Route Not Working**
```bash
# Check logs
vercel logs

# Test locally
curl http://localhost:3000/api/policies
```

---

## 📈 Success Metrics

**Week 1:**
- [ ] Database populated
- [ ] API routes working
- [ ] Homepage fetching real data

**Week 2:**
- [ ] All images optimized
- [ ] SEO implemented
- [ ] Sitemap generated

**Week 3:**
- [ ] Newsletter functional
- [ ] Analytics tracking
- [ ] Lighthouse >90

**Week 4:**
- [ ] Deployed to production
- [ ] Custom domain working
- [ ] Monitoring active
- [ ] LAUNCHED! 🚀

---

## 📞 Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

---

**Remember**: Stop at end of each day and document:
1. What you completed
2. Where you left off
3. What's next
4. Any blockers

This makes it easy to pick up tomorrow! 💪
