// seeders/migrate_parent_rpc.js
// ─────────────────────────────────────────────────────────────
// Creates the SECURITY DEFINER RPC functions needed for
// parent child-linking to work despite RLS on profiles table.
//
// Run with:  node seeders/migrate_parent_rpc.js
//
// Requires ONE extra env variable in your .env:
//   SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxx
//
// Get it from:
//   https://supabase.com/dashboard/account/tokens
//   (Any name, no expiry needed)
// ─────────────────────────────────────────────────────────────

require('dotenv').config();

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ACCESS_TOKEN      = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_URL || !ACCESS_TOKEN) {
  console.error('\n❌  Missing environment variables.');
  console.error('    Make sure these are in your .env file:');
  console.error('      EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co');
  console.error('      SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxx');
  console.error('\n    Get your Access Token from:');
  console.error('    https://supabase.com/dashboard/account/tokens\n');
  process.exit(1);
}

// Extract project ref from URL  e.g. https://abcdef.supabase.co → abcdef
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

async function runSQL(label, sql) {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  if (!res.ok) {
    console.error(`\n❌  ${label} failed (HTTP ${res.status})`);
    console.error('   ', json?.message || json?.raw || text);
    return false;
  }
  console.log(`✅  ${label}`);
  return true;
}

async function migrate() {
  console.log('\n🔧  Synclexia — Parent RPC Migration');
  console.log('──────────────────────────────────────');
  console.log(`   Project: ${projectRef}\n`);

  // ── 1. find_student_by_code ─────────────────────────────────
  const ok1 = await runSQL('Create find_student_by_code()', `
    DROP FUNCTION IF EXISTS public.find_student_by_code(text);

    CREATE OR REPLACE FUNCTION public.find_student_by_code(lookup_code text)
    RETURNS TABLE (
      id          uuid,
      full_name   text,
      email       text,
      xp          integer,
      level       integer,
      unique_code text
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      RETURN QUERY
        SELECT
          p.id,
          p.full_name,
          p.email,
          p.xp,
          p.level,
          p.unique_code
        FROM public.profiles p
        WHERE p.role = 'student'
          AND p.unique_code = UPPER(TRIM(lookup_code))
        LIMIT 1;
    END;
    $$;

    REVOKE ALL ON FUNCTION public.find_student_by_code(text) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.find_student_by_code(text) TO authenticated;
  `);

  // ── 2. link_child ───────────────────────────────────────────
  const ok2 = await runSQL('Create link_child()', `
    DROP FUNCTION IF EXISTS public.link_child(uuid, uuid);

    CREATE OR REPLACE FUNCTION public.link_child(p_parent_id uuid, p_student_id uuid)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    DECLARE
      caller_role text;
    BEGIN
      IF auth.uid() <> p_parent_id THEN
        RETURN jsonb_build_object('error', 'Unauthorized');
      END IF;

      SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
      IF caller_role <> 'parent' THEN
        RETURN jsonb_build_object('error', 'Only parent accounts can link children');
      END IF;

      IF EXISTS (
        SELECT 1 FROM public.parent_links
        WHERE parent_id = p_parent_id AND student_id = p_student_id
      ) THEN
        RETURN jsonb_build_object('error', 'already_linked');
      END IF;

      INSERT INTO public.parent_links (parent_id, student_id)
      VALUES (p_parent_id, p_student_id);

      RETURN jsonb_build_object('success', true);
    END;
    $$;

    REVOKE ALL ON FUNCTION public.link_child(uuid, uuid) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.link_child(uuid, uuid) TO authenticated;
  `);

  // ── 3. parent_links SELECT policy ──────────────────────────
  const ok3 = await runSQL('Ensure parent_links SELECT policy', `
    DO $outer$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'parent_links'
          AND policyname = 'Parents can view their links'
      ) THEN
        EXECUTE $p$
          CREATE POLICY "Parents can view their links" ON public.parent_links
            FOR SELECT USING (auth.uid() = parent_id)
        $p$;
      END IF;
    END
    $outer$;
  `);

  console.log('');
  if (ok1 && ok2 && ok3) {
    console.log('🎉  Migration complete! Restart your Expo app and try linking again.');
  } else {
    console.log('⚠️   Some steps failed. Check errors above and re-run after fixing.');
  }
  console.log('');
}

migrate().catch(err => {
  console.error('\n❌  Unexpected error:', err.message);
  process.exit(1);
});
