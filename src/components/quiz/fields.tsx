import { useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Check, FileText, ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full border-0 border-b-2 border-or/40 bg-transparent pb-3 pt-2 font-ui text-2xl text-charcoal outline-none transition-colors placeholder:text-charcoal/25 focus:border-or-fonce sm:text-3xl'

export function TextField({
  label,
  hint,
  autoFocus,
  ...props
}: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    // Petit délai : laisse l'animation d'entrée se terminer avant le focus
    if (!autoFocus) return
    const t = window.setTimeout(() => ref.current?.focus({ preventScroll: true }), 350)
    return () => window.clearTimeout(t)
  }, [autoFocus])
  return (
    <div>
      <label htmlFor={id} className="font-tech text-[10px] uppercase tracking-[0.25em] text-encre-douce">
        {label}
      </label>
      <input ref={ref} id={id} className={fieldBase} {...props} />
      {hint && <p className="mt-2 text-sm text-encre-douce/80">{hint}</p>}
    </div>
  )
}

export function TextArea({
  value,
  onChange,
  min,
  max,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  min: number
  max: number
  placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const n = value.trim().length
  useEffect(() => {
    const t = window.setTimeout(() => ref.current?.focus({ preventScroll: true }), 350)
    return () => window.clearTimeout(t)
  }, [])
  return (
    <div>
      <textarea
        ref={ref}
        aria-label="Ta motivation"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={7}
        maxLength={max + 200}
        className="w-full resize-none rounded-3xl border border-or/30 bg-white/60 p-5 font-ui text-lg leading-relaxed text-charcoal outline-none backdrop-blur-sm transition-colors placeholder:text-charcoal/30 focus:border-or-fonce sm:text-xl"
      />
      <div className="mt-3 flex items-center justify-between font-tech text-[10px] uppercase tracking-[0.2em]">
        <span className={n >= min ? 'text-or-fonce' : 'text-encre-douce/70'}>{n >= min ? 'Longueur suffisante' : `${min} caractères minimum`}</span>
        <span className={n > max ? 'text-red-700' : 'text-encre-douce/70'}>
          {n} / {max}
        </span>
      </div>
    </div>
  )
}

export function ChoiceCards({
  options,
  value,
  onChange,
}: {
  options: { value: string; description: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div role="radiogroup" aria-label="Catégorie" className="grid gap-3 sm:grid-cols-2">
      {options.map((o, i) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'group flex items-start gap-4 rounded-3xl border p-5 text-left transition-all duration-300',
              active ? 'border-or bg-white shadow-[0_14px_40px_rgba(90,68,16,0.14)]' : 'border-or/25 bg-white/40 hover:border-or/60 hover:bg-white/70',
            )}
          >
            <span
              className={cn(
                'mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-tech text-[9px] transition-colors',
                active ? 'border-or bg-or text-charcoal' : 'border-or/50 text-or-fonce',
              )}
            >
              {active ? <Check size={14} strokeWidth={2.5} /> : String.fromCharCode(65 + i)}
            </span>
            <span>
              <span className="block font-display text-2xl text-charcoal">{o.value}</span>
              <span className="mt-1 block text-sm text-encre-douce">{o.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function FileDrop({
  kind,
  file,
  onChange,
  accept,
}: {
  kind: 'photo' | 'cv'
  file: File | null
  onChange: (f: File | null) => void
  accept: string
}) {
  const id = useId()
  const [preview, setPreview] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)

  useEffect(() => {
    if (!file || kind !== 'photo') return setPreview(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file, kind])

  const allowed = accept.split(',').map((s) => s.trim())
  const pick = (f: File | undefined) => {
    if (f && allowed.includes(f.type)) onChange(f)
  }

  if (file) {
    return (
      <div className="flex items-center gap-5 rounded-3xl border border-or/40 bg-white/70 p-4 backdrop-blur-sm">
        {preview ? (
          <img src={preview} alt="Aperçu de ta photo" className="h-24 w-24 rounded-2xl object-cover" />
        ) : (
          <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-champagne text-or-fonce">
            <FileText size={34} strokeWidth={1.4} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-ui text-lg text-charcoal">{file.name}</p>
          <p className="text-sm text-encre-douce">{(file.size / 1024 / 1024).toFixed(1)} Mo</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Retirer le fichier"
          className="flex h-10 w-10 items-center justify-center rounded-full text-encre-douce transition-colors hover:bg-champagne hover:text-charcoal"
        >
          <X size={18} />
        </button>
      </div>
    )
  }

  const Icon = kind === 'photo' ? ImagePlus : FileText
  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDrag(false)
        pick(e.dataTransfer.files[0])
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-colors',
        drag ? 'border-or bg-white/80' : 'border-or/35 bg-white/40 hover:border-or/70 hover:bg-white/60',
      )}
    >
      <Icon size={36} strokeWidth={1.3} className="text-or-fonce" />
      <span className="font-ui text-lg text-charcoal">
        {kind === 'photo' ? 'Choisir une photo' : 'Choisir ton CV'}
      </span>
      <span className="text-sm text-encre-douce">
        {kind === 'photo' ? 'JPG, PNG ou WebP, 5 Mo maximum' : 'PDF, 5 Mo maximum'}
      </span>
      <input id={id} type="file" accept={accept} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
    </label>
  )
}

export function Consent({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-4 rounded-3xl border p-5 transition-colors',
        checked ? 'border-or bg-white' : 'border-or/25 bg-white/40 hover:bg-white/70',
      )}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-or',
          checked ? 'border-or bg-or text-charcoal' : 'border-or/50',
        )}
      >
        {checked && <Check size={14} strokeWidth={2.5} />}
      </span>
      <span className="text-base leading-relaxed text-charcoal">{children}</span>
    </label>
  )
}
