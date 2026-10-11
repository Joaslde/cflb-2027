import { ChevronRight, ImageIcon, Inbox, SearchX } from 'lucide-react'
import type { InscriptionResume } from '@/lib/adminApi'
import { cn } from '@/lib/utils'
import { formatDate } from './format'
import { Monogram, Skeleton, StatusBadge } from './ui'

// Colonnes du tableau : la ville rejoint la catégorie sur tablette, elle a sa colonne sur grand écran
const GRID = cn(
  'md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_6.5rem_7.75rem_1rem] md:items-center md:gap-4',
  'lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1.25fr)_minmax(0,1fr)_6.5rem_7.75rem_1rem]',
)

interface Props {
  items: InscriptionResume[] | null
  activeId: string | null
  emptyMessage: string
  searching: boolean
  onOpen: (item: InscriptionResume) => void
}

export function InscriptionList({ items, activeId, emptyMessage, searching, onOpen }: Props) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-white/70 shadow-[0_24px_70px_rgba(90,68,16,0.1)] ring-1 ring-or/20">
      <div
        aria-hidden
        className={cn(
          GRID,
          'hidden border-b border-or/15 py-3.5 pl-[5.25rem] pr-6 font-tech text-[8.5px] uppercase tracking-[0.24em] text-encre-douce/75',
        )}
      >
        <span>Candidate</span>
        <span>
          Catégorie<span className="lg:hidden"> et ville</span>
        </span>
        <span className="hidden lg:block">Ville</span>
        <span>Dépôt</span>
        <span>Statut</span>
        <span />
      </div>

      {items === null ? (
        <ul aria-label="Chargement des candidatures" className="divide-y divide-or/10">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-5 md:px-6">
              <Skeleton className="h-11 w-11 shrink-0" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="h-2.5 w-3/5 opacity-70" />
              </div>
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          {searching ? (
            <SearchX size={28} strokeWidth={1.4} className="text-or-fonce" />
          ) : (
            <Inbox size={28} strokeWidth={1.4} className="text-or-fonce" />
          )}
          <p className="mt-4 max-w-sm font-display text-2xl leading-tight text-charcoal">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="divide-y divide-or/10">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpen(item)}
                className={cn(
                  'group flex w-full items-start gap-4 px-5 py-4 text-left transition-colors md:px-6',
                  'hover:bg-champagne/45 focus-visible:bg-champagne/45 focus-visible:outline-none',
                  activeId === item.id && 'bg-champagne/60',
                )}
              >
                <Monogram prenom={item.prenom} nom={item.nom} className="mt-0.5 h-11 w-11 text-lg md:mt-0" />

                {/* Mobile : fiche empilée */}
                <div className="min-w-0 flex-1 md:hidden">
                  <p className="truncate text-[16px] font-medium leading-snug text-charcoal">
                    {item.prenom} {item.nom}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-encre-douce">
                    {item.categorie} · {item.ville}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <StatusBadge statut={item.statut} />
                    <span className="text-xs text-encre-douce/80">{formatDate(item.created_at)}</span>
                  </div>
                </div>

                {/* Ordinateur et tablette : ligne de tableau */}
                <div className={cn(GRID, 'hidden min-w-0 flex-1')}>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium leading-snug text-charcoal">
                      {item.prenom} {item.nom}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-encre-douce">
                      <span className="truncate">{item.email}</span>
                      {item.photo_url && (
                        <span title="Photo fournie" className="shrink-0 text-or-fonce">
                          <ImageIcon size={12} aria-hidden />
                          <span className="sr-only">Photo fournie</span>
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-charcoal/85">{item.categorie}</p>
                    <p className="truncate text-xs text-encre-douce lg:hidden">{item.ville}</p>
                  </div>
                  <p className="hidden truncate text-sm text-charcoal/85 lg:block">{item.ville}</p>
                  <p className="text-sm text-encre-douce">{formatDate(item.created_at)}</p>
                  <StatusBadge statut={item.statut} className="justify-self-start" />
                  <ChevronRight
                    size={16}
                    aria-hidden
                    className="text-or-fonce/60 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-or-fonce"
                  />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
