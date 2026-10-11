import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import logo from '@/assets/logo-cflb-sm.webp'
import { GlassButton } from '@/components/liquid-glass'
import { FadeUp, LazyVideo, WordReveal } from '@/components/Reveal'
import { cn } from '@/lib/utils'

function Eyebrow({ index, children, tone = 'claire' }: { index: string; children: string; tone?: 'claire' | 'sombre' }) {
  return (
    <p className={cn('font-tech text-[10px] uppercase tracking-[0.32em]', tone === 'claire' ? 'text-or-fonce' : 'text-or')}>
      <span className="opacity-60">{index}</span>
      <span className="mx-3 inline-block h-px w-8 translate-y-[-3px] bg-current align-middle opacity-50" />
      {children}
    </p>
  )
}

/* 01 · La CFLB, en très bref */
export function LaCflb() {
  return (
    <section id="la-cflb" data-glass-backdrop className="bg-ivoire px-5 pb-28 pt-24 sm:px-10 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <Eyebrow index="01">La CFLB</Eyebrow>
        <WordReveal
          text="Former les leaders d’aujourd’hui et inspirer les bâtisseurs de demain."
          className="mt-8 max-w-5xl font-display text-[2.6rem] leading-[1.02] text-charcoal sm:text-7xl lg:text-[6.2rem]"
        />
        <div className="mt-16 grid gap-10 border-t border-or/30 pt-10 md:grid-cols-[1.2fr_1fr]">
          <FadeUp>
            <p className="max-w-xl text-lg leading-relaxed text-encre-douce">
              La Conférence des Femmes Leaders du Bénin réunit femmes leaders, entrepreneures, dirigeantes, étudiantes et porteuses de
              projets autour d’une même ambition : faire émerger une génération de femmes capables d’innover, d’entreprendre et de
              diriger.
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <ul className="flex flex-wrap gap-x-6 gap-y-3 font-tech text-[11px] uppercase tracking-[0.2em] text-charcoal">
              {['Leadership', 'Entrepreneuriat', 'Innovation', 'Mentorat', 'Réseau'].map((m) => (
                <li key={m} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rotate-45 bg-or" />
                  {m}
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

/* 02 · Retour sur 2026 : bloc sombre, seule touche foncée du voile */
const STATS_2026 = [
  { value: '2ᵉ', label: 'édition' },
  { value: '18', label: 'candidates' },
  { value: '17 492', label: 'votes du public' },
]

export function Edition2026() {
  return (
    <section id="edition-2026" data-glass-backdrop className="bg-ivoire px-3 pb-24 sm:px-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-charcoal text-white sm:rounded-[2.75rem]">
        {/* Vidéo d'ambiance en fond, désaturée */}
        <div data-glass-live className="absolute inset-0">
          <LazyVideo src="/media/scene.mp4" className="h-full w-full object-cover opacity-35 grayscale" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(100deg,#0e0e0e_20%,rgba(14,14,14,0.75)_55%,rgba(14,14,14,0.35))]" />

        <div className="relative px-6 py-16 sm:px-14 sm:py-24">
          <Eyebrow index="02" tone="sombre">
            Retour sur 2026
          </Eyebrow>
          <FadeUp className="mt-6">
            <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-white/50">21 mars 2026 · Université d’Abomey-Calavi</p>
            <h2 className="mt-6 max-w-4xl font-display text-4xl leading-[1.05] sm:text-6xl">
              Entrepreneuriat féminin à l’ère de <em className="text-or not-italic">l’intelligence artificielle</em>.
            </h2>
          </FadeUp>

          <FadeUp delay={0.1} className="mt-14 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/15 pt-8">
            {STATS_2026.map((s) => (
              <div key={s.label}>
                <p className="font-tech text-2xl text-or sm:text-4xl">{s.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/55">{s.label}</p>
              </div>
            ))}
          </FadeUp>

          <FadeUp delay={0.2} className="mt-14 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md font-display text-2xl leading-snug text-white/90">
              En 2026, on parlait d’intelligence artificielle. En 2027, elle entre en scène.
            </p>
            <GlassButton href="/postuler" variant="clair" surface="sombre" size="md">
              Postuler pour 2027
            </GlassButton>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

/* 03 · Vision 2027 */
const PILIERS = [
  {
    n: '01',
    titre: 'Leadership',
    texte:
      'Inspirer la jeunesse par des parcours de réussite, favoriser le mentorat et le partage d’expériences entre générations de leaders.',
  },
  {
    n: '02',
    titre: 'Innovation',
    texte: 'Encourager la créativité, l’innovation et l’entrepreneuriat, et faire émerger de nouveaux leaders visionnaires.',
  },
  {
    n: '03',
    titre: 'Gouvernance',
    texte:
      'Promouvoir la participation des femmes à la gouvernance et valoriser leur contribution au développement du Bénin.',
  },
]

export function Vision2027() {
  const [open, setOpen] = useState(0)
  return (
    <section id="vision-2027" data-glass-backdrop className="bg-ivoire px-5 pb-32 pt-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <Eyebrow index="03">Vision 2027</Eyebrow>

        <div className="mt-8 grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
          <FadeUp>
            <h2 className="font-display text-6xl leading-[0.92] text-charcoal sm:text-8xl lg:text-[9rem]">
              Femmes
              <br />
              <span className="text-or-fonce">d’Impact</span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="text-lg leading-relaxed text-encre-douce">
              Pour sa troisième édition, la CFLB met en lumière celles qui transforment le Bénin : leadership, innovation et
              gouvernance au service du pays de demain.
            </p>
            <p className="mt-8 flex items-baseline gap-3">
              <span className="font-tech text-4xl text-charcoal">+1 500</span>
              <span className="text-sm uppercase tracking-[0.18em] text-encre-douce">participants attendus</span>
            </p>
          </FadeUp>
        </div>

        {/* Trois piliers : la ligne survolée ou touchée se déplie */}
        <ul className="mt-20 border-b border-or/30">
          {PILIERS.map((p, i) => (
            <li key={p.n} className="border-t border-or/30">
              <button
                type="button"
                onMouseEnter={() => setOpen(i)}
                onFocus={() => setOpen(i)}
                onClick={() => setOpen(i)}
                aria-expanded={open === i}
                className="group grid w-full grid-cols-[auto_1fr] items-baseline gap-6 py-7 text-left sm:grid-cols-[5rem_1fr_auto]"
              >
                <span className="font-tech text-xs text-or-fonce">{p.n}</span>
                <span
                  className={cn(
                    'font-display text-4xl leading-none transition-colors duration-500 sm:text-6xl',
                    open === i ? 'text-charcoal' : 'text-charcoal/25 group-hover:text-charcoal/60',
                  )}
                >
                  {p.titre}
                </span>
                <span
                  aria-hidden
                  className={cn('hidden h-3 w-3 rotate-45 border border-or transition-colors sm:block', open === i && 'bg-or')}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden sm:pl-[6.5rem]"
                  >
                    <span className="block max-w-2xl pb-8 text-lg leading-relaxed text-encre-douce">{p.texte}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>

        <FadeUp className="mt-14 flex justify-center">
          <GlassButton href="/postuler" variant="or" size="lg">
            Je veux en être
          </GlassButton>
        </FadeUp>
      </div>
    </section>
  )
}

/* 04 · Appel final sur fond or, portrait en bichromie */
export function AppelFinal() {
  return (
    <section id="postuler" data-glass-backdrop className="relative overflow-hidden bg-[#d9b443]">
      {/* Exclu du verre : le dégradé posé par-dessus le masque presque entièrement */}
      <div data-glass-ignore className="absolute inset-y-0 right-0 w-full md:w-[55%]">
        <LazyVideo src="/media/portrait.mp4" className="h-full w-full object-cover object-top grayscale mix-blend-multiply opacity-70" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#e2c25a_25%,rgba(226,194,90,0.85)_50%,rgba(226,194,90,0.1))]" />

      <div className="relative mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-5 py-24 sm:px-10">
        <FadeUp>
          <p className="font-tech text-[10px] uppercase tracking-[0.32em] text-charcoal/60">Candidatures ouvertes</p>
          <h2 className="mt-6 max-w-3xl font-display text-6xl leading-[0.95] text-charcoal sm:text-8xl">
            Ta place est sur scène.
          </h2>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-charcoal/80">
            Quelques questions, une à une : qui tu es, ton parcours, et surtout pourquoi tu veux rejoindre la CFLB 2027.
          </p>
          <div className="mt-12">
            <GlassButton href="/postuler" variant="clair" size="lg">
              Déposer ma candidature
            </GlassButton>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer data-glass-backdrop className="bg-ivoire px-5 pb-32 pt-12 sm:px-10 lg:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-4">
          <img src={logo} alt="" className="h-12 w-12 object-contain" />
          <p className="font-display text-xl text-charcoal">Conférence des Femmes Leaders du Bénin</p>
        </div>
        <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-encre-douce">© 2027 CFLB · Édition 2027</p>
      </div>
    </footer>
  )
}
