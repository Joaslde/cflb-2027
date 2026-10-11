import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { registerGlass, type GlassParams, type GlassShape } from './renderer'

/*
 * Bouton en verre liquide (réfraction WebGL), avec repli en verre CSS
 * tant que le rendu n'est pas prêt ou si WebGL est indisponible.
 */

type Variant = 'or' | 'clair' | 'rouge'
type Surface = 'claire' | 'sombre'

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

// Réglages validés sur la démo Liquid Glass JS (panneau "Liquid Glass Controls")
const PARAMS = {
  edgeIntensity: 0.01,
  rimIntensity: 0.05,
  baseIntensity: 0.01,
  edgeDistance: 0.05,
  rimDistance: 0.2,
  baseDistance: 0.1,
  cornerBoost: 0.02,
  rippleEffect: 0.23,
  blurRadius: 1.0,
  tintOpacity: 0.21,
  warp: false,
}

const TINTS: Record<Variant, Pick<GlassParams, 'tintTop' | 'tintBottom'> & { fallback: string }> = {
  // Teinte d'origine de la démo : blanc vers gris clair
  clair: { tintTop: hex('#ffffff'), tintBottom: hex('#b3b3b3'), fallback: 'bg-white/25' },
  // Même réglage, teinte or de la charte : action principale
  or: { tintTop: hex('#fff0bf'), tintBottom: hex('#d4af37'), fallback: 'bg-[rgba(212,175,55,0.28)]' },
  // Rouge de la bulle de menu ouverte (reprise de la navbar mobile 2026)
  rouge: { tintTop: hex('#ff6b78'), tintBottom: hex('#e60417'), fallback: 'bg-[rgba(230,4,23,0.3)]' },
}

const TEXT: Record<Surface, Record<Variant, string>> = {
  claire: { clair: 'text-charcoal', or: 'text-charcoal', rouge: 'text-charcoal' },
  sombre: { clair: 'text-white', or: 'text-or-eclat', rouge: 'text-white' },
}

interface CommonProps {
  children: ReactNode
  variant?: Variant
  /** Couleur du fond sur lequel le bouton est posé (règle la couleur du texte). */
  surface?: Surface
  shape?: GlassShape
  borderRadius?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

type AsButton = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined }
type AsLink = CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string }

const SIZES = {
  sm: 'h-9 px-5 text-[10px]',
  md: 'h-11 px-7 text-[11px]',
  lg: 'h-14 px-9 text-xs',
}

export function GlassButton(props: AsButton | AsLink) {
  const {
    children,
    variant = 'clair',
    surface = 'claire',
    shape = 'pill',
    borderRadius = 16,
    size = 'md',
    className,
    ...rest
  } = props
  const hostRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const tint = TINTS[variant]

  useEffect(() => {
    const element = hostRef.current
    const canvas = canvasRef.current
    if (!element || !canvas) return
    const params = (): GlassParams => ({ ...PARAMS, shape, borderRadius, tintTop: tint.tintTop, tintBottom: tint.tintBottom })
    return registerGlass({ element, canvas, params, onReady: () => setReady(true), visible: true, ready: false, usesLive: false })
  }, [shape, borderRadius, tint])

  const classes = cn(
    'group relative isolate inline-flex select-none items-center justify-center overflow-hidden',
    'font-tech font-semibold uppercase tracking-[0.18em] whitespace-nowrap',
    'shadow-[0_18px_40px_rgba(60,40,0,0.18)] transition-transform duration-300 ease-out',
    'hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95',
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-or',
    'disabled:pointer-events-none disabled:opacity-50 disabled:grayscale',
    shape !== 'rounded' && 'rounded-full',
    shape === 'circle' && 'aspect-square px-0',
    SIZES[size],
    TEXT[surface][variant],
    className,
  )
  const style = shape === 'rounded' ? { borderRadius } : undefined

  const layers = (
    <>
      {/* Repli CSS : verre flouté, visible tant que WebGL n'a pas pris le relais */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 -z-20 border border-white/40 backdrop-blur-md transition-opacity duration-500',
          tint.fallback,
          ready && 'opacity-0',
        )}
        style={{ borderRadius: 'inherit' }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn('pointer-events-none absolute inset-0 -z-10 h-full w-full transition-opacity duration-500', ready ? 'opacity-100' : 'opacity-0')}
        style={{ borderRadius: 'inherit' }}
      />
      {/* Liseré lumineux discret */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_0_0_1px_rgba(255,255,255,0.18)]"
        style={{ borderRadius: 'inherit' }}
      />
      <span className="relative">{children}</span>
    </>
  )

  const setRef = (n: HTMLElement | null) => {
    hostRef.current = n
  }

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchor } = rest as AsLink
    if (href.startsWith('/') && !href.startsWith('//')) {
      return (
        <Link to={href} ref={setRef} data-glass className={classes} style={style} {...anchor}>
          {layers}
        </Link>
      )
    }
    return (
      <a href={href} ref={setRef} data-glass className={classes} style={style} {...anchor}>
        {layers}
      </a>
    )
  }

  const { type = 'button', ...button } = rest as AsButton
  return (
    <button type={type} ref={setRef} data-glass className={classes} style={style} {...button}>
      {layers}
    </button>
  )
}
