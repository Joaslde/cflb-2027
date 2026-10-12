import { useEffect } from 'react'

/*
 * Titre, description, adresse canonique et aperçu de partage propres à une page.
 * Les valeurs d'index.html sont restaurées en quittant la page.
 */
export function usePageMeta({ titre, description, chemin }: { titre: string; description: string; chemin: string }) {
  useEffect(() => {
    // L'adresse du site est déjà dans la balise canonique (remplacée à la compilation)
    const canonique = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const base = canonique ? new URL(canonique.href).origin : window.location.origin

    const remplacer = (selecteur: string, attribut: string, valeur: string) => {
      const el = document.querySelector(selecteur)
      if (!el) return () => {}
      const avant = el.getAttribute(attribut)
      el.setAttribute(attribut, valeur)
      return () => {
        if (avant !== null) el.setAttribute(attribut, avant)
      }
    }

    const titreAvant = document.title
    document.title = titre
    const restaurations = [
      remplacer('meta[name="description"]', 'content', description),
      remplacer('link[rel="canonical"]', 'href', base + chemin),
      remplacer('meta[property="og:url"]', 'content', base + chemin),
      remplacer('meta[property="og:title"]', 'content', titre),
      remplacer('meta[property="og:description"]', 'content', description),
      remplacer('meta[name="twitter:title"]', 'content', titre),
      remplacer('meta[name="twitter:description"]', 'content', description),
    ]
    return () => {
      document.title = titreAvant
      restaurations.forEach((r) => r())
    }
  }, [titre, description, chemin])
}
