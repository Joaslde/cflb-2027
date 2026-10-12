import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CircleCheck } from 'lucide-react'
import type { Statut } from '@/lib/adminApi'
import { cn } from '@/lib/utils'
import { STATUT_DOT, STATUT_LABEL, initiales } from './format'

// Teintes de statut : sauge et brique adoucies, pour rester dans l'univers ivoire et or
const BADGE: Record<Statut, string> = {
  en_attente: 'bg-champagne text-or-fonce ring-or/40',
  acceptee: 'bg-[#e5ede0] text-[#2e5a37] ring-[#2e5a37]/20',
  refusee: 'bg-[#f4e1dd] text-[#8a2f27] ring-[#8a2f27]/20',
}

export function StatusBadge({ statut, className }: { statut: Statut; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 font-label text-[8.5px] font-medium uppercase tracking-[0.16em] ring-1 ring-inset',
        BADGE[statut],
        className,
      )}
    >
      <span aria-hidden className={cn('h-1.5 w-1.5 shrink-0 rounded-full', STATUT_DOT[statut])} />
      {STATUT_LABEL[statut]}
    </span>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('flex items-center font-label text-[10px] uppercase tracking-[0.32em] text-or-fonce', className)}>
      <span aria-hidden className="mr-3 inline-block h-px w-8 bg-current opacity-50" />
      {children}
    </p>
  )
}

/** Monogramme doré, à défaut de photo. */
export function Monogram({ prenom, nom, className }: { prenom: string; nom: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-ivoire font-display text-or-fonce ring-1 ring-or/50 shadow-[0_0_14px_rgba(212,175,55,0.25)]',
        className,
      )}
    >
      {initiales(prenom, nom)}
    </span>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn('block animate-pulse rounded-full bg-or/15', className)} />
}

export interface ToastData {
  id: number
  tone: 'succes' | 'erreur'
  message: string
}

/** Notification en haut au centre, bordure dorée fine (charte CFLB). */
export function Toast({ toast, onDone }: { toast: ToastData | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(onDone, toast.tone === 'erreur' ? 7000 : 3500)
    return () => window.clearTimeout(timer)
  }, [toast, onDone])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role={toast.tone === 'erreur' ? 'alert' : 'status'}
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-[20px] border border-or/50 bg-white/90 px-5 py-3.5 text-sm leading-snug text-charcoal shadow-[0_18px_50px_rgba(60,40,0,0.18)] backdrop-blur-xl"
          >
            {toast.tone === 'erreur' ? (
              <CircleAlert size={18} className="mt-px shrink-0 text-[#b8483c]" />
            ) : (
              <CircleCheck size={18} className="mt-px shrink-0 text-[#4c8a59]" />
            )}
            <p className="min-w-0 [overflow-wrap:anywhere]">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
