import { createClient } from '@supabase/supabase-js'

// Client public (clé publiable) : il ne peut que déposer une candidature.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null

export const TABLE_INSCRIPTIONS = 'inscription_cflb_2027'
export const BUCKET_INSCRIPTIONS = 'inscription-cflb-2027'
