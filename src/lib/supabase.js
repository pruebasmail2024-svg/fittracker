import { createClient } from '@supabase/supabase-js'

const url     = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase (VITE_SUPABASE_URL / ' +
    'VITE_SUPABASE_ANON_KEY). Revisá la configuración del proyecto en Vercel.'
  )
}

export const supabase = createClient(url, anonKey)
