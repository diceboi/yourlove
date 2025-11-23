'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TbSearch } from 'react-icons/tb'
import { AnimatePresence, motion } from 'framer-motion'

// kis debounce
function useDebounced(value, delay = 250) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

function badgeColor(type) {
  switch (type) {
    case 'product': return 'bg-pink-100 text-pink-700'
    case 'category': return 'bg-emerald-100 text-emerald-700'
    case 'post': return 'bg-indigo-100 text-indigo-700'
    case 'tag': return 'bg-amber-100 text-amber-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export default function SearchBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const debounced = useDebounced(q, 200)
  const [loading, setLoading] = useState(false)
  const [popular, setPopular] = useState([])
  const [recent, setRecent] = useState([])
  const [hits, setHits] = useState([])
  const [index, setIndex] = useState(-1)
  const panelRef = useRef(null)
  const inputRef = useRef(null)

  // helyi „recent”
  useEffect(() => {
    const raw = localStorage.getItem('recentSearches') || '[]'
    try { setRecent(JSON.parse(raw)) } catch {}
  }, [])
  const pushRecent = (term) => {
    const arr = [term, ...recent.filter(r => r !== term)].slice(0, 8)
    setRecent(arr)
    localStorage.setItem('recentSearches', JSON.stringify(arr))
  }

  // 🔎 server-side naplózás (fire-and-forget)
  const trackSearch = (term) => {
    const payload = JSON.stringify({ term })
    const url = '/api/searchlog'
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon(url, blob)
    } else {
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true })
        .catch(() => {}) // szándékosan lenyeljük
    }
  }

  // dropdown javaslatok
  useEffect(() => {
    let ignore = false
    ;(async () => {
      // ha üres: top keresések az utolsó 30 napból
      if (!debounced) {
        setHits([])
        try {
          const res = await fetch(`/api/searchlog/top?days=30&limit=10`, { cache: 'no-store' })
          const js = await res.json()
          if (!ignore) setPopular(js?.top || [])
        } catch {}
        return
      }
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debounced)}&limit=6`, { cache: 'no-store' })
        const js = await res.json()
        if (!ignore) {
          const items = []
          ;(js.products || []).forEach((p) => items.push({
            type: 'product',
            id: String(p.id),
            title: p.fo_cim || p.alcim || p.seo_slug,
            subtitle: p.alcim || '',
            image: p.termekkep || '',
            href: `/termekek/${p.seo_slug}`,
          }))
          ;(js.categories || []).forEach((c) => items.push({
            type: 'category',
            id: String(c.id),
            title: c.nev,
            href: `/termekek/${c.slug}`,
          }))
          ;(js.posts || []).forEach((b) => items.push({
            type: 'post',
            id: String(b.id),
            title: b.title,
            href: `/blog/${b.slug}`,
          }))
          ;(js.tags || []).forEach((t) => items.push({
            type: 'tag',
            id: String(t.id),
            title: t.name,
            href: `/cimkek/${t.slug}`,
          }))
          setHits(items.slice(0, 18))
          setPopular((js.popular || []).map(p => p.term)) // ha az /api/search is küld topot, használjuk
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => { ignore = true }
  }, [debounced])

  // billentyű navigáció
  const onKeyDown = (e) => {
    if (!open) setOpen(true)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex(i => Math.min((i + 1), hits.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex(i => Math.max((i - 1), -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (index >= 0 && hits[index]) {
        const h = hits[index]
        const term = q || h.title
        pushRecent(term)
        trackSearch(term)        // << naplózza
        router.push(h.href)
        setOpen(false)
      } else if (q.trim()) {
        pushRecent(q.trim())
        trackSearch(q.trim())    // << naplózza
        router.push(`/kereses?q=${encodeURIComponent(q.trim())}`)
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setIndex(-1)
      (document.activeElement)?.blur()
    }
  }

  // overlay click out
  useEffect(() => {
    const onDoc = (e) => {
      if (!panelRef.current) return
      if (panelRef.current.contains(e.target) || inputRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={q}
        onChange={(e)=>{ setQ(e.target.value); setOpen(true); setIndex(-1) }}
        onFocus={()=> setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Keresés termékek, kategóriák, blogok között…"
        className="w-full py-3 pl-6 pr-10 bg-gray-100 rounded-full outline-none"
      />
      <TbSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--pink)]" size={20}/>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-10 mt-2 w-full rounded-xl border border-[var(--border)] bg-white shadow-xl"
          >
            {/* gyors link a teljes keresésre */}
            {q && (
              <div
                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer rounded-t-xl"
                onMouseDown={(e)=>e.preventDefault()}
                onClick={()=>{
                  const term = q.trim()
                  if (!term) return
                  pushRecent(term)
                  trackSearch(term) // << naplózza
                  router.push(`/kereses?q=${encodeURIComponent(term)}`)
                  setOpen(false)
                }}
              >
                Keresés: <span className="font-medium text-gray-800">„{q}”</span>
              </div>
            )}

            {/* recent & popular (üres inputnál) */}
            {(recent.length > 0 || popular.length > 0) && !q && (
              <div className="px-3 py-2 border-t border-[var(--border)]">
                {recent.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">Legutóbbi keresések</div>
                    <div className="flex flex-wrap gap-2">
                      {recent.map((r, i)=>(
                        <button
                          key={`r-${i}`}
                          className="text-xs px-2 py-1 rounded-full bg-[var(--cream-pink)] hover:opacity-80"
                          onMouseDown={(e)=>e.preventDefault()}
                          onClick={()=>{ setQ(r); setOpen(true) }}
                        >{r}</button>
                      ))}
                    </div>
                  </div>
                )}
                {popular.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Leggyakrabban keresett</div>
                    <div className="flex flex-wrap gap-2">
                      {popular.map((r, i)=>(
                        <button
                          key={`p-${i}`}
                          className="text-xs px-2 py-1 rounded-full border border-[var(--border)] hover:bg-[var(--border)]/30"
                          onMouseDown={(e)=>e.preventDefault()}
                          onClick={()=>{ setQ(r); setOpen(true) }}
                        >{r}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* találatok */}
            {q && (
              <div className="max-h-[60vh] overflow-auto divide-y divide-[var(--border)]">
                {loading && <div className="px-3 py-3 text-sm text-gray-500">Keresés…</div>}
                {!loading && hits.length === 0 && (
                  <div className="px-3 py-3 text-sm text-gray-500">Nincs találat.</div>
                )}
                {!loading && hits.map((h, i)=>(
                  <div
                    key={`${h.type}-${h.id}`}
                    className={`px-3 py-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${i===index ? 'bg-gray-50' : ''}`}
                    onMouseEnter={()=> setIndex(i)}
                    onMouseDown={(e)=>e.preventDefault()}
                    onClick={()=>{
                      const term = q || h.title
                      pushRecent(term)
                      trackSearch(term) // << naplózza
                      router.push(h.href)
                      setOpen(false)
                    }}
                  >
                    {'image' in h && h.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={h.image} alt="" className="w-10 h-10 object-cover rounded-md" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-100 border border-[var(--border)] flex items-center justify-center text-xs text-gray-400">
                        {h.type.toUpperCase().slice(0,2)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{h.title}</div>
                      {'subtitle' in h && h.subtitle ? (
                        <div className="text-xs text-gray-500 truncate">{h.subtitle}</div>
                      ): null}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeColor(h.type)}`}>
                      {h.type === 'product' ? 'Termék' :
                       h.type === 'category' ? 'Kategória' :
                       h.type === 'post' ? 'Blog' : 'Címke'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
