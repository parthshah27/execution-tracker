import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(2);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function run() {
  console.log('Running select test on table `daily_entries`...');
  const { data, error, status } = await supabase.from('daily_entries').select('*').limit(1);
  console.log('SELECT status=', status);
  if (error) console.error('SELECT error:', error.message || error);
  else console.log('SELECT data:', data);

  const email = process.env.SUPABASE_TEST_EMAIL;
  const password = process.env.SUPABASE_TEST_PASSWORD;
  if (!email || !password) {
    console.log('\nSkipping write test: set SUPABASE_TEST_EMAIL and SUPABASE_TEST_PASSWORD to test as an authenticated user.');
    return;
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError || !authData.user) {
    console.error('Authentication error:', authError?.message ?? 'No user returned');
    process.exitCode = 1;
    return;
  }

  console.log('\nAttempting authenticated UPSERT test...');
  const insertRow = {
    user_id: authData.user.id,
    entry_date: new Date().toISOString().slice(0, 10),
    pnl: 0,
    trades: 0
  };

  const { error: ierr, status: istatus } = await supabase
    .from('daily_entries')
    .upsert(insertRow, { onConflict: 'user_id,entry_date' });
  console.log('UPSERT status=', istatus);
  if (ierr) console.error('UPSERT error:', ierr.message || ierr);
  else console.log('UPSERT succeeded.');
}

run().catch((e) => { console.error(e); process.exit(1); });
