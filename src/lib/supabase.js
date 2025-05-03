import { createClient } from '@supabase/supabase-js'

// these should be defined in your .env as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        // store/retrieve session from localStorage
        persistSession: true,
        // parse the URL for OAuth redirects, if you’re using magic links/third-party providers
        detectSessionInUrl: true,
    }
})
