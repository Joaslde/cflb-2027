import { useEffect, useState } from 'react'
import { Bot, CalendarDays, House, PenLine, Telescope, type LucideIcon } from 'lucide-react'
import logo from '@/assets/logo-cflb-sm.webp'
import { GlassButton, invalidateGlass } from '@/components/liquid-glass'
import { cn } from '@/lib/utils'

/*
 * Navigation mobile, reprise de la navbar mobile 2026 :
 * une bulle dorée en bas à droite qui déploie cinq bulles en quart de cercle.
 * Le logo reste en haut au centre, dans un cercle en verre.
 */

interface Bubble {
  label: string
  href: string
  icon: LucideIcon
  // Position une fois ouverte et délai, identiques à 2026
  x: number
  y: number
  delay: number
}

const BUBBLES: Bubble[] = [
  { label: 'Accueil', href: '#top', icon: House, x: -140, y: 0, delay: 0.1 },
  { label: '2026', href: '#edition-2026', icon: CalendarDays, x: -125, y: -65, delay: 0.15 },
  { label: 'Vision', href: '#vision-2027', icon: Telescope, x: -85, y: -115, delay: 0.2 },
  { label: 'Pitch', href: '#challenge', icon: Bot, x: -30, y: -145, delay: 0.25 },
  { label: 'Postuler', href: '/postuler', icon: PenLine, x: 33, y: -155, delay: 0.3 },
]

const EASE_BUBBLE = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  // Les bulles bougent : le verre est recalculé pendant toute l'animation
  useEffect(() => {
    let raf = 0
    const end = performance.now() + 900
    const tick = () => {
      invalidateGlass()
      if (performance.now() < end) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    if (!open) return () => cancelAnimationFrame(raf)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="lg:hidden">
      {/* Logo fixe en haut au centre, encadré par l'année : 20 (logo) 27 */}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex items-center justify-center gap-3">
        <span aria-hidden className="w-12 text-right font-hero text-[1.7rem] font-black leading-none tracking-[-0.03em] text-or-fonce">
          20
        </span>
        <a
          href="#top"
          aria-label="CFLB 2027, retour en haut de page"
          className="pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/60 bg-white/35 shadow-[0_10px_30px_rgba(90,68,16,0.18)] backdrop-blur-xl"
        >
          <img src={logo} alt="CFLB" className="h-[4.1rem] w-[4.1rem] object-contain" />
        </a>
        <span aria-hidden className="w-12 font-hero text-[1.7rem] font-black leading-none tracking-[-0.03em] text-or-fonce">
          27
        </span>
      </div>

      {open && (
        <div aria-hidden className="fixed inset-0 z-[98] bg-black/30 backdrop-blur-[3px]" onClick={() => setOpen(false)} />
      )}

      <nav aria-label="Navigation principale" className="fixed bottom-[30px] right-[30px] z-[99]">
        <ul id="menu-bulles">
          {BUBBLES.map((b) => {
            const Icon = b.icon
            return (
              <li
                key={b.href}
                aria-hidden={!open}
                className="absolute bottom-[5px] right-[5px]"
                style={{
                  transform: open ? `translate(${b.x}px, ${b.y}px)` : 'translate(0, 0)',
                  opacity: open ? 1 : 0,
                  pointerEvents: open ? 'auto' : 'none',
                  transition: `transform 0.5s ${EASE_BUBBLE} ${open ? b.delay : 0}s, opacity 0.5s ${EASE_BUBBLE} ${open ? b.delay : 0}s`,
                }}
              >
                <GlassButton
                  href={b.href}
                  shape="circle"
                  variant={b.href === '/postuler' ? 'or' : 'clair'}
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                  className="h-[55px] w-[55px] flex-col tracking-normal hover:scale-100 hover:translate-y-0"
                >
                  <span className="flex flex-col items-center">
                    <Icon aria-hidden size={20} strokeWidth={1.6} />
                    <span className="mt-0.5 text-[0.5rem] font-bold uppercase">{b.label}</span>
                  </span>
                </GlassButton>
              </li>
            )
          })}
        </ul>

        <GlassButton
          shape="circle"
          variant={open ? 'rouge' : 'or'}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          aria-controls="menu-bulles"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'relative z-[101] h-[65px] w-[65px] transition-transform duration-[400ms] [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] hover:translate-y-0',
            open ? 'rotate-90 scale-90 hover:scale-90' : 'hover:scale-100',
          )}
        >
          <span aria-hidden className="flex h-[18px] w-[25px] flex-col items-end justify-between">
            {[
              open ? 'w-full translate-y-[8px] rotate-45' : 'w-full',
              open ? 'w-[70%] translate-x-5 opacity-0' : 'w-[70%]',
              open ? 'w-full -translate-y-[8px] -rotate-45' : 'w-full',
            ].map((c, i) => (
              <span
                key={i}
                className={cn('block h-[2px] rounded-[2px] bg-current transition-all duration-[400ms] [transition-timing-function:cubic-bezier(0.68,-0.6,0.32,1.6)]', c)}
              />
            ))}
          </span>
        </GlassButton>
      </nav>
    </div>
  )
}
