const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getSupabaseClient() {
  if (supabase) return supabase;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

function isDatabaseConnectionError(error) {
  return ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(error?.code);
}

function requireSupabaseClient() {
  const client = getSupabaseClient();
  if (!client) {
    const error = new Error('Supabase fallback is not configured.');
    error.code = 'SUPABASE_NOT_CONFIGURED';
    throw error;
  }
  return client;
}

async function runSupabaseQuery(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

module.exports = {
  getSupabaseClient,
  isDatabaseConnectionError,
  requireSupabaseClient,
  runSupabaseQuery,
};
