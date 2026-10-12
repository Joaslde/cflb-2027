import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Download, LogOut, RotateCw, Search, X } from 'lucide-react'
import logo from '@/assets/logo-cflb-sm.webp'
import { GlassButton, refreshGlassBackdrops } from '@/components/liquid-glass'
import {
  AdminApiError,
  listInscriptions,
  toutesLesInscriptions,
  updateStatut,
  type Compteurs,
  type InscriptionResume,
  type Statut,
} from '@/lib/adminApi'
import { cn } from '@/lib/utils'
import { telechargerCsv } from './csv'
import { InscriptionDrawer } from './InscriptionDrawer'
import { InscriptionList } from './InscriptionList'
import { STATUT_DOT } from './format'
import { Eyebrow, Skeleton, Toast, type ToastData } from './ui'

type Filtre = 'tous' | Statut

const ONGLETS: { id: Filtre; label: string; cle: keyof Compteurs }[] = [
  { id: 'tous', label: 'Toutes', cle: 'total' },
  { id: 'en_attente', label: 'En attente', cle: 'en_attente' },
  { id: 'acceptee', label: 'Acceptées', cle: 'acceptee' },
  { id: 'refusee', label: 'Refusées', cle: 'refusee' },
]

const VIDE: Record<Filtre, string> = {
  tous: 'Aucune candidature pour le moment.',
  en_attente: 'Aucune candidature en attente.',
  acceptee: 'Aucune candidature acceptée pour l’instant.',
  refusee: 'Aucune candidature refusée.',
}

