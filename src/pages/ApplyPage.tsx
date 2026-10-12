import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ExternalLink, X } from 'lucide-react'
import logo from '@/assets/logo-cflb-sm.webp'
import { GlassButton } from '@/components/liquid-glass'
import { ChoiceCards, Consent, FileDrop, PhoneField, TextArea, TextField } from '@/components/quiz/fields'
import {
  CATEGORIES,
  EMPTY_DRAFT,
  INDICATIFS,
  MOTIVATION_MAX,
  MOTIVATION_MIN,
  STEPS,
  ageFrom,
  firstInvalid,
  indicatifDe,
  validate,
  type Draft,
  type Files,
  type StepId,
} from '@/components/quiz/model'
import { SubmitError, submitCandidature } from '@/components/quiz/submit'
import { usePageMeta } from '@/lib/usePageMeta'

const STORAGE_KEY = 'cflb2027-candidature'

/** Garde les chiffres et espaces, et retire l'indicatif s'il a été collé avec le numéro. */
function sansIndicatif(valeur: string, indicatif: string) {
  const v = valeur.replace(/[^\d ]/g, '').trimStart()
  const code = indicatif.replace('+', '')
  const { chiffres } = indicatifDe(indicatif)
  return v.replace(/\s/g, '').length > chiffres && v.startsWith(code) ? v.slice(code.length).trimStart() : v
}

// Brouillon conservé dans le navigateur (les fichiers ne le sont pas)
function loadDraft(): { draft: Draft; step: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const draft = { ...EMPTY_DRAFT, ...parsed.draft }
    draft.telephone = sansIndicatif(String(draft.telephone ?? '').replace(/^\+/, ''), draft.indicatif)
    return { draft, step: Number(parsed.step) || 0 }
  } catch {
    return null
  }
}
function saveDraft(draft: Draft, step: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, step }))
  } catch {
    /* stockage indisponible : le parcours fonctionne sans */
  }
}
function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* rien à faire */
  }
}

type Phase = 'intro' | 'parcours' | 'envoi' | 'fini'

const QUESTIONS: Record<StepId, { titre: string; aide?: string }> = {
  identite: { titre: 'Comment t’appelles-tu ?' },
  naissance: { titre: 'Quelle est ta date de naissance ?' },
  ville: { titre: 'Dans quelle ville vis-tu ?' },
  telephone: { titre: 'Ton numéro WhatsApp ?', aide: 'C’est par là que l’équipe pourra te joindre.' },
  email: { titre: 'Et ton adresse email ?' },
  profil: { titre: 'Que fais-tu dans la vie ?', aide: 'Ton métier ou ton activité, et ta structure si tu en as une.' },
  categorie: { titre: 'Dans quelle catégorie te reconnais-tu ?' },
  motivation: {
    titre: 'Pourquoi veux-tu rejoindre la CFLB 2027 ?',
    aide: 'Ton parcours, ce qui te pousse, ce que tu veux apporter. Sois toi-même.',
  },
  photo: { titre: 'Une photo de toi ?', aide: 'Facultatif. Un portrait net et lumineux, de préférence.' },
  cv: { titre: 'Ton CV ?', aide: 'En PDF, 5 Mo maximum.' },
  engagements: { titre: 'Derniers engagements' },
  recap: { titre: 'On vérifie ensemble ?', aide: 'Touche une ligne pour la modifier.' },
}

