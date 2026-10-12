import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import logo from '@/assets/logo-cflb.webp'
import { GlassButton } from '@/components/liquid-glass'

/*
 * Navbar ordinateur : deux demi-barres, le logo libre au milieu.
 * Les extrémités intérieures sont creusées en arc de cercle pour épouser
 * la couronne du logo.
 *
 * Rondeur du logo : mesurée ligne par ligne sur img/Logo CFLB.png, sur toute
 * la hauteur des barres. Le logo s'élargit vers le bas (couronne, bandeau) :
 * le cercle qui garde au moins 8 px d'écart partout a un rayon de 48,5 px
 * et un centre abaissé de 3,5 px (pour un logo de 96 px et des barres de 52 px).
 */
const LOGO_SIZE = 96
const ARC_RADIUS = 48.5
const ARC_CENTER_DY = 3.5
const BAR_HEIGHT = 52
// Écartement des barres au survol du logo
const SPREAD = 12

/** Contour d'une demi-barre : bout extérieur arrondi, bout intérieur creusé. */
function barPath(side: 'gauche' | 'droite', w: number, h: number, R: number, dy: number) {
  const r = h / 2
  // Distance horizontale entre le centre du logo et les points où l'arc coupe le haut et le bas de la barre
  const insetHaut = Math.sqrt(R * R - (r + dy) ** 2)
  const insetBas = Math.sqrt(R * R - (r - dy) ** 2)
  if (side === 'gauche') {
    return `M ${r} 0 L ${w - insetHaut} 0 A ${R} ${R} 0 0 0 ${w - insetBas} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 ${r} 0 Z`
  }
  return `M ${insetHaut} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w - r} ${h} L ${insetBas} ${h} A ${R} ${R} 0 0 0 ${insetHaut} 0 Z`
}

function ConcaveBar({ side, children }: { side: 'gauche' | 'droite'; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: BAR_HEIGHT })
  const { scrollY } = useScroll()
  const bg = useTransform(scrollY, [0, 160], ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.66)'])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const d = size.w ? barPath(side, size.w, size.h, ARC_RADIUS, ARC_CENTER_DY) : ''
  // Le contenu reste hors de la découpe
  const innerPad = ARC_RADIUS + 14

  return (
    <div className="relative">
      {/* Ombre portée dessinée à part : un filtre sur un parent casserait le flou du verre */}
      {d && (
        <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={size.w} height={size.h}>
          <defs>
            <filter id={`ombre-${side}`} x="-20%" y="-50%" width="140%" height="250%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>
          <path d={d} fill="rgba(90,68,16,0.16)" transform="translate(0 10)" filter={`url(#ombre-${side})`} />
        </svg>
      )}
      <motion.div
        ref={ref}
        className="relative flex items-center gap-1 backdrop-blur-xl"
        style={{
          height: BAR_HEIGHT,
          backgroundColor: bg,
          clipPath: d ? `path('${d}')` : undefined,
          paddingLeft: side === 'gauche' ? 8 : innerPad,
          paddingRight: side === 'gauche' ? innerPad : 8,
        }}
      >
        {children}
      </motion.div>
      {d && (
        <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={size.w} height={size.h}>
          <path d={d} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />
        </svg>
      )}
    </div>
  )
}

const linkClass =
  'inline-flex h-10 items-center rounded-full px-5 font-label text-[10px] uppercase tracking-[0.22em] text-charcoal/75 transition-colors hover:bg-white/70 hover:text-charcoal'

export function DesktopNav() {
  // Survol du logo : les deux demi-barres s'écartent un peu, puis reviennent
  const [ecarte, setEcarte] = useState(false)
  const decalage = (sens: -1 | 1) => ({
    transform: `translateX(${ecarte ? sens * SPREAD : 0}px)`,
    transition: 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
  })

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden justify-center pt-6 lg:flex">
      {/* Deux colonnes égales : le point de jonction, donc le logo, est au centre de l'écran */}
      <nav aria-label="Navigation principale" className="pointer-events-auto relative inline-grid grid-cols-2 items-center">
        <div className="justify-self-end" style={decalage(-1)}>
          <ConcaveBar side="gauche">
            <a href="#edition-2026" className={linkClass}>
              Édition 2026
            </a>
            <a href="#vision-2027" className={linkClass}>
              Vision 2027
            </a>
          </ConcaveBar>
        </div>
        <div className="justify-self-start" style={decalage(1)}>
          <ConcaveBar side="droite">
            <a href="#challenge" className={linkClass}>
              Le challenge
            </a>
            <GlassButton href="/postuler" variant="or" size="sm">
              Postuler
            </GlassButton>
          </ConcaveBar>
        </div>

        <a
          href="#top"
          aria-label="Retour en haut de page"
          onMouseEnter={() => setEcarte(true)}
          onMouseLeave={() => setEcarte(false)}
          onFocus={() => setEcarte(true)}
          onBlur={() => setEcarte(false)}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 hover:scale-105"
          style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
        >
          <img src={logo} alt="CFLB" className="h-full w-full object-contain drop-shadow-[0_6px_14px_rgba(90,68,16,0.3)]" />
        </a>
      </nav>
    </header>
  )
}
