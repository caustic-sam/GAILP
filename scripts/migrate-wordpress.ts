#!/usr/bin/env ts-node
/**
 * WordPress XML Export to Supabase Migration Script
 *
 * Migrates posts from WordPress.2025-11-02.xml to Supabase articles table
 * All posts imported as DRAFTS for review and proper categorization
 *
 * Usage:
 *   pnpm tsx scripts/migrate-wordpress.ts [--dry-run] [--limit=N]
 *
 * Options:
 *   --dry-run    Preview what would be migrated without writing to database
 *   --limit=N    Only migrate first N posts (for testing)
 */

import { readFileSync } from 'fs';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { createClient } from '@supabase/supabase-js';
import TurndownService from 'turndown';

const parseXML = promisify(parseString);

// Configuration
const XML_FILE_PATH = './WordPress.2025-11-02.xml';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const MIGRATION_AUTHOR_EMAIL = 'malsicario@malsicario.com';

// Parse command line args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});

interface WordPressPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  categories: string[];
  featuredImageUrl: string | null;
  wordpressId: number;
  createdAt: Date;
  updatedAt: Date;
  originalPublishedAt: Date | null;
}

/**
 * Parse WordPress XML export file
 */
async function parseWordPressXML(filePath: string): Promise<any> {
  console.log(`\n📖 Reading WordPress export file: ${filePath}`);
  const xmlContent = readFileSync(filePath, 'utf-8');
  const result = await parseXML(xmlContent);
  return result;
}

/**
 * Extract posts from parsed XML
 */
function extractPosts(xmlData: any): WordPressPost[] {
  const channel = xmlData.rss.channel[0];
  const items = channel.item || [];

  const posts: WordPressPost[] = [];

  for (const item of items) {
    // Only process posts (not pages, attachments, etc.)
    const postType = item['wp:post_type']?.[0];
    if (postType !== 'post') continue;

    // Extract basic fields
    const title = item.title?.[0] || 'Untitled';
    const wpPostName = item['wp:post_name']?.[0] || '';
    const slug = wpPostName || slugify(title);
    const contentEncoded = item['content:encoded']?.[0] || '';
    const excerpt = item['excerpt:encoded']?.[0] || '';

    // Convert HTML to Markdown (keep images!)
    const content = turndownService.turndown(contentEncoded);

    // Extract dates - preserve original dates
    const wpPostDate = item['wp:post_date']?.[0];
    const wpPostModified = item['wp:post_modified']?.[0];
    const pubDate = item.pubDate?.[0];

    const createdAt = wpPostDate ? new Date(wpPostDate) : new Date();
    const updatedAt = wpPostModified ? new Date(wpPostModified) : createdAt;
    const originalPublishedAt = pubDate ? new Date(pubDate) : null;

    // Extract categories (for reference, will need proper taxonomy later)
    const categories: string[] = [];

    if (item.category) {
      for (const cat of item.category) {
        const domain = cat.$.domain;
        const value = cat._ || cat;

        if (domain === 'category') {
          categories.push(value);
        }
      }
    }

    // Extract featured image URL from postmeta
    const featuredImageUrl = extractFeaturedImage(item);

    // Extract WordPress ID
    const wordpressId = parseInt(item['wp:post_id']?.[0] || '0');

    posts.push({
      title,
      slug,
      content,
      excerpt,
      categories,
      featuredImageUrl,
      wordpressId,
      createdAt,
      updatedAt,
      originalPublishedAt,
    });
  }

  return posts;
}

/**
 * Extract featured image URL from post meta or content
 */
function extractFeaturedImage(item: any): string | null {
  const postmeta = item['wp:postmeta'] || [];

  // Look for _thumbnail_id in postmeta
  for (const meta of postmeta) {
    const metaKey = meta['wp:meta_key']?.[0];

    // For now, we'll extract images from content directly
    // Featured image handling can be enhanced later
    if (metaKey === '_thumbnail_id') {
      // Would need to cross-reference with attachments
      return null;
    }
  }

  // Try to extract first image from content as fallback
  const contentEncoded = item['content:encoded']?.[0] || '';
  const imgMatch = contentEncoded.match(/<img[^>]+src="([^">]+)"/);

  return imgMatch ? imgMatch[1] : null;
}

/**
 * Create URL-safe slug from title
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Ensure unique slug by appending number if needed
 */
