import { useCallback, useEffect, useRef, useState } from 'react'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { AdminLogin } from '@/components/admin/AdminLogin'
import { deconnecter, sessionAdmin, surChangementSession } from '@/lib/adminApi'
import { useNoIndex } from '@/lib/useNoIndex'

type Etat = 'verification' | 'deconnecte' | 'connecte'

const SESSION_EXPIREE = 'Session expirée. Saisissez à nouveau le code.'

export function AdminPage() {
  useNoIndex('Administration · CFLB 2027')
  const [etat, setEtat] = useState<Etat>('verification')
  const [notice, setNotice] = useState<string | null>(null)
  const connecte = useRef(false)
  const depart = useRef(false)

  const changerEtat = useCallback((suivant: Etat) => {
    connecte.current = suivant === 'connecte'
    setEtat(suivant)
  }, [])

  useEffect(() => {
    let actif = true
    sessionAdmin()
      .then((session) => actif && changerEtat(session ? 'connecte' : 'deconnecte'))
      .catch(() => actif && changerEtat('deconnecte'))
    // Session perdue en cours de route (jeton non renouvelé, déconnexion ailleurs)
    const stop = surChangementSession((event) => {
      if (event !== 'SIGNED_OUT' || !connecte.current) return
      if (!depart.current) setNotice(SESSION_EXPIREE)
      changerEtat('deconnecte')
    })
    return () => {
      actif = false
      stop()
    }
  }, [changerEtat])

  const quitter = useCallback(
    async (message: string | null) => {
      depart.current = true
      try {
        await deconnecter()
      } catch {
        /* la session locale est effacée même si le serveur ne répond pas */
      } finally {
        depart.current = false
        setNotice(message)
        changerEtat('deconnecte')
      }
    },
    [changerEtat],
  )

  const onLogout = useCallback(() => quitter(null), [quitter])
  const onExpired = useCallback(() => quitter(SESSION_EXPIREE), [quitter])
  const onLogin = useCallback(() => {
    setNotice(null)
    changerEtat('connecte')
  }, [changerEtat])

  if (etat === 'verification') return <div className="min-h-dvh bg-ivoire" />
  if (etat === 'deconnecte') return <AdminLogin notice={notice} onLogin={onLogin} />
  return <AdminDashboard onLogout={onLogout} onExpired={onExpired} />
}
