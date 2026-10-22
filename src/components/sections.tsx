import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import logo from '@/assets/logo-cflb-sm.webp'
import { GlassButton } from '@/components/liquid-glass'
import { FadeUp, LazyVideo, VideosEnchainees, WordReveal } from '@/components/Reveal'
import { cn } from '@/lib/utils'

function Eyebrow({ index, children, tone = 'claire' }: { index: string; children: string; tone?: 'claire' | 'sombre' }) {
  return (
    <p className={cn('font-label text-[10px] uppercase tracking-[0.32em]', tone === 'claire' ? 'text-or-fonce' : 'text-or')}>
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
            <ul className="flex flex-wrap gap-x-6 gap-y-3 font-label text-[11px] uppercase tracking-[0.2em] text-charcoal">
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
// Récit officiel de l'édition 2026 : source des informations de ce bloc
const RECIT_2026 = 'https://www.glow-empire-agency.com/conference-femmes-leaders'

const CONCOURS_2026 = [
  {
    titre: 'Reine de l’IA',
    texte: 'Pour encourager l’implication des femmes dans l’intelligence artificielle.',
    laureates: [
      ['Reine de l’IA', 'ALLI RAZAKI Raïmathou A.'],
      ['Ambassadrice de l’IA', 'AGOSSOU Foumilayo Joana Eunice'],
      ['Étoile montante de l’IA', 'APONI Houéfa Marilyne M.'],
    ],
  },
  {
    titre: 'Meilleur Styliste de l’Année',
    texte: 'Pour célébrer la créativité et l’excellence de la mode béninoise.',
    laureates: [
      ['Grand prix d’excellence', 'HOUETON Oxana Gaëlle Stella'],
      ['Grand prix d’excellence', 'FELIHO Laurienne'],
    ],
  },
]

const STATS_2026 = [
  { value: '+200', label: 'participantes' },
  { value: '2', label: 'concours' },
  { value: '17 492', label: 'votes du public' },
]

export function Edition2026() {
  return (
    <section id="edition-2026" data-glass-backdrop className="bg-ivoire px-3 pb-24 sm:px-6">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-charcoal text-white sm:rounded-[2.75rem] lg:grid-cols-[1.2fr_0.8fr]">
        {/* Vidéo d'ambiance en couleur, cadrée sur le visage, fondue dans le bloc */}
        <div className="relative h-[52vh] min-h-[320px] lg:order-last lg:h-auto">
          <div data-glass-live className="absolute inset-0">
            <LazyVideo src="/media/scene.mp4" className="h-full w-full object-cover object-[50%_18%]" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#0e0e0e_0%,rgba(14,14,14,0.2)_45%,rgba(14,14,14,0)_70%)] lg:bg-[linear-gradient(to_right,#0e0e0e_0%,rgba(14,14,14,0.35)_35%,rgba(14,14,14,0)_70%)]" />
        </div>

        <div className="relative px-6 pb-14 pt-2 sm:px-14 lg:py-20">
          <Eyebrow index="02" tone="sombre">
            Retour sur 2026
          </Eyebrow>
          <FadeUp className="mt-6">
            {/* Chaque segment reste sur une ligne : pas de coupure au milieu d'un nom */}
            <p className="flex flex-wrap gap-x-2 gap-y-1 font-label text-[10px] uppercase tracking-[0.25em] text-white/50">
              <span className="whitespace-nowrap">2ᵉ édition ·</span>
              <span className="whitespace-nowrap">21 mars 2026 ·</span>
              <span className="whitespace-nowrap">Amphithéâtre Houdegbé ·</span>
              <span className="whitespace-nowrap">Université d’Abomey-Calavi</span>
            </p>
            <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl">
              Entrepreneuriat féminin à l’ère de <em className="text-or not-italic">l’intelligence artificielle</em>.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Plus de 200 participantes, étudiantes, entrepreneures, professionnelles et passionnées de technologie, réunies pour
              apprendre, se connecter et oser. Une journée dynamique et inspirante, rythmée par deux concours.
            </p>
          </FadeUp>

          <FadeUp delay={0.1} className="mt-12">
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-or">Célébrer celles qui osent</p>
            <div className="mt-5 grid gap-8 sm:grid-cols-2">
              {CONCOURS_2026.map((c) => (
                <div key={c.titre} className="border-l border-or/50 pl-5">
                  <p className="font-display text-2xl text-white">« {c.titre} »</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{c.texte}</p>
                  <ul className="mt-4 space-y-2">
                    {c.laureates.map(([prix, nom]) => (
                      <li key={nom} className="text-sm leading-snug">
                        <span className="block font-label text-[9px] uppercase tracking-[0.18em] text-or/80">{prix}</span>
                        <span className="text-white/90">{nom}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </FadeUp>

          {/*
            Mobile : un chiffre par ligne, libellé à côté.
            Plus large : chiffres côte à côte, chacun à sa largeur naturelle ; s'il manque
            de place, le suivant passe à la ligne (jamais de libellés qui se chevauchent).
          */}
          <FadeUp delay={0.15} className="mt-12 flex max-w-xl flex-col gap-4 border-t border-white/15 pt-8 sm:flex-row sm:flex-wrap sm:gap-x-12 sm:gap-y-6">
            {STATS_2026.map((s) => (
              <div key={s.label} className="flex items-baseline gap-4 sm:block">
                <p className="min-w-[5.5rem] font-label text-3xl text-or sm:min-w-0 sm:text-4xl">{s.value}</p>
                <p className="whitespace-nowrap text-xs uppercase tracking-[0.18em] text-white/55 sm:mt-2">{s.label}</p>
              </div>
            ))}
          </FadeUp>

          <FadeUp delay={0.2} className="mt-12 flex flex-col items-start gap-6">
            <p className="max-w-md font-display text-2xl leading-snug text-white/90">
              En 2026, l’intelligence artificielle. En 2027, la robotique entre en scène.
            </p>
            <a
              href={RECIT_2026}
              target="_blank"
              rel="noopener noreferrer"
              className="group font-label text-[10px] uppercase leading-relaxed tracking-[0.22em] text-or underline-offset-[6px] hover:underline"
            >
              Lire le récit complet de l’édition{' '}
              {/* Icône de lien externe collée au dernier mot : jamais seule sur une ligne */}
              <span className="whitespace-nowrap">
                2026
                <ExternalLink
                  aria-hidden
                  size={13}
                  strokeWidth={2}
                  className="ml-1.5 inline-block -translate-y-px align-middle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
              <span className="sr-only">(nouvel onglet)</span>
            </a>
            <GlassButton href="/postuler" variant="clair" surface="sombre" size="md">
              Postuler pour 2027
            </GlassButton>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

/* 03 · Vision 2027 (résumé de docs/cflb-2027.txt) */
const MOTS_CLES_2027 = [
  'Leadership',
  'Innovation',
  'Robotique',
  'Entrepreneuriat',
  'Gouvernance',
  'Nouvelles technologies',
  'Mentorat',
  'Réseautage',
]

const CHIFFRES_2027 = [
  { valeur: '20.03', legende: '20 mars 2027' },
  { valeur: '1 000', legende: 'participants attendus' },
  { valeur: '1', legende: 'initiative phare : le Robot-Pitch Challenge' },
]

const OBJECTIFS_2027 = [
  'Promouvoir le leadership féminin et la participation des femmes à la gouvernance.',
  'Encourager l’innovation, la robotique et l’appropriation des nouvelles technologies.',
  'Stimuler la créativité et l’esprit entrepreneurial chez les jeunes.',
  'Valoriser les projets innovants et les idées qui répondent aux défis de la société.',
  'Développer les compétences en communication, en argumentation et en présentation de projets.',
  'Encourager la participation des jeunes femmes aux secteurs scientifiques et technologiques.',
  'Favoriser les rencontres, le mentorat et le réseautage.',
]

/** Bandeau qui défile en continu (le contenu est doublé pour boucler sans saut). */
function Defilement({ items }: { items: string[] }) {
  const suite = [...items, ...items]
  return (
    <div className="relative overflow-hidden border-y border-or/30 py-5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <ul className="defilement flex w-max items-center gap-10">
        {suite.map((t, i) => (
          <li key={i} aria-hidden={i >= items.length} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-display text-3xl text-charcoal sm:text-4xl">{t}</span>
            <span className="h-2 w-2 rotate-45 bg-or" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Vision2027() {
  return (
    <section id="vision-2027" data-glass-backdrop className="bg-ivoire pb-28 pt-10">
      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <Eyebrow index="03">Vision 2027</Eyebrow>

        <div className="mt-8 grid items-end gap-10 lg:grid-cols-[1.3fr_1fr]">
          <FadeUp>
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-encre-douce">Le thème de la 3ᵉ édition</p>
            <h2 className="mt-4 font-display text-6xl leading-[0.92] text-charcoal sm:text-8xl lg:text-[8.5rem]">
              Femmes
              <br />
              <span className="text-or-fonce">d’Impact</span>
            </h2>
            <p className="mt-6 max-w-lg font-display text-2xl leading-snug text-charcoal sm:text-3xl">
              Leadership, Innovation et Gouvernance au service du Bénin de demain.
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="text-lg leading-relaxed text-encre-douce">
              La troisième édition réunira 1 000 participants autour du leadership féminin, de l’innovation, de
              l’entrepreneuriat et de la gouvernance. Elle met en lumière le rôle des femmes dans la transformation économique et
              sociale du Bénin, avec une place forte pour la jeunesse, la créativité et les nouvelles technologies.
            </p>
          </FadeUp>
        </div>

        <FadeUp className="mt-14 grid gap-6 border-t border-or/30 pt-8 sm:grid-cols-3">
          {CHIFFRES_2027.map((c) => (
            <div key={c.legende}>
              <p className="font-label text-4xl text-charcoal">{c.valeur}</p>
              <p className="mt-2 text-sm uppercase tracking-[0.16em] text-encre-douce">{c.legende}</p>
            </div>
          ))}
        </FadeUp>
      </div>

      <div className="mt-20">
        <Defilement items={MOTS_CLES_2027} />
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <FadeUp>
            <h3 className="font-display text-4xl leading-tight text-charcoal sm:text-5xl">Sept objectifs</h3>
            <p className="mt-4 max-w-xs text-encre-douce">Ce que la CFLB 2027 veut faire bouger.</p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <ol className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {OBJECTIFS_2027.map((o, i) => (
                <li key={o} className="flex gap-4">
                  <span className="pt-1 font-label text-[10px] text-or-fonce">{String(i + 1).padStart(2, '0')}</span>
                  <span className="leading-relaxed text-charcoal">{o}</span>
                </li>
              ))}
            </ol>
          </FadeUp>
        </div>

        <FadeUp className="mt-20">
          <blockquote className="mx-auto max-w-4xl text-center font-display text-3xl leading-snug text-charcoal sm:text-5xl">
            Faire du leadership un levier de transformation, et de l’innovation un{' '}
            <span className="text-or-fonce">moteur de progrès</span>.
          </blockquote>
        </FadeUp>
      </div>
    </section>
  )
}

/* 04 · Le CFLB Robot-Pitch Challenge 2027 : l'initiative phare, ce pour quoi on candidate */
const ETAPES_CHALLENGE = [
  {
    titre: 'Une idée',
    texte:
      'Un projet ou une idée innovante, porteuse d’une solution concrète. La robotique et les nouvelles technologies sont à l’honneur.',
  },
  { titre: 'Un pitch', texte: 'Une présentation courte, structurée et convaincante de ton projet.' },
  { titre: 'Un jury', texte: 'Tu présentes ton prototype, ou son schéma, et tu défends ton idée devant un jury.' },
]

/* Ce que la candidate apporte devant le jury : au minimum un schéma, au mieux un prototype qui fonctionne */
const LIVRABLES = [
  {
    titre: 'Un prototype fonctionnel',
    texte: 'Ton projet existe et fonctionne : tu le montres en action au jury.',
  },
  {
    titre: 'Un prototype en cours',
    texte: 'Une partie fonctionne déjà : tu montres où tu en es et ce qu’il reste à construire.',
  },
  {
    titre: 'Le schéma du prototype',
    texte: 'Un plan, un croquis ou une maquette qui explique clairement comment ton projet fonctionnera.',
  },
]

const COMPETENCES = ['Prise de parole', 'Esprit critique', 'Créativité', 'Défendre ses idées']

export function RobotPitch() {
  return (
    <section id="challenge" data-glass-backdrop className="bg-ivoire px-5 pb-28 sm:px-10">
      <div className="mx-auto max-w-6xl border-t border-or/30 pt-20">
        <Eyebrow index="04">L’initiative phare</Eyebrow>
        <FadeUp>
          <h2 className="mt-8 font-display text-5xl leading-[0.98] text-charcoal sm:text-7xl lg:text-8xl">
            CFLB Robot-Pitch
            <br />
            <span className="text-or-fonce">Challenge 2027</span>
          </h2>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-encre-douce">
            L’innovation au service de l’avenir. Un challenge pour stimuler l’esprit d’innovation, la créativité et l’audace des
            jeunes talents, et faire entrer les jeunes femmes dans les sciences, la technologie et l’entrepreneuriat.
          </p>
        </FadeUp>

        {/* Le principe en trois temps */}
        <ol className="mt-16 grid gap-px overflow-hidden rounded-[2rem] border border-or/30 bg-or/30 md:grid-cols-3">
          {ETAPES_CHALLENGE.map((e, i) => (
            <li key={e.titre} className="bg-ivoire p-8 sm:p-10">
              <FadeUp delay={i * 0.08}>
                <p className="font-label text-5xl text-or/50">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-6 font-display text-4xl text-charcoal">{e.titre}</p>
                <p className="mt-3 leading-relaxed text-encre-douce">{e.texte}</p>
              </FadeUp>
            </li>
          ))}
        </ol>

        {/* Ce qu'on attend concrètement le jour J */}
        <div id="ce-que-tu-presentes" className="mt-16 rounded-[2rem] bg-charcoal p-8 text-ivoire sm:p-12">
          <FadeUp>
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-or">Obligatoire · Le jour du challenge</p>
            <h3 className="mt-5 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
              Tu viens avec quelque chose de concret à montrer.
            </h3>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ivoire/80">
              Une idée seule ne suffit pas : tu soumets au jury l’objet de ton projet. Il n’a pas besoin d’être terminé. Tu
              présentes l’une de ces trois formes, et c’est ta capacité à la porter qui doit te donner envie de candidater.
            </p>
          </FadeUp>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {LIVRABLES.map((l, i) => (
              <li key={l.titre} className="rounded-2xl border border-or/40 bg-white/5 p-6">
                <FadeUp delay={i * 0.08}>
                  <p className="font-display text-2xl text-or">{l.titre}</p>
                  <p className="mt-3 leading-relaxed text-ivoire/80">{l.texte}</p>
                </FadeUp>
              </li>
            ))}
          </ul>
          <FadeUp>
            <p className="mt-8 text-base leading-relaxed text-ivoire">
              <span className="font-semibold text-or">Le minimum demandé :</span> un schéma clair de ton prototype.
            </p>
          </FadeUp>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <FadeUp>
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-or-fonce">Ce que tu y développes</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {COMPETENCES.map((c) => (
                <li key={c} className="rounded-full border border-or/40 bg-white/60 px-5 py-2.5 font-display text-xl text-charcoal">
                  {c}
                </li>
              ))}
            </ul>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-or-fonce">Au-delà de la compétition</p>
            <p className="mt-6 text-lg leading-relaxed text-encre-douce">
              Révéler des talents, valoriser l’intelligence créative et faire grandir une culture de l’innovation tournée vers
              les défis du Bénin de demain.
            </p>
          </FadeUp>
        </div>

        <FadeUp className="mt-14 flex justify-center">
          <GlassButton href="/postuler" variant="or" size="lg">
            Je relève le défi
          </GlassButton>
        </FadeUp>
      </div>
    </section>
  )
}

/* 05 · Pour qui ? */
const PROFILS = ['étudiante', 'entrepreneure', 'passionnée de technologie', 'porteuse de projet']

const CANDIDATES_POSSIBLES = [
  { titre: 'Étudiantes', texte: 'Tu as une idée innovante et tu veux la confronter à un vrai jury.' },
  { titre: 'Entrepreneures', texte: 'Tu portes une activité ou une solution et tu veux la faire connaître.' },
  { titre: 'Professionnelles', texte: 'Tu as un projet qui peut répondre à un défi de la société.' },
  { titre: 'Porteuses de projet', texte: 'Ton idée est encore jeune et tu cherches l’élan pour la lancer.' },
]

const DANS_LA_SALLE = ['Femmes leaders', 'Entrepreneures', 'Dirigeantes', 'Professionnelles', 'Étudiantes', 'Porteurs de projets']

function MotTournant({ mots }: { mots: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setI((n) => (n + 1) % mots.length), 2200)
    return () => window.clearInterval(t)
  }, [mots.length])
  return (
    <span className="inline-grid">
      {/* Le mot le plus long réserve la place : le titre ne bouge pas */}
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {mots.reduce((a, b) => (b.length > a.length ? b : a))}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mots[i]}
          initial={{ y: '60%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-60%', opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="col-start-1 row-start-1 text-or-fonce"
        >
          {mots[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function PourQui() {
  return (
    <section id="pour-qui" data-glass-backdrop className="bg-ivoire px-5 pb-28 sm:px-10">
      <div className="mx-auto max-w-6xl border-t border-or/30 pt-20">
        <Eyebrow index="05">Pour qui ?</Eyebrow>
        <FadeUp>
          <h2 className="mt-8 max-w-5xl font-display text-5xl leading-[1.02] text-charcoal sm:text-7xl">
            Le challenge est fait pour toi si tu es
            {/* Le mot qui change a sa propre ligne : rien ne bouge autour de lui */}
            <span className="block">
              <MotTournant mots={PROFILS} />.
            </span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-encre-douce">
            Le Robot-Pitch Challenge s’adresse aux jeunes femmes qui ont une idée ou un projet innovant, et l’envie de le
            défendre.
          </p>
        </FadeUp>

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <FadeUp>
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-or-fonce">Qui peut candidater</p>
            <ul className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {CANDIDATES_POSSIBLES.map((c) => (
                <li key={c.titre} className="border-l-2 border-or pl-5">
                  <p className="font-display text-2xl text-charcoal">{c.titre}</p>
                  <p className="mt-2 leading-relaxed text-encre-douce">{c.texte}</p>
                </li>
              ))}
            </ul>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-or-fonce">Qui sera dans la salle</p>
            <p className="mt-6 text-lg leading-relaxed text-encre-douce">
              1 000 participants réunis autour du leadership féminin, de l’innovation, de l’entrepreneuriat et de la
              gouvernance :
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {DANS_LA_SALLE.map((p) => (
                <li key={p} className="rounded-full border border-or/40 bg-white/60 px-4 py-2 text-sm text-charcoal">
                  {p}
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

/* 06 · Pourquoi candidater ? */
const RAISONS = [
  {
    titre: 'Être révélée',
    texte: 'Le challenge veut révéler des talents et valoriser l’intelligence créative. La tienne a sa place.',
  },
  {
    titre: 'Te dépasser',
    texte: 'Prise de parole, argumentation, esprit critique : des compétences qui grandissent avec ton pitch.',
  },
  {
    titre: 'Être entourée',
    texte: 'Rencontres, mentorat et réseautage avec des femmes leaders et des professionnels.',
  },
  {
    titre: 'Compter pour demain',
    texte: 'Ton idée peut répondre aux défis du Bénin de demain. C’est le moment de la porter.',
  },
]

export function PourquoiCandidater() {
  return (
    <section id="pourquoi" data-glass-backdrop className="bg-ivoire px-5 pb-32 sm:px-10">
      <div className="mx-auto max-w-6xl border-t border-or/30 pt-20">
        <Eyebrow index="06">Pourquoi candidater ?</Eyebrow>
        <FadeUp>
          <h2 className="mt-8 max-w-3xl font-display text-5xl leading-[1.02] text-charcoal sm:text-7xl">
            Ce que le challenge peut t’apporter.
          </h2>
        </FadeUp>
        <ol className="mt-16 grid gap-px overflow-hidden rounded-[2rem] border border-or/30 bg-or/30 sm:grid-cols-2">
          {RAISONS.map((r, i) => (
            <li key={r.titre} className="bg-ivoire p-8 sm:p-10">
              <FadeUp delay={i * 0.06}>
                <p className="font-label text-xs text-or-fonce">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-6 font-display text-4xl text-charcoal">{r.titre}</p>
                <p className="mt-3 max-w-sm text-lg leading-relaxed text-encre-douce">{r.texte}</p>
              </FadeUp>
            </li>
          ))}
        </ol>
        <FadeUp className="mt-14 flex justify-center">
          <GlassButton href="/postuler" variant="or" size="lg">
            Je veux en être
          </GlassButton>
        </FadeUp>
      </div>
    </section>
  )
}

/* 07 · Appel final sur fond or, portrait en bichromie */
export function AppelFinal() {
  return (
    <section id="postuler" data-glass-backdrop className="relative overflow-hidden bg-[#e2c25a]">
      {/*
        Exclu du verre : le dégradé posé par-dessus le masque presque entièrement.
        fondu-gauche : sur ordinateur, la vidéo sort progressivement de la transparence,
        sans bord net à sa gauche.
      */}
      <div data-glass-ignore className="fondu-gauche absolute inset-y-0 right-0 w-full md:w-[55%]">
        <VideosEnchainees sources={['/media/appel-1.mp4', '/media/appel-2.mp4']} vitesse={0.6} className="h-full w-full object-cover object-top" />
      </div>
      {/* Voile or : uniforme et léger sur mobile, dégradé sans cassure sur ordinateur (index.css) */}
      <div className="voile-appel absolute inset-0" />

      <div className="relative mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-5 py-24 sm:px-10">
        <FadeUp>
          <p className="font-label text-[10px] uppercase tracking-[0.32em] text-charcoal/60">Candidatures ouvertes</p>
          <h2 className="mt-6 max-w-3xl font-display text-6xl leading-[0.95] text-charcoal sm:text-8xl">
            Ton idée mérite la scène.
          </h2>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-charcoal/80">
            Les candidatures au CFLB Robot-Pitch Challenge 2027 sont ouvertes. Quelques questions, une à une : qui tu es, ton parcours, et pourquoi tu veux relever le défi. Le jour J, tu présenteras au jury ton prototype ou, au minimum, son schéma.
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

const LIENS_FOOTER = [
  { label: 'Édition 2026', href: '#edition-2026' },
  { label: 'Vision 2027', href: '#vision-2027' },
  { label: 'Le challenge', href: '#challenge' },
  { label: 'Pour qui ?', href: '#pour-qui' },
  { label: 'Pourquoi candidater ?', href: '#pourquoi' },
]

const RENDEZ_VOUS = ['3ᵉ édition', '20 mars 2027', 'CFLB Robot-Pitch Challenge 2027', '1 000 participants attendus']

// Contact repris de la page officielle de l'édition 2026 (RECIT_2026)
const CONTACT_WHATSAPP = '+229 01 98 52 38 70'

const PORTFOLIO = 'https://joas-lde.vercel.app/'

function TitreColonne({ children }: { children: string }) {
  return <p className="font-label text-[10px] uppercase tracking-[0.25em] text-or-fonce">{children}</p>
}

const lienFooter = 'text-charcoal/80 transition-colors hover:text-or-fonce'

export function Footer() {
  return (
    <footer data-glass-backdrop className="relative overflow-hidden bg-ivoire px-5 pt-20 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 border-t border-or/30 pt-14 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          {/* Identité */}
          <div>
            <img src={logo} alt="" className="h-16 w-16 object-contain" />
            <p className="mt-5 max-w-xs font-display text-3xl leading-tight text-charcoal">Conférence des Femmes Leaders du Bénin</p>
            <p className="mt-4 max-w-xs leading-relaxed text-encre-douce">
              Former les leaders d’aujourd’hui et inspirer les bâtisseurs de demain.
            </p>
            <div className="mt-6">
              <GlassButton href="/postuler" variant="or" size="sm">
                Postuler
              </GlassButton>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:contents">
            {/* Explorer */}
            <nav aria-label="Pied de page">
              <TitreColonne>Explorer</TitreColonne>
              <ul className="mt-5 space-y-3">
                {LIENS_FOOTER.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className={lienFooter}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Le rendez-vous */}
            <div>
              <TitreColonne>Le rendez-vous</TitreColonne>
              <ul className="mt-5 space-y-3 text-charcoal/80">
                {RENDEZ_VOUS.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>

            {/* En savoir plus */}
            <div className="col-span-2 sm:col-span-1">
              <TitreColonne>En savoir plus</TitreColonne>
              <ul className="mt-5 space-y-3">
                <li>
                  <a href={RECIT_2026} target="_blank" rel="noopener noreferrer" className={lienFooter}>
                    Le récit de l’édition{' '}
                    <span className="whitespace-nowrap">
                      2026
                      <ExternalLink aria-hidden size={13} strokeWidth={2} className="ml-1.5 inline-block -translate-y-px align-middle" />
                    </span>
                    <span className="sr-only">(nouvel onglet)</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${CONTACT_WHATSAPP.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={lienFooter}
                  >
                    WhatsApp : {CONTACT_WHATSAPP}
                    <span className="sr-only">(nouvel onglet)</span>
                  </a>
                </li>
                <li>
                  <a href="/confidentialite" className={lienFooter}>
                    Politique de confidentialité
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mentions */}
        <div className="mt-14 flex flex-col gap-3 border-t border-or/30 py-6 text-sm text-encre-douce sm:flex-row sm:items-center sm:justify-between">
          <p>© 2027 Conférence des Femmes Leaders du Bénin. Tous droits réservés.</p>
          <a
            href={PORTFOLIO}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-baseline gap-2 text-charcoal"
          >
            <span className="font-label text-[10px] uppercase tracking-[0.22em] text-encre-douce">Design et code par</span>
            <span className="font-display text-xl underline decoration-or decoration-2 underline-offset-4 transition-colors group-hover:text-or-fonce">
              Joas Lde
            </span>
            <ExternalLink aria-hidden size={13} strokeWidth={2} className="self-center text-or-fonce" />
            <span className="sr-only">(portfolio, nouvel onglet)</span>
          </a>
        </div>
      </div>

      {/* Grand filigrane, rogné en bas : il clôt la page sans laisser de vide */}
      <p
        aria-hidden
        className="pointer-events-none -mb-[0.24em] select-none whitespace-nowrap text-center font-hero font-black leading-[0.8] text-or-fonce"
        style={{ fontSize: 'clamp(3rem, 16.5vw, 15.5rem)', opacity: 0.12, letterSpacing: '-0.04em' }}
      >
        CFLB 2027
      </p>
    </footer>
  )
}
