import { useEffect } from 'react'

/** Page à ne pas indexer : balise robots "noindex" et titre d'onglet le temps de l'affichage. */
export function useNoIndex(titre: string) {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    const precedent = document.title
    document.title = titre
    return () => {
      meta.remove()
      document.title = precedent
    }
  }, [titre])
}
