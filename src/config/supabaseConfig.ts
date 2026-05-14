export const SUPABASE_URL = 'SUPABASE_URL';
export const SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY';

export const hasSupabaseConfig =
  !SUPABASE_URL.startsWith('SUPABASE_') &&
  !SUPABASE_ANON_KEY.startsWith('SUPABASE_');
