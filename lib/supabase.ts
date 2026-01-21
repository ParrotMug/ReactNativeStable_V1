import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto'; 

// Deine persönlichen Zugangsdaten (aus deiner config.js)
const SUPABASE_URL = "https://ajyzhznyoljvwwxvckwm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeXpoem55b2xqdnd3eHZja3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTA5MTYsImV4cCI6MjA3NDU2NjkxNn0.xQ7fhLIoy0rMSXpAEK22s-8ae8A53MMcvnCg4X1Mg-M";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // WICHTIG: Wir haben den Speicher weggelassen, um den Fehler zu umgehen.
    // Das bedeutet: Wenn du die App komplett schließt, musst du dich neu einloggen.
    persistSession: false, 
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
