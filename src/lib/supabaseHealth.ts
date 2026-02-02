import { supabase } from './supabaseClient';

export async function pingSupabase() {
  try {
    const { error } = await supabase.from('lembretes').select('id').limit(1);
    if (error) {
      console.error('🚨 Supabase ping failed:', error);
      return { ok: false, error };
    }
    console.log('✅ Supabase ping ok');
    return { ok: true };
  } catch (err) {
    console.error('🚨 Supabase ping exception:', err);
    return { ok: false, error: err } as any;
  }
}
