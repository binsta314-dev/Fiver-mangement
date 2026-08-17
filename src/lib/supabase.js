import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lmswdkotzhffkiodlfxr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtc3dka290emhmZmtpb2RsZnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5OTE5MzMsImV4cCI6MjEwMjU2NzkzM30.pTEN1BJXUERFmJZJVU9anJF2UM5eOvxVO4VQhAS13o8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
