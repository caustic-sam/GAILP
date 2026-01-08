/**
 * Diagnose Missing Content Issue
 *
 * Checks database connectivity and content availability
 */

import { supabaseAdmin, isSupabaseConfigured } from '../lib/supabase.js';

async function diagnoseContent() {
  console.log('\n🔍 DIAGNOSING CONTENT ISSUE\n');
  console.log('='.repeat(60));

  // Check 1: Supabase Configuration
  console.log('\n1️⃣ Checking Supabase Configuration...');
  const isConfigured = isSupabaseConfigured();
  console.log(`   Configured: ${isConfigured ? '✅ YES' : '❌ NO'}`);

  if (!isConfigured) {
    console.log('   ⚠️ Supabase is NOT configured - app will use mock data');
    console.log('   Missing environment variables!');
    return;
  }

  // Check 2: Database Connection
  console.log('\n2️⃣ Testing Database Connection...');
  try {
    const { error: connectionError } = await supabaseAdmin
      .from('articles')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.log('   ❌ Connection failed:', connectionError.message);
      return;
    }
    console.log('   ✅ Database connection successful');
  } catch (error) {
    console.log('   ❌ Connection error:', error);
    return;
  }

  // Check 3: Articles Count
  console.log('\n3️⃣ Checking Articles Table...');
  const { data: articles, error: articlesError, count } = await supabaseAdmin
    .from('articles')
    .select('*', { count: 'exact' });

  if (articlesError) {
    console.log('   ❌ Error querying articles:', articlesError.message);
    return;
  }

  console.log(`   Total articles in database: ${count || 0}`);

  if (!articles || articles.length === 0) {
    console.log('   ⚠️ NO ARTICLES FOUND IN DATABASE');
    console.log('   This explains why the admin dashboard is empty!');
    console.log('\n💡 Possible reasons:');
    console.log('   - Articles were never imported from WordPress');
    console.log('   - Database was recently reset');
    console.log('   - Using wrong Supabase project');
    return;
  }

  // Check 4: Sample Articles
  console.log('\n4️⃣ Sample Articles (first 5):');
  articles.slice(0, 5).forEach((article, idx) => {
    console.log(`\n   ${idx + 1}. ${article.title}`);
    console.log(`      ID: ${article.id}`);
    console.log(`      Slug: ${article.slug}`);
    console.log(`      Status: ${article.status}`);
    console.log(`      Author ID: ${article.author_id || 'NULL'}`);
    console.log(`      Created: ${article.created_at}`);
  });

  // Check 5: Articles by Status
  console.log('\n5️⃣ Articles Breakdown by Status:');
  const statuses = ['draft', 'published', 'scheduled', 'archived'];
  for (const status of statuses) {
    const { count: statusCount } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    console.log(`   ${status}: ${statusCount || 0}`);
  }

  // Check 6: User Profiles
  console.log('\n6️⃣ Checking User Profiles...');
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('user_profiles')
    .select('id, role, created_at');

  if (profilesError) {
    console.log('   ❌ Error querying profiles:', profilesError.message);
  } else {
    console.log(`   Total users: ${profiles?.length || 0}`);
    if (profiles && profiles.length > 0) {
      console.log('\n   Users:');
      profiles.forEach(profile => {
        console.log(`   - ID: ${profile.id}, Role: ${profile.role}`);
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n');
}

diagnoseContent().catch(console.error);
