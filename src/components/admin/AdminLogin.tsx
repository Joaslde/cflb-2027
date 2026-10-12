import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import logo from '@/assets/logo-cflb-sm.webp'
import { GlassButton } from '@/components/liquid-glass'
import { AdminApiError, PIN_LONGUEUR, connecter, messageConfiguration } from '@/lib/adminApi'
import { CONFIG_MANQUANTE } from '@/lib/adminSupabase'
import { cn } from '@/lib/utils'
import { Eyebrow } from './ui'

const FOND = 'radial-gradient(ellipse at 50% 30%, #fffdf8 0%, #f4ecdd 52%, #e3d2b2 100%)'
const VIDE = Array<string>(PIN_LONGUEUR).fill('')
const chiffresDe = (texte: string) => texte.replace(/\D/g, '')

export function AdminLogin({ notice, onLogin }: { notice: string | null; onLogin: () => void }) {
  const [cases, setCases] = useState<string[]>(VIDE)
  const [busy, setBusy] = useState(false)
  // Configuration absente : on le dit tout de suite plutôt qu'au premier essai
  const [error, setError] = useState<string | null>(() => (CONFIG_MANQUANTE.length ? messageConfiguration() : null))
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const secousse = useAnimationControls()
  const sansAnimation = useReducedMotion()

  const focusCase = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(PIN_LONGUEUR - 1, i))]
    el?.focus()
    el?.select()
  }

  const envoyer = async (pin: string) => {
    if (busy) return
    if (pin.length !== PIN_LONGUEUR) {
      setError(`Saisissez les ${PIN_LONGUEUR} chiffres du code.`)
      focusCase(cases.findIndex((c) => !c))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await connecter(pin)
      onLogin()
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Connexion impossible. Réessayez dans un instant.')
      setCases(VIDE)
      setBusy(false)
      // L'état "busy" doit être levé avant de pouvoir redonner le focus aux cases
      window.setTimeout(() => focusCase(0), 0)
      if (!sansAnimation) secousse.start({ x: [0, -12, 11, -8, 6, -3, 0], transition: { duration: 0.45 } })
    }
  }

  // Écrit des chiffres à partir d'une case (frappe, saisie automatique ou collage)
  const ecrire = (depuis: number, saisie: string) => {
    const chiffres = chiffresDe(saisie)
    if (!chiffres) return
    // Un code complet collé ou proposé par le système remplit tout depuis la première case
    const debut = chiffres.length >= PIN_LONGUEUR ? 0 : depuis
    const suivantes = [...cases]
    chiffres
      .slice(0, PIN_LONGUEUR - debut)
      .split('')
      .forEach((c, k) => (suivantes[debut + k] = c))
    setCases(suivantes)
    if (!CONFIG_MANQUANTE.length) setError(null)
    const pin = suivantes.join('')
    if (pin.length === PIN_LONGUEUR) {
      refs.current[PIN_LONGUEUR - 1]?.blur()
      envoyer(pin)
    } else focusCase(Math.min(debut + chiffres.length, PIN_LONGUEUR - 1))
  }

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const suivantes = [...cases]
      // Case vide : on recule d'une case et on l'efface
      const cible = cases[i] ? i : Math.max(0, i - 1)
      suivantes[cible] = ''
      setCases(suivantes)
      focusCase(cible)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusCase(i - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusCase(i + 1)
    }
  }

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    ecrire(i, e.clipboardData.getData('text'))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    envoyer(cases.join(''))
  }

  const message = error ?? notice

  return (
    <main
      data-glass-backdrop
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-16 text-charcoal sm:px-8"
      style={{ background: FOND }}
    >
      {/* Filigrane */}
      <p
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.2em] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-hero font-black text-or-fonce"
        style={{ fontSize: 'clamp(4rem, 19vw, 16rem)', opacity: 0.06, letterSpacing: '-0.04em', lineHeight: 1 }}
      >
        CFLB 2027
      </p>

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Conférence des Femmes Leaders du Bénin" className="h-16 w-16 object-contain" />
          <Eyebrow className="mt-8">Espace administration</Eyebrow>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] sm:text-6xl">Candidatures 2027</h1>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-encre-douce">
            Accès réservé à l’équipe d’organisation de la CFLB.
          </p>
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="mt-10 rounded-[28px] bg-white/65 p-6 shadow-[0_30px_80px_rgba(90,68,16,0.14)] ring-1 ring-or/25 backdrop-blur-xl sm:p-8"
        >
          <fieldset disabled={busy}>
            <legend className="mx-auto font-label text-[10px] uppercase tracking-[0.28em] text-encre-douce">Code d’accès</legend>
            <motion.div animate={secousse} className="mx-auto mt-4 grid max-w-[21rem] grid-cols-5 gap-2 sm:gap-3">
              {cases.map((valeur, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  autoFocus={i === 0}
                  value={valeur}
                  aria-label={`Chiffre ${i + 1} sur ${PIN_LONGUEUR}`}
                  aria-invalid={Boolean(error)}
                  aria-describedby="admin-pin-message"
                  onChange={(e) => {
                    const brut = chiffresDe(e.target.value)
                    // La frappe s'ajoute au chiffre présent : on garde le dernier tapé
                    ecrire(i, brut.length === 2 && valeur ? brut.replace(valeur, '') || brut.slice(-1) : brut)
                  }}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  onPaste={(e) => onPaste(i, e)}
                  onFocus={(e) => e.target.select()}
                  className={cn(
                    'h-16 w-full min-w-0 rounded-2xl border bg-ivoire/80 text-center font-label text-2xl text-charcoal caret-or outline-none transition',
                    'focus:border-or focus:bg-white focus:ring-4 focus:ring-or/15 disabled:opacity-60',
                    error ? 'border-[#b8483c]/50' : valeur ? 'border-or/60' : 'border-or/30',
                  )}
                />
              ))}
            </motion.div>
          </fieldset>

          <p
            id="admin-pin-message"
            role={error ? 'alert' : undefined}
            aria-live="polite"
            className={cn('mt-4 min-h-5 text-center text-sm', error ? 'text-[#8a2f27]' : 'text-encre-douce')}
          >
            {busy ? 'Vérification…' : message}
          </p>

          {/* Hauteur fixe : le verre retire le bouton de sa capture, le formulaire ne doit pas se replier */}
          <div className="mt-4 h-14">
            <GlassButton type="submit" variant="or" size="lg" disabled={busy} className="w-full">
              Entrer
            </GlassButton>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-encre-douce/80">La session se ferme avec cet onglet.</p>
      </div>
    </main>
  )
}
