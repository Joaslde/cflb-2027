import { useEffect, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { RobotHero } from '@/components/ui/robot-hero'
import { SiteNav } from '@/components/SiteNav'
import { AppelFinal, Edition2026, Footer, LaCflb, Vision2027 } from '@/components/sections'

function useViewportHeight() {
  const [vh, setVh] = useState(() => window.innerHeight)
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return vh
}

/*
 * Effet de voile : le hero reste fixé en fond (sticky) pendant que le reste
 * du site monte par-dessus, comme un voile tiré vers le haut.
 */
export function HomePage() {
  const vh = useViewportHeight()
  const { scrollY } = useScroll()
  const heroScale = useTransform(scrollY, [0, vh], [1, 0.92])
  const heroDim = useTransform(scrollY, [0, vh], [0, 0.45])
  const [covered, setCovered] = useState(false)

  // Le robot se met en pause quand le voile le recouvre entièrement
  useMotionValueEvent(scrollY, 'change', (y) => setCovered(y > vh * 1.02))

  return (
    <>
      <SiteNav />
      <main id="top" className="relative">
        <div className="sticky top-0 h-dvh min-h-[540px] overflow-hidden bg-champagne">
          <motion.div style={{ scale: heroScale }} className="h-full origin-[50%_30%]">
            <RobotHero paused={covered} />
          </motion.div>
          <motion.div aria-hidden style={{ opacity: heroDim }} className="pointer-events-none absolute inset-0 bg-[#2b2210]" />
        </div>

        {/* Le voile */}
        <div className="relative z-10 rounded-t-[2.5rem] bg-ivoire shadow-[0_-40px_90px_rgba(90,68,16,0.22)] sm:rounded-t-[3.5rem]">
          {/* Ourlet doré du voile */}
          <div aria-hidden className="absolute left-1/2 top-4 h-1 w-16 -translate-x-1/2 rounded-full bg-or/60" />
          <div className="overflow-hidden rounded-t-[2.5rem] sm:rounded-t-[3.5rem]">
            <LaCflb />
            <Edition2026 />
            <Vision2027 />
            <AppelFinal />
            <Footer />
          </div>
        </div>
      </main>
    </>
  )
}
