import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import logo from '@/assets/logo-cflb.webp'

// Durée minimale d'affichage, même si la page est déjà chargée
const MIN_DURATION_MS = 1800

export function Loader() {
  const [visible, setVisible] = useState(true)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    document.body.classList.add('is-loading')
    const start = performance.now()

    const hide = () => {
      const remaining = Math.max(0, MIN_DURATION_MS - (performance.now() - start))
      window.setTimeout(() => setVisible(false), remaining)
    }

    if (document.readyState === 'complete') hide()
    else window.addEventListener('load', hide, { once: true })

    return () => window.removeEventListener('load', hide)
  }, [])

  return (
    <AnimatePresence onExitComplete={() => document.body.classList.remove('is-loading')}>
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-or"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: reduceMotion ? 0.3 : 0.9, ease: [0.76, 0, 0.24, 1] }}
          data-glass-ignore
          aria-live="polite"
          aria-label="Chargement"
        >
          <motion.img
            src={logo}
            alt="Conférence des Femmes Leaders du Bénin"
            className="w-56 sm:w-72 drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={
              reduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, scale: [1, 1.04, 1] }
            }
            exit={{ opacity: 0, y: -40 }}
            transition={{
              opacity: { duration: 0.5 },
              scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 0.6 },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
