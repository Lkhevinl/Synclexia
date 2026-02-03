// lib/supabase.js
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// YOUR CORRECT KEYS ARE ALREADY HERE:
const supabaseUrl = 'https://vovpgoxjchsiqvtjvcmh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnBnb3hqY2hzaXF2dGp2Y21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjAwMTYsImV4cCI6MjA4NTU5NjAxNn0.cnCnjRlO3Bh9RiuWMCdia5ZS6thtLEJuZWsFVIrutBo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});