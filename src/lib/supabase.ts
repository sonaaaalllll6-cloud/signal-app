import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xsbrbgfqvasumwatgons.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzYnJiZ2ZxdmFzdW13YXRnb25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjA0NzksImV4cCI6MjA4ODk5NjQ3OX0.mLlgluikTOsB2UNrCmsvOrL09J_Jup24bf8q7_I1qMI'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
