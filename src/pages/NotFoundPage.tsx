import logo from '@/assets/logo-cflb-sm.webp'
import { GlassButton } from '@/components/liquid-glass'
import { useNoIndex } from '@/lib/useNoIndex'

export function NotFoundPage() {
  useNoIndex('Page introuvable · CFLB 2027')
  return (
    <main
      data-glass-backdrop
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-16 text-center text-charcoal"
      style={{ background: 'radial-gradient(ellipse at 50% 35%, #fffdf8 0%, #f4ecdd 52%, #e3d2b2 100%)' }}
    >
      {/* Filigrane */}
      <p
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.2em] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-hero font-black text-or-fonce"
        style={{ fontSize: 'clamp(7rem, 40vw, 26rem)', opacity: 0.06, letterSpacing: '-0.04em', lineHeight: 1 }}
      >
        404
      </p>

      <div className="relative max-w-xl">
        <img src={logo} alt="Conférence des Femmes Leaders du Bénin" className="mx-auto h-16 w-16 object-contain" />
        <p className="mt-8 font-tech text-[10px] uppercase tracking-[0.32em] text-or-fonce">Erreur 404</p>
        <h1 className="mt-5 font-display text-5xl leading-[0.95] sm:text-7xl">Cette page n’existe pas.</h1>
        <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-encre-douce">
          Le lien est peut-être incomplet, ou la page a été déplacée. Retrouve la CFLB 2027 depuis l’accueil.
        </p>
        {/* Hauteur fixe : le verre retire le bouton de sa capture, la zone ne doit pas se replier */}
        <div className="mt-10 flex h-14 justify-center">
          <GlassButton href="/" variant="or" size="lg">
            Retour à l’accueil
          </GlassButton>
        </div>
      </div>
    </main>
  )
}