async function ensureUniqueSlug(supabase: any, baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data, error } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      // Slug is available
      return slug;
    }

    // Slug exists, try next variant
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Map old categories to new taxonomy
 * We'll create a sensible structure later
 */
function mapCategory(oldCategories: string[]): string {
  // For now, preserve first category or default to "Imported"
  // TODO: Create proper taxonomy mapping
  if (oldCategories.length === 0) {
    return 'Imported';
  }

  const category = oldCategories[0];

  // Basic cleanup
  if (category.toLowerCase() === 'uncategorized') {
    return 'Imported';
  }

  return category;
}

/**
 * Migrate posts to Supabase
 */
async function migratePosts(posts: WordPressPost[], dryRun: boolean = false) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log(`\n🚀 Starting migration of ${posts.length} posts...`);
  console.log(`📧 All posts will be assigned to: ${MIGRATION_AUTHOR_EMAIL}`);
  console.log(`📝 All posts will be imported as: DRAFT`);

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No data will be written\n');
  }

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ post: string; error: string }> = [];

  for (const post of posts) {
    try {
      console.log(`\n📝 Processing: "${post.title}"`);
      console.log(`   WordPress ID: ${post.wordpressId}`);
      console.log(`   Original Category: ${post.categories.join(', ') || 'None'}`);
      console.log(`   Created: ${post.createdAt.toISOString().split('T')[0]}`);
      if (post.featuredImageUrl) {
        console.log(`   Featured Image: ${post.featuredImageUrl}`);
      }

      if (dryRun) {
        console.log('   ✓ Would migrate (dry run)');
        successCount++;
        continue;
      }

      // Ensure unique slug
      const uniqueSlug = await ensureUniqueSlug(supabase, post.slug);
      if (uniqueSlug !== post.slug) {
        console.log(`   ℹ️  Slug changed to: ${uniqueSlug}`);
      }

      // Map category
      const mappedCategory = mapCategory(post.categories);

      // Insert article as DRAFT
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: post.title,
          slug: uniqueSlug,
          content: post.content,
          excerpt: post.excerpt || post.content.substring(0, 160),
          status: 'draft', // All imported as drafts
          published_at: null, // Will be set when manually published
          category: mappedCategory,
          tags: [], // No tags - will be added manually
          featured_image_url: post.featuredImageUrl,
          wordpress_id: post.wordpressId,
          imported_from: 'wordpress',
          created_at: post.createdAt,
          updated_at: post.updatedAt,
        });

      if (error) {
        console.error(`   ✗ Error: ${error.message}`);
        errors.push({ post: post.title, error: error.message });
        errorCount++;
      } else {
        console.log('   ✓ Migrated successfully as DRAFT');
        successCount++;
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`   ✗ Exception: ${errorMsg}`);
      errors.push({ post: post.title, error: errorMsg });
      errorCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Successfully migrated: ${successCount}`);
  console.log(`✗ Failed: ${errorCount}`);
  console.log(`📊 Total processed: ${posts.length}`);

  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    errors.forEach(({ post, error }) => {
      console.log(`  - ${post}: ${error}`);
    });
  }

  console.log('\n📝 Next Steps:');
  console.log('  1. Review imported drafts in admin panel');
  console.log('  2. Assign proper categories based on new taxonomy');
  console.log('  3. Add relevant tags');
  console.log('  4. Update featured images if needed');
  console.log('  5. Publish articles when ready');

  console.log('\n✅ Migration complete!\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🌍 WordPress to Supabase Migration Tool');
  console.log('=' .repeat(60));

  if (isDryRun) {
    console.log('🔍 Running in DRY RUN mode');
  }

  if (limit) {
    console.log(`📊 Limiting to first ${limit} posts`);
  }

  try {
    // Parse XML
    const xmlData = await parseWordPressXML(XML_FILE_PATH);

    // Extract posts
    let posts = extractPosts(xmlData);
    console.log(`\n✓ Found ${posts.length} posts in export`);

    // Apply limit if specified
    if (limit) {
      posts = posts.slice(0, limit);
      console.log(`  Limited to ${posts.length} posts`);
    }

    // Show preview
    console.log('\n📋 Original Category Breakdown:');
    const categoryCounts = posts.reduce((acc, post) => {
      const category = post.categories[0] || 'None';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

    // Migrate
    await migratePosts(posts, isDryRun);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { parseWordPressXML, extractPosts, migratePosts };