export function ApplyPage() {
  usePageMeta({
    titre: 'Candidater au Robot-Pitch Challenge 2027 · CFLB',
    description:
      'Dépose ta candidature au CFLB Robot-Pitch Challenge 2027 : une question à la fois, quelques minutes, et ton CV en PDF. Présente ton idée innovante devant un jury.',
    chemin: '/postuler',
  })
  const saved = useMemo(loadDraft, [])
  const [phase, setPhase] = useState<Phase>('intro')
  const [step, setStep] = useState(saved?.step ?? 0)
  const [dir, setDir] = useState(1)
  const [draft, setDraft] = useState<Draft>(saved?.draft ?? EMPTY_DRAFT)
  const [files, setFiles] = useState<Files>({ photo: null, cv: null })
  const [error, setError] = useState<string | null>(null)

  const id = STEPS[step]
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }))
    setError(null)
  }

  useEffect(() => {
    if (phase === 'parcours') saveDraft(draft, step)
  }, [draft, step, phase])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step, phase])

  const goTo = (i: number) => {
    setDir(i > step ? 1 : -1)
    setError(null)
    setStep(i)
  }

  const next = async (e?: FormEvent) => {
    e?.preventDefault()
    const err = validate(id, draft, files)
    if (err) return setError(err)
    if (id !== 'recap') return goTo(step + 1)

    // Envoi final
    const bad = firstInvalid(draft, files)
    if (bad) {
      goTo(STEPS.indexOf(bad))
      return setError(validate(bad, draft, files))
    }
    setPhase('envoi')
    try {
      await submitCandidature(draft, files)
      clearDraft()
      setPhase('fini')
    } catch (err) {
      setPhase('parcours')
      const e2 = err instanceof SubmitError ? err : new SubmitError('L’envoi a échoué. Réessaie dans un instant.', 'inconnu')
      if (e2.kind === 'doublon') goTo(STEPS.indexOf('email'))
      setError(e2.message)
    }
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden text-charcoal">
      {/* Fond fixe : c'est lui que le verre des boutons réfracte */}
      <div
        data-glass-backdrop
        aria-hidden
        className="fixed inset-0 -z-10 overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 35%, #fffdf8 0%, #f4ecdd 50%, #e3d2b2 100%)' }}
      >
        <p
          className="absolute -bottom-[0.18em] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-hero font-black text-or-fonce"
          style={{ fontSize: 'clamp(5rem, 22vw, 20rem)', opacity: 0.07, letterSpacing: '-0.04em', lineHeight: 1 }}
        >
          CFLB 2027
        </p>
      </div>

      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 pt-5 sm:px-8 sm:pt-8">
        <a href="/" className="flex items-center gap-3" aria-label="Retour à l’accueil">
          <img src={logo} alt="" className="h-11 w-11 object-contain" />
          <span className="hidden font-label text-[10px] uppercase tracking-[0.25em] text-encre-douce sm:inline">Candidature 2027</span>
        </a>
        {phase !== 'fini' && (
          <GlassButton href="/" shape="circle" size="sm" aria-label="Quitter le parcours" className="h-11 w-11">
            <X size={18} strokeWidth={1.8} />
          </GlassButton>
        )}
      </header>

      {phase === 'parcours' || phase === 'envoi' ? (
        <Progress current={step + 1} total={STEPS.length} />
      ) : (
        <div className="h-[3px]" />
      )}

      <main className="mx-auto max-w-3xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16">
        <AnimatePresence mode="wait" custom={dir}>
          {phase === 'intro' && (
            <Screen key="intro" dir={1}>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-or-fonce">CFLB 2027 · Robot Pitch</p>
              <h1 className="mt-5 font-display text-5xl leading-[0.98] sm:text-7xl">Ta candidature commence ici.</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-encre-douce">
                Une question à la fois, une dizaine en tout. Compte quelques minutes et garde ton CV en PDF à portée de main. Tes
                réponses sont gardées sur cet appareil si tu fais une pause.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <GlassButton variant="or" size="lg" onClick={() => setPhase('parcours')}>
                  {saved && saved.step > 0 ? 'Reprendre' : 'Commencer'}
                </GlassButton>
                {saved && saved.step > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      clearDraft()
                      setDraft(EMPTY_DRAFT)
                      setStep(0)
                      setPhase('parcours')
                    }}
                    className="font-label text-[10px] uppercase tracking-[0.2em] text-encre-douce underline-offset-4 hover:underline"
                  >
                    Recommencer à zéro
                  </button>
                )}
              </div>
            </Screen>
          )}

          {(phase === 'parcours' || phase === 'envoi') && (
            <Screen key={id} dir={dir}>
              <form onSubmit={next} noValidate>
                <p className="font-label text-[10px] uppercase tracking-[0.3em] text-or-fonce">
                  {String(step + 1).padStart(2, '0')} / {STEPS.length}
                </p>
                {/* Espace insécable avant ? et : (typographie française) */}
                <h1 className="mt-4 font-display text-4xl leading-[1.02] sm:text-6xl">
                  {QUESTIONS[id].titre.replace(/ ([?:!;])/g, ' $1')}
                </h1>
                {QUESTIONS[id].aide && <p className="mt-4 max-w-xl text-lg text-encre-douce">{QUESTIONS[id].aide}</p>}

                <div className="mt-10">
                  <StepFields id={id} draft={draft} files={files} set={set} setFiles={setFiles} goTo={goTo} />
                </div>

                <p role="alert" aria-live="polite" className="mt-5 min-h-[1.5rem] text-sm font-medium text-red-700">
                  {error}
                </p>

                <div className="mt-6 flex items-center justify-between gap-3">
                  {step > 0 ? (
                    <GlassButton onClick={() => goTo(step - 1)} size="md" disabled={phase === 'envoi'}>
                      <span className="flex items-center gap-2">
                        <ArrowLeft size={14} /> Retour
                      </span>
                    </GlassButton>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-4">
                    {id !== 'motivation' && id !== 'recap' && (
                      <span className="hidden font-label text-[9px] uppercase tracking-[0.2em] text-encre-douce/70 sm:inline">
                        Entrée ↵
                      </span>
                    )}
                    <GlassButton type="submit" variant="or" size="md" disabled={phase === 'envoi'}>
                      <span className="flex items-center gap-2">
                        {phase === 'envoi'
                          ? 'Envoi en cours…'
                          : id === 'recap'
                            ? 'Envoyer ma candidature'
                            : id === 'photo' && !files.photo
                              ? 'Passer'
                              : 'Continuer'}
                        {phase !== 'envoi' && <ArrowRight size={14} />}
                      </span>
                    </GlassButton>
                  </div>
                </div>
              </form>
            </Screen>
          )}

          {phase === 'fini' && (
            <Screen key="fini" dir={1}>
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.15 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-or text-charcoal shadow-[0_18px_50px_rgba(212,175,55,0.45)]"
              >
                <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <motion.path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.45 }}
                  />
                </svg>
              </motion.div>
              <h1 className="mt-10 font-display text-5xl leading-[0.98] sm:text-7xl">C’est envoyé, {draft.prenom.trim() || 'merci'}.</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-encre-douce">
                Ta candidature a bien été prise en compte. L’équipe de la CFLB 2027 va l’étudier avec attention.
              </p>
              <div className="mt-10">
                <GlassButton href="/" variant="or" size="lg">
                  Retour à l’accueil
                </GlassButton>
              </div>
            </Screen>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div
      role="progressbar"
      aria-label="Progression"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      className="mx-auto mt-6 h-[3px] max-w-3xl overflow-hidden rounded-full bg-or/15 px-0 sm:mx-auto"
    >
      <motion.div
        className="h-full rounded-full bg-[linear-gradient(90deg,#cfaa2e,#eea810)]"
        initial={false}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

function Screen({ children, dir }: { children: ReactNode; dir: number }) {
  return (
    <motion.section
      custom={dir}
      initial={{ opacity: 0, y: 30 * dir, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -24 * dir, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}

function StepFields({
  id,
  draft,
  files,
  set,
  setFiles,
  goTo,
}: {
  id: StepId
  draft: Draft
  files: Files
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void
  setFiles: (f: (prev: Files) => Files) => void
  goTo: (i: number) => void
}) {
  switch (id) {
    case 'identite':
      return (
        <div className="grid gap-8 sm:grid-cols-2">
          <TextField label="Prénom" autoFocus autoComplete="given-name" value={draft.prenom} onChange={(e) => set('prenom', e.target.value)} />
          <TextField label="Nom" autoComplete="family-name" value={draft.nom} onChange={(e) => set('nom', e.target.value)} />
        </div>
      )
    case 'naissance':
      return (
        <TextField
          label="Date de naissance"
          type="date"
          autoFocus
          autoComplete="bday"
          max={new Date().toISOString().slice(0, 10)}
          value={draft.date_naissance}
          onChange={(e) => set('date_naissance', e.target.value)}
        />
      )
    case 'ville':
      return (
        <TextField
          label="Ville"
          autoFocus
          autoComplete="address-level2"
          placeholder="Cotonou, Porto-Novo, Parakou…"
          value={draft.ville}
          onChange={(e) => set('ville', e.target.value)}
        />
      )
    case 'telephone':
      return (
        <PhoneField
          label="Numéro WhatsApp"
          indicatif={draft.indicatif}
          numero={draft.telephone}
          options={INDICATIFS}
          onIndicatif={(code) => set('indicatif', code)}
          onNumero={(v) => set('telephone', sansIndicatif(v, draft.indicatif))}
          placeholder={draft.indicatif === '+229' ? '0159841185' : undefined}
          maxLength={18}
          hint={
            draft.indicatif === '+229'
              ? 'Les 10 chiffres après +229. Exemple : 0159841185.'
              : `${indicatifDe(draft.indicatif).chiffres} chiffres après ${draft.indicatif}.`
          }
        />
      )
    case 'email':
      return (
        <TextField
          label="Email"
          type="email"
          inputMode="email"
          autoFocus
          autoComplete="email"
          placeholder="prenom@exemple.com"
          value={draft.email}
          onChange={(e) => set('email', e.target.value)}
        />
      )
    case 'profil':
      return (
        <div className="grid gap-8">
          <TextField
            label="Profession ou activité"
            autoFocus
            autoComplete="organization-title"
            value={draft.profession}
            onChange={(e) => set('profession', e.target.value)}
          />
          <TextField
            label="Structure ou entreprise (facultatif)"
            autoComplete="organization"
            value={draft.structure}
            onChange={(e) => set('structure', e.target.value)}
          />
        </div>
      )
    case 'categorie':
      return <ChoiceCards options={CATEGORIES} value={draft.categorie} onChange={(v) => set('categorie', v)} />
    case 'motivation':
      return (
        <TextArea
          value={draft.motivation}
          onChange={(v) => set('motivation', v)}
          min={MOTIVATION_MIN}
          max={MOTIVATION_MAX}
          placeholder="Je veux rejoindre la CFLB parce que…"
        />
      )
    case 'photo':
      return (
        <FileDrop
          kind="photo"
          accept="image/jpeg,image/png,image/webp"
          file={files.photo}
          onChange={(f) => setFiles((p) => ({ ...p, photo: f }))}
        />
      )
    case 'cv':
      return <FileDrop kind="cv" accept="application/pdf" file={files.cv} onChange={(f) => setFiles((p) => ({ ...p, cv: f }))} />
    case 'engagements':
      return (
        <div className="grid gap-3">
          <Consent checked={draft.consent_image} onChange={(v) => set('consent_image', v)}>
            J’autorise la CFLB à utiliser mon image (photo et vidéo) dans le cadre de l’événement et de sa communication.
          </Consent>
          <Consent checked={draft.consent_reglement} onChange={(v) => set('consent_reglement', v)}>
            J’accepte le règlement de la CFLB 2027.
          </Consent>
          <Consent checked={draft.consent_exactitude} onChange={(v) => set('consent_exactitude', v)}>
            Je certifie que les informations fournies sont exactes.
          </Consent>
          {/* Nouvel onglet : le parcours en cours n'est pas perdu */}
          <p className="mt-3 text-sm leading-relaxed text-encre-douce">
            Pour savoir ce que nous faisons de tes données, lis notre{' '}
            <a
              href="/confidentialite"
              target="_blank"
              rel="noopener noreferrer"
              className="text-charcoal underline decoration-or decoration-2 underline-offset-4 hover:text-or-fonce"
            >
              politique de{' '}
              <span className="whitespace-nowrap">
                confidentialité
                <ExternalLink aria-hidden size={13} strokeWidth={2} className="ml-1 inline-block -translate-y-px align-middle" />
              </span>
              <span className="sr-only">(nouvel onglet)</span>
            </a>
            .
          </p>
        </div>
      )
    case 'recap': {
      const age = ageFrom(draft.date_naissance)
      const rows: [string, string, StepId][] = [
        ['Nom', `${draft.prenom} ${draft.nom}`, 'identite'],
        ['Naissance', age !== null ? `${new Date(draft.date_naissance).toLocaleDateString('fr-FR')} (${age} ans)` : '', 'naissance'],
        ['Ville', draft.ville, 'ville'],
        ['WhatsApp', `${draft.indicatif} ${draft.telephone.replace(/\s/g, '')}`, 'telephone'],
        ['Email', draft.email, 'email'],
        ['Activité', draft.structure ? `${draft.profession}, ${draft.structure}` : draft.profession, 'profil'],
        ['Catégorie', draft.categorie, 'categorie'],
        ['Motivation', draft.motivation.trim().slice(0, 140) + (draft.motivation.trim().length > 140 ? '…' : ''), 'motivation'],
        ['Photo', files.photo ? files.photo.name : 'Aucune', 'photo'],
        ['CV', files.cv ? files.cv.name : 'À ajouter', 'cv'],
      ]
      return (
        <ul className="divide-y divide-or/20 overflow-hidden rounded-3xl border border-or/25 bg-white/60 backdrop-blur-sm">
          {rows.map(([label, value, target]) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => goTo(STEPS.indexOf(target))}
                className="grid w-full grid-cols-[6.5rem_1fr] gap-4 px-5 py-4 text-left transition-colors hover:bg-white sm:grid-cols-[9rem_1fr]"
              >
                <span className="font-label text-[9px] uppercase tracking-[0.2em] text-or-fonce">{label}</span>
                <span className="break-words text-base text-charcoal">{value}</span>
              </button>
            </li>
          ))}
        </ul>
      )
    }
  }
}
