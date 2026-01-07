// Quick script to fetch product fields from Supabase
import { createClient } from '@/utils/supabase/server';

async function getProductFields() {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .limit(1)
    .single();
  
  if (product) {
    console.log('Available fields:', Object.keys(product));
    console.log('\nSample product:', JSON.stringify(product, null, 2));
  }
}

getProductFields();
