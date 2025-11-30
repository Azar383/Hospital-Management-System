import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dckejswwtqpmhjiikxks.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRja2Vqc3d3dHFwbWhqaWlreGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDQ5NzksImV4cCI6MjA3OTk4MDk3OX0.gRa0e8jUa4OQl8z3KbYl1v-HHIzZsCIjxPDMvpWJp1c'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)