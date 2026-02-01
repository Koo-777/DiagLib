
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  // Only throw in browser/runtime, not during build if possible, 
  // but better to fail early if config is missing.
  // console.warn('Supabase URL or Key is missing!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
