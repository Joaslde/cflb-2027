import { Suspense, lazy, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { NotFoundPage } from './NotFoundPage'

/*
 * Toute adresse inconnue passe par ici. L'administration ne répond qu'à une
 * adresse secrète, dont seule l'empreinte SHA-256 figure dans le code.
 * Les autres adresses affichent la page 404.
 */
const ADMIN_PATH_SHA256 = '7321bbdff7ea0b59eaf652acbd9a2b4a7a1c38e200f6c1fe56195ae43a5c9bca'

// Chargée à part : le code de l'administration n'est pas envoyé aux visiteuses du site
const AdminPage = lazy(() => import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })))

async function sha256Hex(texte: string): Promise<string> {
  const empreinte = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte))
  return Array.from(new Uint8Array(empreinte), (b) => b.toString(16).padStart(2, '0')).join('')
}

const subtleDisponible = () => typeof crypto !== 'undefined' && Boolean(crypto.subtle)

export function SecretGate() {
  const { pathname } = useLocation()
  const [verdict, setVerdict] = useState<{ pathname: string; admin: boolean } | null>(null)

  useEffect(() => {
    if (!subtleDisponible()) return
    let actif = true
    const chemin = pathname.replace(/\/+$/, '')
    sha256Hex(chemin)
      .then((h) => actif && setVerdict({ pathname, admin: h === ADMIN_PATH_SHA256 }))
      .catch(() => actif && setVerdict({ pathname, admin: false }))
    return () => {
      actif = false
    }
  }, [pathname])

  if (!subtleDisponible()) return <NotFoundPage />
  // Calcul en cours (quelques millisecondes) : rien à afficher
  if (verdict?.pathname !== pathname) return null
  if (!verdict.admin) return <NotFoundPage />
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ivoire" />}>
      <AdminPage />
    </Suspense>
  )
}
