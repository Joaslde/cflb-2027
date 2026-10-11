import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/*
 * Client Supabase de l'espace administration (clé anon uniquement).
 * Les droits de lecture et de décision viennent des règles RLS, accordées au
 * compte dont le JWT porte app_metadata.cflb_admin = true.
 * La session vit dans sessionStorage : elle se ferme avec l'onglet.
 */

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? ''
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? ''

/*
 * Identifiant interne du compte admin technique (Supabase Auth).
 * Connexion provisoire par PIN : l'utilisateur ne saisit jamais d'email.
 * Ce n'est pas un secret, la sécurité repose sur le PIN et les règles RLS.
 */
export const ADMIN_EMAIL = 'admin@cflb2027.invalid'

/** Variables d'environnement manquantes, pour un message de configuration clair. */
export const CONFIG_MANQUANTE = [!url && 'VITE_SUPABASE_URL', !anonKey && 'VITE_SUPABASE_ANON_KEY'].filter(
  (v): v is string => Boolean(v),
)

// sessionStorage peut être inaccessible (navigation privée stricte) : repli en mémoire
const memoire = new Map<string, string>()
const stockage = {
  getItem(key: string) {
    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return memoire.get(key) ?? null
    }
  },
  setItem(key: string, value: string) {
    try {
      window.sessionStorage.setItem(key, value)
    } catch {
      memoire.set(key, value)
    }
  },
  removeItem(key: string) {
    try {
      window.sessionStorage.removeItem(key)
    } catch {
      memoire.delete(key)
    }
  },
}

export const adminSupabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, storage: stockage, storageKey: 'cflb-admin' },
      })
    : null
