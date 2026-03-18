// Database connectivity diagnostic helper
import { supabase } from './supabase';

export const runDiagnostics = async () => {
  console.log('🔍 Running Synclexia diagnostics...');

  try {
    // Test 1: Basic connectivity
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (healthError) {
      console.error('❌ Database connectivity failed:', healthError);
      return false;
    }

    console.log('✅ Database connectivity: OK');

    // Test 2: Auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Auth session error:', sessionError);
      return false;
    }

    if (session) {
      console.log('✅ Auth session: OK');

      // Test 3: Profile fetch
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch failed:', profileError);
        return false;
      }

      console.log('✅ Profile fetch: OK');
      console.log('✅ All diagnostics passed!');
      return true;
    } else {
      console.log('ℹ️ No active session (user not logged in)');
      return true;
    }

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    return false;
  }
};

export const fixCommonIssues = async () => {
  console.log('🔧 Attempting to fix common issues...');

  try {
    // Clear any stale auth data
    await supabase.auth.signOut({ scope: 'local' });
    console.log('✅ Cleared stale auth data');

    // Test connectivity again
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Still having connectivity issues:', error);
      return false;
    }

    console.log('✅ Issues resolved!');
    return true;

  } catch (error) {
    console.error('❌ Fix attempt failed:', error);
    return false;
  }
};