import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL = "https://ajyzhznyoljvwwxvckwm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeXpoem55b2xqdnd3eHZja3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTA5MTYsImV4cCI6MjA3NDU2NjkxNn0.xQ7fhLIoy0rMSXpAEK22s-8ae8A53MMcvnCg4X1Mg-M";

const storage = Platform.OS === 'web' ? undefined : AsyncStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: storage,
    persistSession: Platform.OS !== 'web',
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
