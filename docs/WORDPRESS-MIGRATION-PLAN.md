# WordPress Migration Plan

## Overview

This document outlines the migration strategy for porting WordPress content from a `.wpress` export file into the World Papers Next.js/Supabase application, with particular focus on preserving draft posts and filtering non-content files.

## Current State Analysis

### Source: WordPress (.wpress)
- **Format**: `.wpress` is a proprietary format created by All-in-One WP Migration plugin
- **Contents**:
  - Database dump (posts, pages, drafts, comments, metadata)
  - Uploaded media files (images, PDFs, etc.)
  - Theme files
  - Plugin files
  - wp-content directory
- **Characteristics**: Single compressed archive containing complete WordPress site

### Target: World Papers Application
- **Database**: Supabase PostgreSQL
- **Framework**: Next.js 14 with App Router
- **Content API**: Located in `lib/api.ts`
- **Current Tables** (inferred from mock data):
  - `articles` - Blog posts/articles
  - `policies` - Policy documents
  - `videos` - Video content
  - `thoughts` - Quick thoughts/updates

## Migration Strategy

### Phase 1: Extraction & Analysis

#### 1.1 Unpack .wpress File
```bash
# .wpress is typically a ZIP archive
unzip worldpapers.wpress -d ./wordpress-export
```

#### 1.2 Extract Database
- Locate `database.sql` within extracted files
- Parse SQL dump to identify content tables:
  - `wp_posts` (posts, pages, drafts)
  - `wp_postmeta` (custom fields, metadata)
  - `wp_terms` (categories, tags)
  - `wp_term_relationships` (post-category associations)

#### 1.3 Identify Content to Migrate
**Include:**
- Posts with status: `publish`, `draft`, `pending`
- Post metadata (author, dates, categories, featured images)
- Post content (HTML/Markdown)
- Categories and tags
- SEO metadata (if using Yoast/RankMath)

**Exclude:**
- Theme files (`wp-content/themes/`)
- Plugin files (`wp-content/plugins/`)
- Core WordPress files
- Cache files
- Backup files
- Uploaded files not referenced in posts (orphaned media)

### Phase 2: Database Schema Mapping

#### 2.1 Create Supabase Tables

```sql
-- Articles table (primary content)
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')),
  category TEXT,
  tags TEXT[],
  featured_image_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  wordpress_id INTEGER UNIQUE, -- Original WP post ID for reference
  read_time INTEGER -- Calculated reading time in minutes
);

-- Policies table (if migrating policy-related posts)
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT,
  status TEXT CHECK (status IN ('draft', 'adopted', 'in_force', 'repealed')),
  jurisdiction TEXT,
  category TEXT,
  tags TEXT[],
  effective_date DATE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  wordpress_id INTEGER UNIQUE
);

-- Media table (referenced images, PDFs)
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  alt_text TEXT,
  caption TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  wordpress_id INTEGER UNIQUE
);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Public read access (adjust as needed)
CREATE POLICY "Articles are viewable by everyone"
  ON articles FOR SELECT
  USING (status = 'published' OR status = 'draft');

CREATE POLICY "Policies are viewable by everyone"
  ON policies FOR SELECT
  USING (true);

CREATE POLICY "Media is viewable by everyone"
  ON media FOR SELECT
  USING (true);
```

#### 2.2 WordPress to Supabase Mapping

| WordPress Field | Supabase Field | Transformation |
|----------------|----------------|----------------|
| `wp_posts.ID` | `wordpress_id` | Direct copy for reference |
| `wp_posts.post_title` | `title` | Direct copy |
| `wp_posts.post_name` | `slug` | Direct copy, ensure uniqueness |
| `wp_posts.post_content` | `content` | HTML cleanup, convert shortcodes |
| `wp_posts.post_excerpt` | `excerpt` | Direct copy or auto-generate |
| `wp_posts.post_author` | `author` | Map to author name from `wp_users` |
| `wp_posts.post_status` | `status` | Map: publish→published, draft→draft |
| `wp_posts.post_date` | `published_at` | Convert datetime format |
| `wp_postmeta._thumbnail_id` | `featured_image_url` | Resolve media URL from wp_posts |
| `wp_terms` (category) | `category` | First category or primary |
| `wp_terms` (post_tag) | `tags` | Array of tag names |

### Phase 3: Content Processing

#### 3.1 Create Migration Script

