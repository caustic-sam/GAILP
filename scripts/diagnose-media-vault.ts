/**
 * Media Vault Diagnostic Script
 *
 * This script helps diagnose issues with the media vault not displaying files.
 * Run with: npx tsx scripts/diagnose-media-vault.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('\n🔍 MEDIA VAULT DIAGNOSTIC\n');
console.log('=' .repeat(60));

// Check environment variables
console.log('\n1. Environment Variables:');
console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Cannot proceed without Supabase credentials\n');
  process.exit(1);
}

async function diagnose() {
  // Test with anon key (what the client uses)
  console.log('\n2. Testing with Anon Key (Client Perspective):');
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data: anonFiles, error: anonError } = await anonClient
      .storage
      .from('media')
      .list('', { limit: 100 });

    if (anonError) {
      console.log('   ❌ Error:', anonError.message);
      console.log('   Details:', JSON.stringify(anonError, null, 2));
    } else {
      console.log('   ✅ Success! Found', anonFiles?.length || 0, 'files');
      if (anonFiles && anonFiles.length > 0) {
        console.log('   First file:', anonFiles[0].name);
      }
    }
  } catch (err) {
    console.log('   ❌ Exception:', err);
  }

  // Test with service role key (admin perspective)
  if (supabaseServiceKey) {
    console.log('\n3. Testing with Service Role Key (Admin Perspective):');
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    try {
      const { data: adminFiles, error: adminError } = await adminClient
        .storage
        .from('media')
        .list('', { limit: 100 });

      if (adminError) {
        console.log('   ❌ Error:', adminError.message);
        console.log('   Details:', JSON.stringify(adminError, null, 2));
      } else {
        console.log('   ✅ Success! Found', adminFiles?.length || 0, 'files');
        if (adminFiles && adminFiles.length > 0) {
          console.log('   First 5 files:');
          adminFiles.slice(0, 5).forEach((file, idx) => {
            console.log(`     ${idx + 1}. ${file.name} (${file.metadata?.size || 0} bytes)`);
          });
        }
      }
    } catch (err) {
      console.log('   ❌ Exception:', err);
    }
  }

  // Check bucket configuration
  console.log('\n4. Checking Bucket Configuration:');
  const adminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

  try {
    const { data: buckets, error: bucketsError } = await adminClient
      .storage
      .listBuckets();

    if (bucketsError) {
      console.log('   ❌ Error listing buckets:', bucketsError.message);
    } else {
      const mediaBucket = buckets?.find(b => b.name === 'media');
      if (mediaBucket) {
        console.log('   ✅ Media bucket exists');
        console.log('   Public:', mediaBucket.public ? '✅ Yes' : '❌ No (this is likely the problem!)');
        console.log('   ID:', mediaBucket.id);
        console.log('   Created:', mediaBucket.created_at);
      } else {
        console.log('   ❌ Media bucket NOT FOUND');
        console.log('   Available buckets:', buckets?.map(b => b.name).join(', '));
      }
    }
  } catch (err) {
    console.log('   ❌ Exception:', err);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 DIAGNOSIS COMPLETE\n');
  console.log('Common issues:');
  console.log('  1. Bucket is private instead of public');
  console.log('  2. RLS policy blocks anonymous reads');
  console.log('  3. Files uploaded to subdirectory instead of root');
  console.log('  4. CORS configuration blocking requests\n');
  console.log('Solution: Check Supabase dashboard > Storage > media bucket settings\n');
}

diagnose().catch(console.error);
