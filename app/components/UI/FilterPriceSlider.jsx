'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

export default function FilterPriceSlider({
  label = 'Ár',
  min = 0,
  max = 200000,
  step = 1000,
  paramKey = 'pricerange',
}) {
  const router = useRouter()
  const sp = useSearchParams()

  // parse URL -> [min,max] vagy "10000+" formátum
  const init = useMemo(() => {
    const raw = sp.get(paramKey) || ''
    if (!raw) return [min, max]
    if (raw.endsWith('+')) {
      const m = parseInt(raw.replace('+', ''), 10)
      return [isFinite(m) ? clamp(m, min, max) : min, max]
    }
    const [a,b] = raw.split(/-to-|-|:/).map(v => parseInt(v, 10))
    const lo = isFinite(a) ? clamp(a, min, max) : min
    const hi = isFinite(b) ? clamp(b, lo, max) : max
    return [lo, hi]
  }, [sp, paramKey, min, max])

  const [lo, setLo] = useState(init[0])
  const [hi, setHi] = useState(init[1])
  const debounce = useRef(null)

  // URL update (debounced)
  useEffect(() => {
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      const p = new URLSearchParams(window.location.search)
      if (lo <= min && hi >= max) {
        p.delete(paramKey)
      } else if (hi >= max) {
        p.set(paramKey, `${lo}+`)
      } else {
        p.set(paramKey, `${lo}-to-${hi}`)
      }
      router.push(`?${p.toString()}`)
    }, 300)
    return () => clearTimeout(debounce.current)
  }, [lo, hi, router, paramKey, min, max])

  // range track vizuál
  const percent = v => ((v - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium">{label}</div>

      <div className="relative h-8">
        {/* pálya */}
        <div className="absolute left-0 right-0 top-3 h-2 rounded bg-gray-200" />
        {/* kiválasztott sáv */}
        <div
          className="absolute top-3 h-2 rounded bg-[var(--pink)]"
          style={{ left: `${percent(lo)}%`, right: `${100 - percent(hi)}%` }}
        />
        {/* két slider (áthúzódó input range hack) */}
        <input
          type="range" min={min} max={max} step={step} value={lo}
          onChange={e => setLo(clamp(parseInt(e.target.value, 10), min, Math.min(hi, max)))}
          className="absolute left-0 right-0 top-2 w-full appearance-none bg-transparent pointer-events-auto"
        />
        <input
          type="range" min={min} max={max} step={step} value={hi}
          onChange={e => setHi(clamp(parseInt(e.target.value, 10), Math.max(lo, min), max))}
          className="absolute left-0 right-0 top-2 w-full appearance-none bg-transparent pointer-events-auto"
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-700">
        <span>{lo.toLocaleString('hu-HU')} Ft</span>
        <span>{hi >= max ? `${max.toLocaleString('hu-HU')}+ Ft` : `${hi.toLocaleString('hu-HU')} Ft`}</span>
      </div>
    </div>
  )
}
