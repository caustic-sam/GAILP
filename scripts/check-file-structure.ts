/**
 * Check actual file structure returned by Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const client = createClient(supabaseUrl, supabaseAnonKey);

async function checkStructure() {
  console.log('\n🔍 Checking file structure...\n');

  const { data, error } = await client
    .storage
    .from('media')
    .list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('Total items:', data?.length || 0);
  console.log('\nFull structure of first item:');
  console.log(JSON.stringify(data?.[0], null, 2));

  console.log('\nAll files:');
  data?.forEach((file, idx) => {
    console.log(`\n${idx + 1}. ${file.name}`);
    console.log('   ID:', file.id);
    console.log('   Metadata:', JSON.stringify(file.metadata, null, 2));
    console.log('   Created:', file.created_at);
    console.log('   Updated:', file.updated_at);
  });
}

checkStructure().catch(console.error);
