import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Check, FileText, ImageIcon, Mail, MessageCircle, Undo2, X } from 'lucide-react'
import { GlassButton, refreshGlassBackdrops } from '@/components/liquid-glass'
import { AdminApiError, getInscription, type InscriptionDetail, type InscriptionResume, type Statut } from '@/lib/adminApi'
import { STATUT_LABEL, ageFrom, formatDateHeure, formatNaissance, whatsappLink } from './format'
import { Monogram, Skeleton, StatusBadge } from './ui'

interface Props {
  /** Résumé tenu à jour par le tableau de bord (statut optimiste compris). */
  inscription: InscriptionResume
  saving: boolean
  onClose: () => void
  onStatut: (statut: Statut) => void
  onUnauthorized: () => void
}

const EASE = [0.22, 1, 0.36, 1] as const

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="mt-9">
      <h3 className="flex items-center gap-3 font-label text-[9px] uppercase tracking-[0.28em] text-or-fonce">
        {titre}
        <span aria-hidden className="h-px flex-1 bg-or/25" />
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function LienLigne({ href, icon, label, value, external }: { href: string; icon: ReactNode; label: string; value: string; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group flex items-center gap-4 rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-or/20 transition hover:bg-white hover:ring-or/50 focus-visible:outline-2 focus-visible:outline-or"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-champagne text-or-fonce">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-label text-[8.5px] uppercase tracking-[0.24em] text-encre-douce">{label}</span>
        <span className="mt-0.5 block text-[15px] text-charcoal [overflow-wrap:anywhere]">{value}</span>
      </span>
      <ArrowUpRight size={16} aria-hidden className="shrink-0 text-or-fonce/60 transition group-hover:text-or-fonce" />
    </a>
  )
}

function Fait({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 px-3 py-3 first:pl-0 last:pr-0">
      <dt className="font-label text-[8px] uppercase tracking-[0.22em] text-encre-douce">{label}</dt>
      <dd className="mt-1.5 text-[15px] leading-snug text-charcoal [overflow-wrap:anywhere]">{children}</dd>
    </div>
  )
}

