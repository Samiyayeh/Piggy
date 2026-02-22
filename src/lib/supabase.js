// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// This 'supabase' object is what you will import in your pages
export const supabase = createClient(supabaseUrl, supabaseAnonKey)