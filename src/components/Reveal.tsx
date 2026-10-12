import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

/*
 * Effets d'apparition. Les éléments portent data-reveal pour que le verre
 * liquide les capture dans leur état final.
 */

/**
 * Vrai dès que l'élément entre à l'écran, et le reste.
 * Détecteur maison : whileInView de framer-motion rate les sauts de défilement
 * (clic dans le menu, ancre), ce qui laissait des blocs invisibles.
 */
function useApparition<T extends Element>() {
  const ref = useRef<T>(null)
  const [vu, setVu] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || vu) return
    const io = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          setVu(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [vu])
  return { ref, vu }
}

export function FadeUp({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, vu } = useApparition<HTMLDivElement>()
  // Animations réduites demandées : le bloc s'affiche directement
  const reduit = useReducedMotion()
  return (
    <motion.div
      ref={ref}
      data-reveal
      className={className}
      initial={reduit ? false : { opacity: 0, y: 28 }}
      animate={vu || reduit ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return (
    <motion.span data-reveal style={{ opacity }} className="inline-block">
      {word}&nbsp;
    </motion.span>
  )
}

/** Les mots s'allument un par un au rythme du défilement. */
export function WordReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = text.split(' ')
  return (
    <p ref={ref} className={cn('flex flex-wrap', className)}>
      {words.map((w, i) => (
        <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
      ))}
    </p>
  )
}

/** Vidéo d'ambiance chargée seulement à l'approche de l'écran. */
export function LazyVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [load, setLoad] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setLoad(true)
        if (load) entry.isIntersecting ? el.play().catch(() => {}) : el.pause()
      },
      { rootMargin: '50% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [load])

  return (
    <video
      ref={ref}
      src={load ? src : undefined}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
    />
  )
}

/**
 * Plusieurs vidéos enchaînées en boucle, sans écran noir : deux lecteurs
 * superposés, celui qui attend est déjà prêt et prend le relais en fondu.
 * Chargement seulement à l'approche de l'écran.
 */
export function VideosEnchainees({
  sources,
  className,
  vitesse = 1,
}: {
  sources: string[]
  className?: string
  /** Vitesse de lecture (1 = normale, 0.75 = plus lente) */
  vitesse?: number
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const refs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)]
  const [actif, setActif] = useState(0)
  const [indexes, setIndexes] = useState([0, sources.length > 1 ? 1 : 0])
  const [load, setLoad] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setLoad(true)
        setVisible(entry.isIntersecting)
      },
      { rootMargin: '50% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Lecture du lecteur actif quand la section est visible, pause sinon
  useEffect(() => {
    const v = refs[actif].current
    if (!v || !load) return
    if (visible) v.play().catch(() => {})
    else v.pause()
  }, [actif, load, visible]) // eslint-disable-line react-hooks/exhaustive-deps

  const suivante = () => {
    const prochain = 1 - actif
    const v = refs[prochain].current
    if (v) {
      v.currentTime = 0
      v.play().catch(() => {})
    }
    setActif(prochain)
    // Le lecteur qui vient de finir prépare la vidéo d'après
    setIndexes((ix) => {
      const copie = [...ix]
      copie[actif] = (ix[prochain] + 1) % sources.length
      return copie
    })
  }

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      {[0, 1].map((n) => (
        <video
          key={n}
          ref={refs[n]}
          src={load ? sources[indexes[n]] : undefined}
          className={cn('absolute inset-0 transition-opacity duration-700', className, actif === n ? 'opacity-100' : 'opacity-0')}
          muted
          playsInline
          preload={load ? 'auto' : 'none'}
          onEnded={actif === n ? suivante : undefined}
          // La vitesse est réinitialisée à chaque changement de source : on la réapplique
          onLoadedMetadata={(e) => (e.currentTarget.playbackRate = vitesse)}
          onPlay={(e) => (e.currentTarget.playbackRate = vitesse)}
          aria-hidden
        />
      ))}
    </div>
  )
}
