
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

// FIX: Removed checks for placeholder Supabase credentials. These were causing
// TypeScript errors as the constants are now correctly defined with actual values,
// not placeholders.

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
