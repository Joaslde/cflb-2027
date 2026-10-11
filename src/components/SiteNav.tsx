import { DesktopNav } from '@/components/nav/DesktopNav'
import { MobileNav } from '@/components/nav/MobileNav'

/** Navigation du site : demi-barres sur ordinateur, bulles sur mobile et tablette. */
export function SiteNav() {
  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  )
}