```typescript
// scripts/migrate-wordpress.ts

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import { JSDOM } from 'jsdom';

interface WordPressPost {
  ID: number;
  post_title: string;
  post_name: string;
  post_content: string;
  post_excerpt: string;
  post_status: string;
  post_author: number;
  post_date: string;
  post_modified: string;
  post_type: string;
}

interface MigrationConfig {
  databasePath: string;
  mediaBasePath: string;
  supabaseUrl: string;
  supabaseKey: string;
  preserveDrafts: boolean;
}

class WordPressMigrator {
  private supabase: ReturnType<typeof createClient>;
  private config: MigrationConfig;

  constructor(config: MigrationConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  async migrate() {
    console.log('🚀 Starting WordPress migration...');

    // Step 1: Parse SQL dump
    const posts = await this.extractPosts();
    console.log(`📝 Found ${posts.length} posts to migrate`);

    // Step 2: Filter content
    const filteredPosts = this.filterPosts(posts);
    console.log(`✅ ${filteredPosts.length} posts after filtering`);

    // Step 3: Process each post
    let migrated = 0;
    let failed = 0;

    for (const post of filteredPosts) {
      try {
        await this.migratePost(post);
        migrated++;
        console.log(`✓ Migrated: ${post.post_title}`);
      } catch (error) {
        failed++;
        console.error(`✗ Failed: ${post.post_title}`, error);
      }
    }

    console.log(`\n📊 Migration complete: ${migrated} succeeded, ${failed} failed`);
  }

  private async extractPosts(): Promise<WordPressPost[]> {
    // Parse database.sql and extract wp_posts
    const sqlContent = fs.readFileSync(this.config.databasePath, 'utf8');

    // Simple regex extraction (consider using proper SQL parser for production)
    const posts: WordPressPost[] = [];

    // Extract INSERT statements for wp_posts
    const insertRegex = /INSERT INTO `wp_posts` VALUES \((.*?)\);/gs;
    const matches = sqlContent.matchAll(insertRegex);

    for (const match of matches) {
      // Parse values (this is simplified - use proper CSV/SQL parser)
      // posts.push(parsedPost);
    }

    return posts;
  }

  private filterPosts(posts: WordPressPost[]): WordPressPost[] {
    return posts.filter(post => {
      // Include published posts
      if (post.post_status === 'publish') return true;

      // Include drafts if preserveDrafts is true
      if (this.config.preserveDrafts &&
          (post.post_status === 'draft' || post.post_status === 'pending')) {
        return true;
      }

      // Exclude revisions, auto-drafts, trash
      if (['revision', 'auto-draft', 'trash', 'inherit'].includes(post.post_status)) {
        return false;
      }

      // Only include post type 'post' (exclude pages, attachments, etc.)
      return post.post_type === 'post';
    });
  }

  private async migratePost(post: WordPressPost): Promise<void> {
    // Clean content
    const cleanedContent = this.cleanContent(post.post_content);

    // Calculate read time
    const readTime = this.calculateReadTime(cleanedContent);

    // Extract metadata
    const category = await this.getPostCategory(post.ID);
    const tags = await this.getPostTags(post.ID);
    const featuredImage = await this.getPostFeaturedImage(post.ID);
    const author = await this.getPostAuthor(post.post_author);

    // Insert into Supabase
    const { error } = await this.supabase.from('articles').insert({
      title: post.post_title,
      slug: post.post_name || this.generateSlug(post.post_title),
      content: cleanedContent,
      excerpt: post.post_excerpt || this.generateExcerpt(cleanedContent),
      author: author,
      status: post.post_status === 'publish' ? 'published' : 'draft',
      category: category,
      tags: tags,
      featured_image_url: featuredImage,
      published_at: new Date(post.post_date),
      wordpress_id: post.ID,
      read_time: readTime,
    });

    if (error) throw error;
  }

  private cleanContent(html: string): string {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove WordPress-specific shortcodes
    html = html.replace(/\[([^\]]+)\]/g, '');

    // Convert relative URLs to absolute (if needed)
    // Clean up inline styles
    // Remove empty paragraphs

    return html;
  }

  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private generateExcerpt(content: string, length = 160): string {
    const text = content.replace(/<[^>]*>/g, '');
    return text.substring(0, length) + (text.length > length ? '...' : '');
  }

  private async getPostCategory(postId: number): Promise<string> {
    // Query wp_term_relationships and wp_terms for category
    return 'Uncategorized';
  }

  private async getPostTags(postId: number): Promise<string[]> {
    // Query wp_term_relationships and wp_terms for tags
    return [];
  }

  private async getPostFeaturedImage(postId: number): Promise<string | null> {
    // Query wp_postmeta for _thumbnail_id
    // Query wp_posts for attachment URL
    return null;
  }

  private async getPostAuthor(authorId: number): Promise<string> {
    // Query wp_users for author name
    return 'Unknown Author';
  }
}

// Usage
const migrator = new WordPressMigrator({
  databasePath: './wordpress-export/database.sql',
  mediaBasePath: './wordpress-export/wp-content/uploads',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY!,
  preserveDrafts: true,
});

migrator.migrate();
```

