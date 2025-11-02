#!/usr/bin/env ts-node
/**
 * Verify WordPress Migration
 * Quick check to confirm all posts were migrated successfully
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

async function verifyMigration() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log('🔍 Verifying WordPress Migration...\n');

  // Get total count
  const { count, error: countError } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error:', countError.message);
    return;
  }

  console.log(`✓ Total articles in database: ${count}`);

  // Get WordPress imported articles
  const { data: wpArticles, error: wpError } = await supabase
    .from('articles')
    .select('id, title, wordpress_id, status, created_at, category, featured_image_url')
    .eq('imported_from', 'wordpress')
    .order('created_at', { ascending: false });

  if (wpError) {
    console.error('❌ Error:', wpError.message);
    return;
  }

  console.log(`✓ WordPress imported articles: ${wpArticles?.length || 0}\n`);

  // Show status breakdown
  const statusCounts = wpArticles?.reduce((acc, article) => {
    acc[article.status] = (acc[article.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  console.log('📊 Status Breakdown:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`);
  });

  // Show category breakdown
  const categoryCounts = wpArticles?.reduce((acc, article) => {
    const cat = article.category || 'None';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  console.log('\n📂 Category Breakdown:');
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`   ${category}: ${count}`);
  });

  // Show articles with featured images
  const withImages = wpArticles?.filter(a => a.featured_image_url).length || 0;
  console.log(`\n🖼️  Articles with featured images: ${withImages}`);

  // Show sample of recent articles
  console.log('\n📝 Sample of Migrated Articles (5 most recent):');
  wpArticles?.slice(0, 5).forEach((article, i) => {
    console.log(`\n${i + 1}. ${article.title}`);
    console.log(`   WordPress ID: ${article.wordpress_id}`);
    console.log(`   Status: ${article.status}`);
    console.log(`   Category: ${article.category}`);
    console.log(`   Created: ${new Date(article.created_at).toISOString().split('T')[0]}`);
    if (article.featured_image_url) {
      console.log(`   Image: ${article.featured_image_url}`);
    }
  });

  console.log('\n✅ Migration verification complete!');
  console.log('\n📍 Next: View articles in admin panel at /admin/articles');
}

verifyMigration().catch(console.error);
