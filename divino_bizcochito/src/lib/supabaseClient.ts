import { createClient } from "@supabase/supabase-js";

// Variables del entorno (desde tu .env)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Cliente de Supabase (público)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