### Phase 4: Media Migration

#### 4.1 Upload Strategy
- Filter media: Only upload files referenced in migrated posts
- Use Supabase Storage bucket: `world-papers-media`
- Maintain original directory structure for SEO (optional)
- Update image URLs in post content to Supabase Storage URLs

#### 4.2 Media Processing Script

```typescript
async function migrateMedia(wordpressId: number, originalUrl: string): Promise<string> {
  const filename = path.basename(originalUrl);
  const localPath = path.join(config.mediaBasePath, filename);

  if (!fs.existsSync(localPath)) {
    console.warn(`Media file not found: ${filename}`);
    return originalUrl; // Keep original URL as fallback
  }

  // Upload to Supabase Storage
  const fileBuffer = fs.readFileSync(localPath);
  const { data, error } = await supabase.storage
    .from('world-papers-media')
    .upload(`articles/${filename}`, fileBuffer, {
      contentType: mime.lookup(filename) || 'application/octet-stream',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('world-papers-media')
    .getPublicUrl(`articles/${filename}`);

  return publicUrl;
}
```

### Phase 5: Validation & Testing

#### 5.1 Pre-Migration Checklist
- [ ] Backup Supabase database
- [ ] Verify .wpress file integrity
- [ ] Test migration script on sample data (5-10 posts)
- [ ] Review content filtering rules
- [ ] Confirm Supabase storage bucket exists

#### 5.2 Post-Migration Validation
- [ ] Verify post count matches expected
- [ ] Check draft posts are preserved
- [ ] Validate featured images display correctly
- [ ] Test internal links (wp-content URLs updated)
- [ ] Verify categories and tags migrated
- [ ] Check special characters in titles/content
- [ ] Test pagination on articles page
- [ ] Review SEO metadata

#### 5.3 Rollback Plan
```sql
-- If migration fails, rollback:
DELETE FROM articles WHERE wordpress_id IS NOT NULL;
DELETE FROM policies WHERE wordpress_id IS NOT NULL;
DELETE FROM media WHERE wordpress_id IS NOT NULL;
```

## File Size Optimization

### Identifying Non-Content Files
```bash
# List large files in .wpress export
find wordpress-export -type f -size +5M | sort -h

# Typical excludes:
# - wp-content/plugins/*
# - wp-content/themes/* (except active theme screenshots)
# - wp-content/cache/*
# - wp-content/backups/*
# - .htaccess, wp-config.php (not needed)
```

### Space Estimate
- **Typical .wpress size**: 100MB - 2GB
- **Actual content size**: ~5-20% (posts + referenced media)
- **Our migration**: Keep only posts table + referenced uploads

## Dependencies

### Required Packages
```json
{
  "devDependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "mysql2": "^3.6.5",
    "jsdom": "^23.0.1",
    "mime-types": "^2.1.35",
    "turndown": "^7.1.2"
  }
}
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key

# For migration script
WORDPRESS_DB_PATH=./wordpress-export/database.sql
WORDPRESS_MEDIA_PATH=./wordpress-export/wp-content/uploads
```

## Timeline Estimate

| Phase | Duration | Notes |
|-------|----------|-------|
| Extraction & Analysis | 2-4 hours | Depends on .wpress size |
| Schema Creation | 1 hour | Supabase tables + RLS |
| Script Development | 4-6 hours | Includes testing |
| Media Migration | 2-3 hours | Depends on media count |
| Validation & Cleanup | 2-3 hours | QA and fixes |
| **Total** | **11-17 hours** | Across 2-3 sessions |

## Risk Assessment

### High Risk
- **HTML/Shortcode Cleanup**: WordPress content may contain plugin-specific shortcodes
  - Mitigation: Manual review of top 20 posts, build shortcode converter map

### Medium Risk
- **Media File Size**: Large media library could slow migration
  - Mitigation: Migrate media in batches, use Supabase CDN

### Low Risk
- **Encoding Issues**: Special characters in titles/content
  - Mitigation: Use UTF-8 throughout, test with sample posts

## Success Criteria

- [ ] All published posts migrated successfully
- [ ] All draft posts preserved with correct status
- [ ] Featured images display correctly
- [ ] Categories and tags mapped accurately
- [ ] No broken internal links
- [ ] SEO metadata (titles, descriptions) preserved
- [ ] Read time calculated for all articles
- [ ] Media files < 100MB total (optimized)
- [ ] Migration script reusable for future imports

## Next Steps

1. **Immediate**: Extract .wpress file, analyze database structure
2. **This Session**: Create Supabase tables and initial migration script
3. **Next Session**: Run test migration, validate results, iterate
4. **Final Session**: Full migration, media upload, validation, go live

---

**Document Version**: 1.0
**Last Updated**: 2025-10-31
**Owner**: World Papers Team