const DECISION: Record<Statut, string> = {
  en_attente: 'remise en attente',
  acceptee: 'acceptée',
  refusee: 'refusée',
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

interface Props {
  onLogout: () => void
  onExpired: () => void
}

export function AdminDashboard({ onLogout, onExpired }: Props) {
  const [filtre, setFiltre] = useState<Filtre>('tous')
  const [recherche, setRecherche] = useState('')
  const q = useDebounced(recherche.trim(), 300)
  const [items, setItems] = useState<InscriptionResume[] | null>(null)
  const [compteurs, setCompteurs] = useState<Compteurs | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  // Requête affichée : tant qu'elle diffère de la requête demandée, le chargement est en cours
  const demande = `${filtre}|${q}|${version}`
  const [recue, setRecue] = useState<string | null>(null)
  const loading = recue !== demande
  const [ouverte, setOuverte] = useState<InscriptionResume | null>(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  const notifier = useCallback((tone: ToastData['tone'], message: string) => setToast({ id: Date.now(), tone, message }), [])
  const fermerToast = useCallback(() => setToast(null), [])

  // Message d'une erreur, ou null si la session a expiré (retour à l'écran de connexion)
  const lireErreur = useCallback(
    (err: unknown, defaut: string) => {
      if (err instanceof AdminApiError && err.status === 401) {
        onExpired()
        return null
      }
      return err instanceof Error ? err.message : defaut
    },
    [onExpired],
  )

  useEffect(() => {
    const ctrl = new AbortController()
    const cle = `${filtre}|${q}|${version}`
    listInscriptions({ statut: filtre === 'tous' ? undefined : filtre, q }, ctrl.signal)
      .then((res) => {
        setItems(res.inscriptions)
        setCompteurs(res.compteurs)
        setErreur(null)
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return
        const message = lireErreur(err, 'Lecture des candidatures impossible.')
        if (message) setErreur(message)
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setRecue(cle)
      })
    return () => ctrl.abort()
  }, [filtre, q, version, lireErreur])

  // Le verre des boutons recapture les zones dont le contenu vient de changer
  useEffect(() => {
    const timer = window.setTimeout(refreshGlassBackdrops, 200)
    return () => window.clearTimeout(timer)
  }, [compteurs, filtre])

  // Après une décision, la ligne quitte aussitôt un onglet qui ne la concerne plus
  const visibles = useMemo(() => items?.filter((i) => filtre === 'tous' || i.statut === filtre) ?? null, [items, filtre])

  const appliquer = (id: string, de: Statut, vers: Statut, reviewed_at: string | null) => {
    setItems((list) => list?.map((i) => (i.id === id ? { ...i, statut: vers, reviewed_at } : i)) ?? list)
    setOuverte((o) => (o && o.id === id ? { ...o, statut: vers, reviewed_at } : o))
    if (de !== vers) setCompteurs((c) => c && { ...c, [de]: c[de] - 1, [vers]: c[vers] + 1 })
  }

  // Mise à jour optimiste, annulée si la base refuse
  const changerStatut = async (cible: InscriptionResume, vers: Statut) => {
    if (saving || cible.statut === vers) return
    const avant = { statut: cible.statut, reviewed_at: cible.reviewed_at }
    appliquer(cible.id, avant.statut, vers, vers === 'en_attente' ? null : new Date().toISOString())
    setSaving(true)
    try {
      const enregistre = await updateStatut(cible.id, vers)
      appliquer(cible.id, vers, enregistre.statut, enregistre.reviewed_at)
      notifier('succes', `Candidature de ${cible.prenom} ${cible.nom} ${DECISION[vers]}.`)
    } catch (err) {
      appliquer(cible.id, vers, avant.statut, avant.reviewed_at)
      const message = lireErreur(err, 'La mise à jour a échoué.')
      if (message) notifier('erreur', `${message} Le statut précédent est rétabli.`)
    } finally {
      setSaving(false)
    }
  }

  const exporter = async () => {
    setExporting(true)
    try {
      const rows = await toutesLesInscriptions()
      telechargerCsv(rows)
      notifier('succes', `Export CSV prêt : ${rows.length} candidature${rows.length > 1 ? 's' : ''}.`)
    } catch (err) {
      const message = lireErreur(err, 'Export impossible.')
      if (message) notifier('erreur', message)
    } finally {
      setExporting(false)
    }
  }

  const fermer = useCallback(() => setOuverte(null), [])
  const nombre = visibles?.length ?? 0

  return (
    <div className="relative min-h-dvh text-charcoal">
      {/* Fond fixe : c'est lui que le verre des boutons réfracte en premier */}
      <div
        data-glass-backdrop
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse at 20% -10%, #fffdf8 0%, #f8f5f2 45%, #efe6d6 100%)' }}
      />

      <header data-glass-backdrop className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pt-5 sm:px-8 sm:pt-8">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logo} alt="" className="h-11 w-11 shrink-0 object-contain" />
          <div className="min-w-0">
            <p className="font-label text-[9px] uppercase tracking-[0.3em] text-or-fonce">CFLB 2027</p>
            <p className="truncate font-display text-xl leading-tight">Administration</p>
          </div>
        </div>
        <GlassButton variant="clair" size="sm" onClick={onLogout} aria-label="Se déconnecter">
          <span className="inline-flex items-center gap-2">
            <LogOut size={14} strokeWidth={1.9} />
            <span className="hidden sm:inline">Déconnexion</span>
          </span>
        </GlassButton>
      </header>

      <section data-glass-backdrop className="mx-auto max-w-7xl px-4 pt-10 sm:px-8 sm:pt-14">
        <Eyebrow>Édition 2027</Eyebrow>
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <h1 className="font-display text-[3.1rem] leading-[0.92] sm:text-7xl lg:text-[5.5rem]">Les candidatures</h1>
          <p className="max-w-md text-[15px] leading-relaxed text-encre-douce lg:pb-2">
            Dossiers déposés depuis le parcours de candidature. Ouvrez une fiche pour l’examiner, puis acceptez-la ou refusez-la.
          </p>
        </div>

        {/* Compteurs, qui servent aussi d'onglets de filtre */}
        <div role="group" aria-label="Filtrer par statut" className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {ONGLETS.map((o) => {
            const actif = filtre === o.id
            const valeur = compteurs?.[o.cle]
            const part = compteurs && compteurs.total > 0 && o.id !== 'tous' ? Math.round(((valeur ?? 0) / compteurs.total) * 100) : null
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={actif}
                onClick={() => setFiltre(o.id)}
                className={cn(
                  'relative min-w-0 overflow-hidden rounded-[22px] p-4 text-left transition duration-300 sm:p-5',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-or',
                  actif
                    ? 'bg-charcoal text-white shadow-[0_20px_50px_rgba(14,14,14,0.22)]'
                    : 'bg-white/70 text-charcoal ring-1 ring-or/20 hover:-translate-y-0.5 hover:ring-or/50',
                )}
              >
                <span
                  className={cn(
                    'flex items-center gap-2 font-label text-[9px] uppercase tracking-[0.2em]',
                    actif ? 'text-or' : 'text-encre-douce',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn('h-1.5 w-1.5 shrink-0 rounded-full', o.id === 'tous' ? 'bg-charcoal/40' : STATUT_DOT[o.id], actif && o.id === 'tous' && 'bg-or')}
                  />
                  <span className="truncate">{o.label}</span>
                </span>
                <span className="mt-4 flex items-end justify-between gap-2">
                  {valeur === undefined ? (
                    <Skeleton className={cn('h-10 w-14 rounded-xl', actif && 'bg-white/15')} />
                  ) : (
                    // Supreme : le zéro de Melodrama est barré et se lit comme un Ø
                    <span className="font-label text-4xl leading-none sm:text-5xl">{valeur}</span>
                  )}
                  {part !== null && (
                    <span className={cn('pb-1 font-label text-[9px] tracking-[0.12em]', actif ? 'text-white/55' : 'text-encre-douce/70')}>
                      {part} %
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {/* Recherche et actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={17} strokeWidth={1.8} aria-hidden className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-or-fonce" />
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un nom, un email, une ville"
              aria-label="Rechercher une candidature"
              className="h-12 w-full rounded-full bg-white/80 pl-12 pr-12 text-[15px] text-charcoal outline-none ring-1 ring-or/25 transition placeholder:text-encre-douce/60 focus:ring-2 focus:ring-or [&::-webkit-search-cancel-button]:hidden"
            />
            {recherche && (
              <button
                type="button"
                onClick={() => setRecherche('')}
                aria-label="Effacer la recherche"
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-encre-douce transition hover:bg-champagne hover:text-charcoal"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            )}
          </div>
          {/* Hauteur fixe : le verre retire ses boutons de sa capture, la rangée ne doit pas se replier */}
          <div className="flex h-12 items-center gap-3">
            <GlassButton
              variant="clair"
              shape="circle"
              size="md"
              onClick={() => setVersion((v) => v + 1)}
              aria-label="Actualiser la liste"
              className="h-12 w-12"
            >
              <RotateCw size={17} strokeWidth={1.8} className={loading ? 'animate-spin' : undefined} />
            </GlassButton>
            <GlassButton variant="or" size="md" onClick={exporter} disabled={exporting} className="h-12 flex-1 sm:flex-none">
              <span className="inline-flex items-center gap-2">
                <Download size={15} strokeWidth={1.9} />
                {exporting ? 'Export…' : 'Exporter en CSV'}
              </span>
            </GlassButton>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-8">
        <p className="mb-3 flex items-center gap-3 px-1 font-label text-[9px] uppercase tracking-[0.24em] text-encre-douce" aria-live="polite">
          {visibles === null ? 'Chargement…' : `${nombre} candidature${nombre > 1 ? 's' : ''}${q ? ` pour « ${q} »` : ''}`}
          {loading && visibles !== null && <span className="h-1 w-1 animate-ping rounded-full bg-or" aria-hidden />}
        </p>

        {erreur ? (
          <div className="flex flex-col items-center gap-5 rounded-[28px] bg-white/70 px-6 py-14 text-center ring-1 ring-or/20">
            <p className="max-w-md font-display text-2xl leading-tight">La liste n’a pas pu être chargée.</p>
            <p className="max-w-md text-sm text-encre-douce [overflow-wrap:anywhere]">{erreur}</p>
            <GlassButton variant="or" size="md" onClick={() => setVersion((v) => v + 1)}>
              Réessayer
            </GlassButton>
          </div>
        ) : (
          <InscriptionList
            items={visibles}
            activeId={ouverte?.id ?? null}
            searching={Boolean(q)}
            emptyMessage={q ? `Aucune candidature ne correspond à « ${q} ».` : VIDE[filtre]}
            onOpen={setOuverte}
          />
        )}
      </main>

      <AnimatePresence>
        {ouverte && (
          <InscriptionDrawer
            key={ouverte.id}
            inscription={ouverte}
            saving={saving}
            onClose={fermer}
            onStatut={(statut) => changerStatut(ouverte, statut)}
            onUnauthorized={onExpired}
          />
        )}
      </AnimatePresence>

      <Toast toast={toast} onDone={fermerToast} />
    </div>
  )
}