export function InscriptionDrawer({ inscription, saving, onClose, onStatut, onUnauthorized }: Props) {
  const [detail, setDetail] = useState<InscriptionDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const id = inscription.id

  // Détail complet (motivation, liens signés)
  useEffect(() => {
    const ctrl = new AbortController()
    getInscription(id, ctrl.signal)
      .then((d) => {
        setDetail(d)
        setError(null)
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return
        if (err instanceof AdminApiError && err.status === 401) return onUnauthorized()
        setError(err instanceof Error ? err.message : 'Lecture de la candidature impossible.')
      })
    return () => ctrl.abort()
  }, [id, version, onUnauthorized])

  // Les liens signés durent 10 min : on les renouvelle discrètement avant expiration
  useEffect(() => {
    if (!detail) return
    const delay = new Date(detail.liens_expirent_a).getTime() - Date.now() - 30_000
    const timer = window.setTimeout(() => setVersion((v) => v + 1), Math.max(delay, 5_000))
    return () => window.clearTimeout(timer)
  }, [detail])

  // Échap ferme, la page derrière ne défile plus, le focus revient où il était
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [onClose])

  const d = detail
  const statut = inscription.statut
  const age = ageFrom(inscription.date_naissance)
  const wa = whatsappLink(inscription.telephone_whatsapp)
  const nomComplet = `${inscription.prenom} ${inscription.nom}`

  return (
    <>
      <motion.div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-40 bg-charcoal/45 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fiche-titre"
        tabIndex={-1}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.55, ease: EASE }}
        onAnimationComplete={() => refreshGlassBackdrops()}
        className="fixed inset-0 z-50 flex flex-col bg-ivoire text-charcoal outline-none md:left-auto md:w-[min(600px,100vw)] md:rounded-l-[32px] md:shadow-[-30px_0_90px_rgba(40,28,4,0.28)]"
      >
        <header data-glass-backdrop className="flex min-h-[4.75rem] items-center justify-between gap-4 border-b border-or/20 px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <p className="font-label text-[9px] uppercase tracking-[0.3em] text-or-fonce">Candidature</p>
            <p className="mt-1 truncate text-xs text-encre-douce">Déposée le {formatDateHeure(inscription.created_at)}</p>
          </div>
          <GlassButton shape="circle" size="sm" onClick={onClose} aria-label="Fermer la fiche" className="h-11 w-11">
            <X size={18} strokeWidth={1.8} />
          </GlassButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-10 pt-7 sm:px-8">
          {/* Identité */}
          <div className="grid grid-cols-[6.25rem_minmax(0,1fr)] items-center gap-5 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-7">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-champagne ring-1 ring-or/40 shadow-[0_14px_36px_rgba(90,68,16,0.18)]">
              {d?.photo_signed_url ? (
                <a href={d.photo_signed_url} target="_blank" rel="noopener noreferrer" title="Voir la photo en grand">
                  <img src={d.photo_signed_url} alt={`Portrait de ${nomComplet}`} className="h-full w-full object-cover" />
                </a>
              ) : !d && !error && inscription.photo_url ? (
                <span aria-hidden className="absolute inset-0 animate-pulse bg-or/15" />
              ) : (
                <Monogram prenom={inscription.prenom} nom={inscription.nom} className="absolute inset-0 rounded-none bg-transparent text-4xl shadow-none ring-0 sm:text-5xl" />
              )}
            </div>
            <div className="min-w-0">
              <StatusBadge statut={statut} />
              <h2 id="fiche-titre" className="mt-3 font-display text-[2.15rem] font-medium leading-[0.98] [overflow-wrap:anywhere] sm:text-5xl">
                {inscription.prenom} <span className="text-or-fonce">{inscription.nom}</span>
              </h2>
              <p className="mt-3 text-sm leading-snug text-encre-douce [overflow-wrap:anywhere]">
                {inscription.profession}
                {inscription.structure ? ` · ${inscription.structure}` : ''}
              </p>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-3 divide-x divide-or/20 border-y border-or/20">
            <Fait label="Catégorie">{inscription.categorie}</Fait>
            <Fait label="Âge">{age !== null ? `${age} ans` : 'Non précisé'}</Fait>
            <Fait label="Ville">{inscription.ville}</Fait>
          </dl>
          <p className="mt-3 text-xs text-encre-douce">Née le {formatNaissance(inscription.date_naissance)}</p>

          <Section titre="Contact">
            <div className="space-y-2.5">
              <LienLigne href={`mailto:${inscription.email}`} icon={<Mail size={17} strokeWidth={1.7} />} label="Email" value={inscription.email} />
              {wa ? (
                <LienLigne
                  href={wa}
                  external
                  icon={<MessageCircle size={17} strokeWidth={1.7} />}
                  label="WhatsApp"
                  value={inscription.telephone_whatsapp}
                />
              ) : (
                <p className="text-sm text-encre-douce">Numéro WhatsApp illisible : {inscription.telephone_whatsapp}</p>
              )}
            </div>
          </Section>

          <Section titre="Motivation">
            <figure className="relative rounded-[24px] bg-white/75 px-5 pb-5 pt-12 ring-1 ring-or/20 sm:px-7">
              <span aria-hidden className="absolute left-5 top-4 font-display text-6xl leading-[0.8] text-or sm:left-7">
                “
              </span>
              {d ? (
                <>
                  <blockquote className="whitespace-pre-line text-[15px] leading-relaxed text-charcoal/90 [overflow-wrap:anywhere]">
                    {d.motivation}
                  </blockquote>
                  <figcaption className="mt-4 text-right font-label text-[8px] uppercase tracking-[0.22em] text-encre-douce/70">
                    {d.motivation.length} caractères
                  </figcaption>
                </>
              ) : (
                <>
                  <p className="text-[15px] leading-relaxed text-charcoal/50">{inscription.motivation_extrait}</p>
                  {!error && (
                    <div className="mt-4 space-y-2.5">
                      <Skeleton className="h-2.5 w-full" />
                      <Skeleton className="h-2.5 w-11/12" />
                      <Skeleton className="h-2.5 w-2/3" />
                    </div>
                  )}
                </>
              )}
            </figure>
            {error && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f4e1dd]/70 px-4 py-3 text-sm text-[#8a2f27]">
                <span className="min-w-0 [overflow-wrap:anywhere]">{error}</span>
                <GlassButton size="sm" variant="clair" onClick={() => setVersion((v) => v + 1)}>
                  Réessayer
                </GlassButton>
              </div>
            )}
          </Section>

          <Section titre="Documents">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {d?.photo_signed_url ? (
                <LienLigne href={d.photo_signed_url} external icon={<ImageIcon size={17} strokeWidth={1.7} />} label="Photo" value="Voir en grand" />
              ) : (
                <Document icon={<ImageIcon size={17} strokeWidth={1.7} />} label="Photo" value={documentAbsent(Boolean(inscription.photo_url), d, error, 'Aucune photo fournie')} />
              )}
              {d?.cv_signed_url ? (
                <LienLigne href={d.cv_signed_url} external icon={<FileText size={17} strokeWidth={1.7} />} label="CV" value="Ouvrir le CV" />
              ) : (
                <Document icon={<FileText size={17} strokeWidth={1.7} />} label="CV" value={documentAbsent(Boolean(inscription.cv_url), d, error, 'Aucun CV fourni')} />
              )}
            </div>
            {d && (
              <p className="mt-3 text-xs text-encre-douce/80">Liens sécurisés et temporaires, renouvelés automatiquement.</p>
            )}
          </Section>

          <Section titre="Engagements">
            <ul className="space-y-2 text-sm text-charcoal/85">
              {[
                ['Sait ce qu’elle doit présenter au jury', d?.consent_prototype],
                ['Droit à l’image accordé', d?.consent_image],
                ['Règlement accepté', d?.consent_reglement],
                ['Informations certifiées exactes', d?.consent_exactitude],
              ].map(([label, ok]) => (
                <li key={String(label)} className="flex items-center gap-3">
                  <span
                    className={
                      ok === undefined
                        ? 'grid h-5 w-5 place-items-center rounded-full bg-or/10'
                        : ok
                          ? 'grid h-5 w-5 place-items-center rounded-full bg-[#e5ede0] text-[#2e5a37]'
                          : 'grid h-5 w-5 place-items-center rounded-full bg-[#f4e1dd] text-[#8a2f27]'
                    }
                  >
                    {ok === undefined ? null : ok ? <Check size={12} strokeWidth={2.4} /> : <X size={12} strokeWidth={2.4} />}
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </Section>

          <Section titre="Suivi">
            <dl className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-encre-douce">Déposée le</dt>
                <dd>{formatDateHeure(inscription.created_at)}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-encre-douce">Examinée le</dt>
                <dd>{inscription.reviewed_at ? formatDateHeure(inscription.reviewed_at) : 'pas encore examinée'}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-encre-douce">Identifiant</dt>
                <dd className="select-all font-mono text-xs leading-5 text-encre-douce [overflow-wrap:anywhere]">{inscription.id}</dd>
              </div>
            </dl>
          </Section>
        </div>

        {/* Décision */}
        <footer
          data-glass-backdrop
          className="border-t border-or/20 bg-ivoire px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-8"
        >
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-xs text-encre-douce" aria-live="polite">
              {saving
                ? 'Enregistrement…'
                : statut === 'en_attente'
                  ? 'En attente de décision.'
                  : `${STATUT_LABEL[statut]} le ${formatDateHeure(inscription.reviewed_at ?? '')}.`}
            </p>
            {statut !== 'en_attente' && (
              <GlassButton size="sm" variant="clair" disabled={saving} onClick={() => onStatut('en_attente')}>
                <span className="inline-flex items-center gap-2">
                  <Undo2 size={13} strokeWidth={2} />
                  Remettre en attente
                </span>
              </GlassButton>
            )}
          </div>
          {/* Hauteur fixe : le verre retire ses boutons de sa capture, la rangée ne doit pas se replier */}
          <div className="mt-3 grid h-12 grid-cols-2 gap-3">
            <GlassButton
              variant="clair"
              size="md"
              disabled={saving || statut === 'refusee'}
              onClick={() => onStatut('refusee')}
              className="h-12 w-full px-4"
            >
              {statut === 'refusee' ? 'Refusée' : 'Refuser'}
            </GlassButton>
            <GlassButton
              variant="or"
              size="md"
              disabled={saving || statut === 'acceptee'}
              onClick={() => onStatut('acceptee')}
              className="h-12 w-full px-4"
            >
              {statut === 'acceptee' ? 'Acceptée' : 'Accepter'}
            </GlassButton>
          </div>
        </footer>
      </motion.div>
    </>
  )
}

function documentAbsent(present: boolean, detail: InscriptionDetail | null, error: string | null, absent: string) {
  if (!present) return absent
  if (!detail && !error) return 'Chargement…'
  return 'Fichier indisponible'
}

function Document({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl px-4 py-3 ring-1 ring-or/15">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-or/10 text-or-fonce/60">{icon}</span>
      <span className="min-w-0">
        <span className="block font-label text-[8.5px] uppercase tracking-[0.24em] text-encre-douce">{label}</span>
        <span className="mt-0.5 block text-[15px] text-encre-douce">{value}</span>
      </span>
    </div>
  )
}
