import { createClient } from '@supabase/supabase-js';

// The publishable key is designed to be included in browser applications. Database
// row-level security in supabase/schema.sql protects each user's financial data.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ewyzygxihuehsaiuwtkp.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_1HBNPOIHxSr7ISG0K_yOsQ_aKUt764B';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
