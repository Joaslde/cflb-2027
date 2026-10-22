import type { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js'
import { ADMIN_EMAIL, CONFIG_MANQUANTE, adminSupabase } from './adminSupabase'

/*
 * Accès aux candidatures depuis l'espace administration, directement via
 * Supabase (clé anon + session du compte administrateur, droits portés par la RLS).
 */

export type Statut = 'en_attente' | 'acceptee' | 'refusee'
export const STATUTS: Statut[] = ['en_attente', 'acceptee', 'refusee']

const TABLE = 'inscription_cflb_2027'
const BUCKET = 'inscription-cflb-2027'
const SIGNED_URL_SECONDS = 600
// Supabase plafonne chaque réponse (1 000 lignes par défaut) : on lit par pages
const PAGE_SIZE = 1000
const EXCERPT_LENGTH = 160

export interface Compteurs {
  total: number
  en_attente: number
  acceptee: number
  refusee: number
}

export interface Inscription {
  id: string
  nom: string
  prenom: string
  date_naissance: string
  ville: string
  telephone_whatsapp: string
  email: string
  photo_url: string | null
  profession: string
  structure: string | null
  categorie: string
  motivation: string
  cv_url: string
  consent_prototype: boolean
  consent_image: boolean
  consent_reglement: boolean
  consent_exactitude: boolean
  statut: Statut
  created_at: string
  reviewed_at: string | null
}

export type InscriptionResume = Omit<Inscription, 'consent_prototype' | 'consent_image' | 'consent_reglement' | 'consent_exactitude'> & {
  motivation_extrait: string
}

export interface InscriptionDetail extends Inscription {
  photo_signed_url: string | null
  cv_signed_url: string | null
  liens_expirent_a: string
}

const LIST_COLUMNS =
  'id, nom, prenom, date_naissance, ville, telephone_whatsapp, email, photo_url, profession, structure, categorie, motivation, cv_url, statut, created_at, reviewed_at'

export class AdminApiError extends Error {
  /** 401 : session absente ou expirée. 403 : droits insuffisants. 500 : configuration. 0 : réseau. */
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
  }
}

function client(): SupabaseClient {
  if (!adminSupabase) throw new AdminApiError(messageConfiguration(), 500)
  return adminSupabase
}

export function messageConfiguration(): string {
  return `Configuration incomplète : ${CONFIG_MANQUANTE.join(', ')} à définir dans les variables d’environnement du site.`
}

/** Traduit une erreur Supabase (PostgREST, Storage, réseau) en message lisible. */
function traduire(error: { message?: string; code?: string; status?: number } | null, contexte: string): AdminApiError {
  const message = error?.message ?? ''
  if (/fetch|network|load failed/i.test(message)) {
    return new AdminApiError('Serveur injoignable. Vérifiez la connexion internet.', 0)
  }
  if (error?.code === 'PGRST301' || error?.code === 'PGRST303' || /jwt/i.test(message)) {
    return new AdminApiError('Session expirée. Saisissez à nouveau le code.', 401)
  }
  if (error?.code === '42501') return new AdminApiError(`${contexte} : droits insuffisants.`, 403)
  return new AdminApiError(message ? `${contexte} (${message})` : contexte, 500)
}

// Session

export const estAdmin = (session: Session | null) => session?.user?.app_metadata?.cflb_admin === true

/** Session administrateur en cours dans cet onglet, ou null. */
export async function sessionAdmin(): Promise<Session | null> {
  if (!adminSupabase) return null
  const { data } = await adminSupabase.auth.getSession()
  if (data.session && !estAdmin(data.session)) {
    await adminSupabase.auth.signOut({ scope: 'local' })
    return null
  }
  return data.session
}

export function surChangementSession(callback: (event: AuthChangeEvent, session: Session | null) => void): () => void {
  if (!adminSupabase) return () => {}
  const { data } = adminSupabase.auth.onAuthStateChange(callback)
  return () => data.subscription.unsubscribe()
}

export const PIN_LONGUEUR = 5

/** Connexion par PIN : le mot de passe du compte administrateur en est dérivé. */
export async function connecter(pin: string): Promise<Session> {
  if (CONFIG_MANQUANTE.length) throw new AdminApiError(messageConfiguration(), 500)
  const db = client()
  const { data, error } = await db.auth.signInWithPassword({ email: ADMIN_EMAIL, password: `CFLB2027-${pin}` })
  if (error || !data.session) {
    const errCode = (error as { code?: string } | null)?.code
    if (errCode === 'email_not_confirmed') throw new AdminApiError('Le compte administrateur n’est pas encore confirmé dans Supabase.', 403)
    if (errCode === 'invalid_credentials' || error?.status === 400) throw new AdminApiError('Code incorrect.', 401)
    if (error?.status === 429) throw new AdminApiError('Trop de tentatives. Patientez quelques minutes avant de réessayer.', 429)
    throw traduire(error, 'Connexion impossible')
  }
  if (!estAdmin(data.session)) {
    await db.auth.signOut({ scope: 'local' })
    throw new AdminApiError('Ce compte n’a pas accès à l’administration.', 403)
  }
  return data.session
}

/** Ferme la session de cet onglet seulement (le compte est partagé par l'équipe). */
export async function deconnecter(): Promise<void> {
  if (adminSupabase) await adminSupabase.auth.signOut({ scope: 'local' })
}

// Lecture

