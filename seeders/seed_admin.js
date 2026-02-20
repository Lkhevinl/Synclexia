// seeders/seed_admin.js
// ─────────────────────────────────────────────────────────────
// Run with:  node seeders/seed_admin.js
// Requires:  SUPABASE_SERVICE_ROLE_KEY in your .env file
//            (Dashboard → Project Settings → API → service_role key)
// ─────────────────────────────────────────────────────────────

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// ── Config ──────────────────────────────────────────────────
const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL       = process.env.SEED_ADMIN_EMAIL    || 'admin@synclexia.com';
const ADMIN_PASSWORD    = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
const ADMIN_FULL_NAME   = process.env.SEED_ADMIN_NAME     || 'Super Admin';

// ── Validate env ─────────────────────────────────────────────
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\n❌  Missing environment variables.');
  console.error('    Make sure EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in your .env\n');
  process.exit(1);
}

// ── Create admin Supabase client (bypasses RLS) ──────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Seeder ───────────────────────────────────────────────────
async function seedAdmin() {
  console.log('\n🌱  Synclexia — Admin Seeder');
  console.log('─────────────────────────────');

  // 1. Check if admin already exists
  const { data: existing, error: checkError } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('email', ADMIN_EMAIL)
    .maybeSingle();

  if (checkError) {
    console.error('❌  Error checking existing admin:', checkError.message);
    process.exit(1);
  }

  if (existing) {
    console.log(`⚠️   Admin already exists: ${existing.email} (role: ${existing.role})`);
    console.log('    No changes made. Delete the user from Supabase Auth to re-seed.\n');
    process.exit(0);
  }

  // 2. Create auth user with service role (skips email confirmation)
  console.log(`📧  Creating auth user: ${ADMIN_EMAIL}`);
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,          // No email confirmation required
  });

  if (authError) {
    console.error('❌  Failed to create auth user:', authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log(`✅  Auth user created — ID: ${userId}`);

  // 3. Upsert profile with admin role
  console.log(`👤  Creating admin profile...`);
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert([{
      id:        userId,
      email:     ADMIN_EMAIL,
      full_name: ADMIN_FULL_NAME,
      role:      'admin',
      xp:        0,
      coins:     0,
    }]);

  if (profileError) {
    console.error('❌  Failed to create profile:', profileError.message);
    console.error('    Auth user was created. You may need to delete it from Supabase before retrying.');
    process.exit(1);
  }

  // 4. Done
  console.log('\n✅  Admin seeded successfully!');
  console.log('─────────────────────────────');
  console.log(`    Email    : ${ADMIN_EMAIL}`);
  console.log(`    Password : ${ADMIN_PASSWORD}`);
  console.log(`    Name     : ${ADMIN_FULL_NAME}`);
  console.log(`    Role     : admin`);
  console.log('\n⚠️   Change the password after first login!\n');
}

seedAdmin();
