/**
 * OPML Import Script
 *
 * Parses OPML feed files from FreshRSS and imports them into Supabase
 *
 * Usage:
 *   npx tsx scripts/import-opml.ts path/to/file.opml
 */

import { readFileSync } from 'fs';
import { parseString } from 'xml2js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface OPMLOutline {
  $: {
    text: string;
    title?: string;
    type?: string;
    xmlUrl?: string;
    htmlUrl?: string;
  };
  outline?: OPMLOutline[];
}

interface OPMLData {
  opml: {
    head: any[];
    body: Array<{
      outline: OPMLOutline[];
    }>;
  };
}

interface ParsedFeed {
  category: string;
  name: string;
  feedUrl: string;
  siteUrl: string;
  type: string;
}

/**
 * Validate OPML structure
 */
function validateOPML(data: any): data is OPMLData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!data.opml || typeof data.opml !== 'object') {
    return false;
  }

  if (!data.opml.body || !Array.isArray(data.opml.body)) {
    return false;
  }

  if (data.opml.body.length === 0) {
    return false;
  }

  return true;
}

/**
 * Parse OPML XML to structured data
 */
function parseOPML(xmlContent: string): Promise<ParsedFeed[]> {
  return new Promise((resolve, reject) => {
    parseString(xmlContent, (err, result: any) => {
      if (err) {
        reject(new Error(`XML parsing failed: ${err.message}`));
        return;
      }

      // Validate OPML structure
      if (!validateOPML(result)) {
        reject(new Error('Invalid OPML structure: Missing required elements (opml.body)'));
        return;
      }

      const feeds: ParsedFeed[] = [];

      // Parse nested outline structure
      function parseOutline(outline: OPMLOutline, category: string = 'Uncategorized') {
        if (outline.$ && outline.$.xmlUrl) {
          // This is a feed
          feeds.push({
            category,
            name: outline.$.text || outline.$.title || 'Unnamed Feed',
            feedUrl: outline.$.xmlUrl,
            siteUrl: outline.$.htmlUrl || '',
            type: outline.$.type || 'rss'
          });
        } else if (outline.outline) {
          // This is a category containing feeds
          const categoryName = outline.$.text || outline.$.title || 'Uncategorized';
          outline.outline.forEach(childOutline => {
            parseOutline(childOutline, categoryName);
          });
        }
      }

      // Parse all top-level outlines
      if (result.opml && result.opml.body && result.opml.body[0]) {
        const topOutlines = result.opml.body[0].outline;
        if (topOutlines) {
          topOutlines.forEach(outline => parseOutline(outline));
        }
      }

      resolve(feeds);
    });
  });
}

/**
 * Import feeds into Supabase
 */
async function importFeeds(feeds: ParsedFeed[]) {
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase is not configured. Please set environment variables.');
    process.exit(1);
  }

  console.log(`📥 Importing ${feeds.length} feeds...`);

  // First, ensure categories exist
  const categories = Array.from(new Set(feeds.map(f => f.category)));
  console.log(`📁 Found ${categories.length} categories`);

  for (const categoryName of categories) {
    const slug = categoryName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { error } = await supabase
      .from('categories')
      .upsert({
        name: categoryName,
        slug,
        description: `RSS feeds in ${categoryName} category`
      }, {
        onConflict: 'slug'
      });

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      console.error(`   ❌ Error creating category ${categoryName}:`, error.message);
    } else {
      console.log(`   ✅ Category: ${categoryName}`);
    }
  }

  // Get category IDs
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id, slug, name');

  if (categoryError) {
    console.error('❌ Error fetching categories:', categoryError);
    return;
  }

  const categoryMap = new Map(
    categoryData?.map(c => [c.name, c.id]) || []
  );

  // Import feeds
  let successCount = 0;
  let errorCount = 0;

  for (const feed of feeds) {
    const category_id = categoryMap.get(feed.category);

    const { error } = await supabase
      .from('rss_feeds')
      .upsert({
        name: feed.name,
        feed_url: feed.feedUrl,
        site_url: feed.siteUrl,
        category_id,
        is_active: true,
        display_in_feed: true
      }, {
        onConflict: 'feed_url'
      });

    if (error && error.code !== '23505') {
      console.error(`   ❌ ${feed.name}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ ${feed.name}`);
      successCount++;
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   - Success: ${successCount}`);
  console.log(`   - Errors: ${errorCount}`);
  console.log(`   - Total: ${feeds.length}`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Usage: npx tsx scripts/import-opml.ts <path-to-opml-file>');
    console.error('Example: npx tsx scripts/import-opml.ts ~/Downloads/feeds.opml');
    process.exit(1);
  }

  const filePath = args[0];

  console.log(`📖 Reading OPML file: ${filePath}`);

  try {
    const xmlContent = readFileSync(filePath, 'utf-8');
    console.log(`✅ File loaded successfully`);

    console.log(`⚙️  Parsing OPML...`);
    const feeds = await parseOPML(xmlContent);
    console.log(`✅ Parsed ${feeds.length} feeds`);

    // Group by category for preview
    const byCategory = feeds.reduce((acc, feed) => {
      if (!acc[feed.category]) {
        acc[feed.category] = [];
      }
      acc[feed.category].push(feed);
      return acc;
    }, {} as Record<string, ParsedFeed[]>);

    console.log(`\n📊 Feed Summary:`);
    Object.entries(byCategory).forEach(([category, feedList]) => {
      console.log(`   ${category}: ${feedList.length} feeds`);
    });

    console.log(`\n🚀 Starting import...`);
    await importFeeds(feeds);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { parseOPML, importFeeds };