// Terme de recherche sûr pour un filtre .or() : jokers LIKE neutralisés, valeur entre guillemets PostgREST
function motif(term: string): string {
  const like = `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
  return `"${like.replace(/["\\]/g, (c) => `\\${c}`)}"`
}

function extrait(texte: string): string {
  const plat = texte.replace(/\s+/g, ' ').trim()
  if (plat.length <= EXCERPT_LENGTH) return plat
  const coupe = plat.slice(0, EXCERPT_LENGTH)
  const espace = coupe.lastIndexOf(' ')
  return `${(espace > EXCERPT_LENGTH * 0.6 ? coupe.slice(0, espace) : coupe).trimEnd()}…`
}

async function toutesLesPages<T>(
  columns: string,
  options: { statut?: Statut; termes?: string[]; signal?: AbortSignal } = {},
): Promise<T[]> {
  const db = client()
  const rows: T[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    let query = db
      .from(TABLE)
      .select(columns)
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)
    if (options.statut) query = query.eq('statut', options.statut)
    // Chaque mot doit figurer dans le nom, le prénom, l'email ou la ville
    for (const terme of options.termes ?? []) {
      const m = motif(terme)
      query = query.or(`nom.ilike.${m},prenom.ilike.${m},email.ilike.${m},ville.ilike.${m}`)
    }
    if (options.signal) query = query.abortSignal(options.signal)
    const { data, error } = await query
    if (error) throw traduire(error, 'Lecture des candidatures impossible')
    const page = (data ?? []) as unknown as T[]
    rows.push(...page)
    if (page.length < PAGE_SIZE) return rows
  }
}

async function compteurs(signal?: AbortSignal): Promise<Compteurs> {
  const db = client()
  const counts = await Promise.all(
    STATUTS.map(async (statut) => {
      let query = db.from(TABLE).select('id', { count: 'exact', head: true }).eq('statut', statut)
      if (signal) query = query.abortSignal(signal)
      const { count, error } = await query
      if (error) throw traduire(error, 'Comptage des candidatures impossible')
      return count ?? 0
    }),
  )
  const [en_attente, acceptee, refusee] = counts
  return { total: en_attente + acceptee + refusee, en_attente, acceptee, refusee }
}

/** Liste (filtre de statut et recherche optionnels) et compteurs globaux. */
export async function listInscriptions(
  params: { statut?: Statut; q?: string },
  signal?: AbortSignal,
): Promise<{ inscriptions: InscriptionResume[]; compteurs: Compteurs }> {
  const termes = (params.q ?? '').slice(0, 120).split(/\s+/).filter(Boolean).slice(0, 6)
  const [rows, totaux] = await Promise.all([
    toutesLesPages<Omit<InscriptionResume, 'motivation_extrait'>>(LIST_COLUMNS, { statut: params.statut, termes, signal }),
    compteurs(signal),
  ])
  return {
    inscriptions: rows.map((row) => ({ ...row, motivation_extrait: extrait(row.motivation ?? '') })),
    compteurs: totaux,
  }
}

async function lienSigne(path: string | null): Promise<string | null> {
  if (!path) return null
  // La colonne contient le chemin de l'objet ; on tolère un éventuel préfixe de bucket
  const objet = path.replace(/^\/+/, '').replace(`${BUCKET}/`, '')
  const { data, error } = await client().storage.from(BUCKET).createSignedUrl(objet, SIGNED_URL_SECONDS)
  if (error || !data?.signedUrl) {
    console.warn(`[admin] lien signé impossible pour "${objet}"`, error)
    return null
  }
  return data.signedUrl
}

/** Détail complet et liens signés (10 min) vers la photo et le CV. */
export async function getInscription(id: string, signal?: AbortSignal): Promise<InscriptionDetail> {
  let query = client().from(TABLE).select('*').eq('id', id)
  if (signal) query = query.abortSignal(signal)
  const { data, error } = await query.single()
  if (error) {
    if (error.code === 'PGRST116') throw new AdminApiError('Candidature introuvable ou inaccessible.', 404)
    throw traduire(error, 'Lecture de la candidature impossible')
  }
  const row = data as Inscription
  const liens_expirent_a = new Date(Date.now() + SIGNED_URL_SECONDS * 1000).toISOString()
  const [photo_signed_url, cv_signed_url] = await Promise.all([lienSigne(row.photo_url), lienSigne(row.cv_url)])
  return { ...row, photo_signed_url, cv_signed_url, liens_expirent_a }
}

// Décision

/** Change le statut ; la date d'examen est posée par un trigger côté base. */
export async function updateStatut(id: string, statut: Statut): Promise<{ statut: Statut; reviewed_at: string | null }> {
  const { data, error } = await client().from(TABLE).update({ statut }).eq('id', id).select('statut, reviewed_at')
  if (error) throw traduire(error, 'Mise à jour du statut impossible')
  // Sans droit de modification, la RLS ne renvoie aucune ligne au lieu d'une erreur
  const row = (data ?? [])[0] as { statut: Statut; reviewed_at: string | null } | undefined
  if (!row) throw new AdminApiError('Mise à jour refusée : droits insuffisants ou candidature introuvable.', 403)
  return row
}

// Export

/** Toutes les candidatures, toutes colonnes, pour l'export CSV. */
export async function toutesLesInscriptions(): Promise<Inscription[]> {
  return toutesLesPages<Inscription>('*')
}
