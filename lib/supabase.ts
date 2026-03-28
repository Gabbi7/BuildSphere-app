import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

console.log('DEBUG: Supabase URL:', supabaseUrl);
console.log('DEBUG: Supabase Key length:', supabaseAnonKey.length);
if (supabaseAnonKey) {
  console.log('DEBUG: Supabase Key starts with:', supabaseAnonKey.substring(0, 10));
} else {
  console.log('DEBUG: Supabase Key is EMPTY!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
