'use client'
import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Accordion from './Accordion'

/** options: [{label, value}] ; paramKey pl. "color" */
export default function AccordionFilterMulti({ title, paramKey, options = [], defaultOpen = false, suffix }) {
  const router = useRouter()
  const sp = useSearchParams()

  // URL -> kiválasztott értékek (több: "a,b,c")
  const selected = useMemo(() => {
    const raw = sp.get(paramKey) || ''
    return new Set(
      raw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    )
  }, [sp, paramKey])

  const toggle = (value) => {
    const params = new URLSearchParams(sp.toString())
    const cur = new Set((params.get(paramKey) || '').split(',').filter(Boolean))
    if (cur.has(value)) cur.delete(value); else cur.add(value)
    if (cur.size === 0) params.delete(paramKey)
    else params.set(paramKey, Array.from(cur).join(','))
    router.push(`?${params.toString()}`)
  }

  return (
    <Accordion title={title} defaultOpen={defaultOpen}>
      <div className="flex flex-col gap-2 max-h-64 overflow-auto py-2 px-2 bg-[var(--grey-bg)]">
        {options.map(opt => {
          const id = `${paramKey}-${opt.value}`
          const checked = selected.has(String(opt.value))
          return (
            <label key={opt.value} htmlFor={id} className="flex items-center gap-2 text-sm">
              <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={() => toggle(String(opt.value))}
                className="accent-[var(--pink)]"
              />
              <span>{opt.label} {suffix ? suffix:null}</span>
            </label>
          )
        })}
        {options.length === 0 && <div className="text-xs text-gray-500">Nincs elérhető opció.</div>}
      </div>
    </Accordion>
  )
}
