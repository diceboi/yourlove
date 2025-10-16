'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ProductListItem from '@/app/components/UI/ProductListItem'
import ProductCardSkeleton from '@/app/components/UI/ProductCardSkeleton'

const PAGE_SIZE = 20

function safeParseJSON(s) { try { return JSON.parse(s) } catch { return null } }
function getCategoryPathsFromProduct(product) {
  const raw = product?.kategoria
  const parsed = typeof raw === 'string' ? safeParseJSON(raw) : raw
  return Array.isArray(parsed) ? parsed.filter(p => Array.isArray(p) && p.length) : []
}
function pickBestPath(paths) {
  if (!paths.length) return null
  return paths.slice().sort((a,b)=>b.length-a.length)[0]
}
function buildCategorySlugPath(catId, catsById) {
  const chain = []
  let cur = catsById.get(catId)
  while (cur) {
    chain.push(cur)
    cur = cur.szulo ? catsById.get(cur.szulo) : null
  }
  chain.reverse()
  return chain.map(c => c.slug).join('/')
}

export default function ProductsInfinite({ catsByIdObj, categoryId = null }) {
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const catsById = useMemo(
    () => new Map(Object.entries(catsByIdObj || {}).map(([k, v]) => [Number(k), v])),
    [catsByIdObj]
  )

  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [effectiveCategoryId, setEffectiveCategoryId] = useState(categoryId)

  const sentinelRef = useRef(null)

  // URL filterek
  const arrange      = searchParams.get('arrange')      || ''
  const color        = searchParams.get('color')        || ''
  const childSlug    = searchParams.get('category')     || ''
  const stock        = searchParams.get('stock')        || ''
  const warranty     = searchParams.get('warranty')     || ''
  const priceRange   = searchParams.get('pricerange')   || ''
  const size         = searchParams.get('size')         || ''
  const weightrange  = searchParams.get('weightrange')  || ''
  const material     = searchParams.get('material')     || ''
  const charging     = searchParams.get('charging')     || ''
  const chargingtime = searchParams.get('chargingtime') || ''
  const noise        = searchParams.get('noise')        || ''
  const waterproof   = searchParams.get('waterproof')   || ''
  const usetime      = searchParams.get('usetime')      || ''
  const modes        = searchParams.get('modes')        || ''
  const speed        = searchParams.get('speed')        || ''
  const controll     = searchParams.get('controll')     || ''
  const app          = searchParams.get('app')          || ''

  // child slug → kategória id feloldás
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!childSlug) {
        if (!cancelled) setEffectiveCategoryId(categoryId)
        return
      }
      const { data: cat } = await supabase
        .from('product-categories')
        .select('id, slug')
        .eq('slug', String(childSlug).toLowerCase())
        .maybeSingle()
      if (!cancelled) setEffectiveCategoryId(cat?.id ?? categoryId)
    })()
    return () => { cancelled = true }
  }, [childSlug, categoryId, supabase])

  // Ha bármely filter változik → reset
  useEffect(() => {
    setItems([])
    setPage(0)
    setHasMore(true)
  }, [
    arrange,color,childSlug,stock,warranty,priceRange,size,weightrange,material,
    charging,chargingtime,noise,waterproof,usetime,modes,speed,controll,app,effectiveCategoryId
  ])

  async function fetchPage(nextPage) {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      let q = supabase
        .from('products')
        .select('*')
        .eq('kozzeteve', true)

      const ilike = (col, val) => { if (val) q = q.ilike(col, `%${val}%`) }
      ilike('szin', color)
      ilike('anyag', material)
      ilike('meretek', size)
      ilike('suly', weightrange)
      ilike('toltes', charging)
      ilike('toltesi_ido', chargingtime)
      ilike('zajszint', noise)
      ilike('vizallosag', waterproof)
      ilike('hasznalati_ido', usetime)
      ilike('vibracios_modok', modes)
      ilike('sebessegfokozatok', speed)
      ilike('vezerles', controll)
      ilike('applikacio', app)

      if (warranty) {
        const m = String(warranty).match(/(\d+)/)
        if (m) q = q.ilike('garancia', `%${m[1]}%`)
        else q = q.ilike('garancia', `%${warranty}%`)
      }
      if (stock === 'instock') q = q.gt('keszlet', 0)
      else if (stock === 'out-of-stock') q = q.eq('keszlet', 0)

      if (priceRange) {
        if (priceRange.includes('-')) {
          const [min, max] = priceRange.split('-').map(n => Number(String(n).replace(/\D/g,'')))
          if (!Number.isNaN(min)) q = q.gte('eladasi_ar_brutto', min)
          if (!Number.isNaN(max)) q = q.lte('eladasi_ar_brutto', max)
        } else if (priceRange.endsWith('+')) {
          const n = Number(priceRange.replace('+',''))
          if (!Number.isNaN(n)) q = q.gte('eladasi_ar_brutto', n)
        }
      }

      // Stabil rendezés + tie-breaker id
      if (arrange === 'price-low-to-high') {
        q = q.order('eladasi_ar_brutto', { ascending: true }).order('id', { ascending: true })
      } else if (arrange === 'price-high-to-low') {
        q = q.order('eladasi_ar_brutto', { ascending: false }).order('id', { ascending: true })
      } else if (arrange === 'newest') {
        q = q.order('created_at', { ascending: false }).order('id', { ascending: true })
      } else {
        q = q.order('created_at', { ascending: false }).order('id', { ascending: true })
      }

      const from = nextPage * PAGE_SIZE
      const to   = from + PAGE_SIZE - 1
      const { data: rows = [], error } = await q.range(from, to)
      if (error) console.error('supabase products error:', error)

      // Kliens oldali kategória szűrés (JSON path alapján)
      let filtered = rows
      if (effectiveCategoryId) {
        const wantId = Number(effectiveCategoryId)
        filtered = rows.filter(p => {
          const paths = getCategoryPathsFromProduct(p)
          return paths.some(path => Array.isArray(path) && path.includes(wantId))
        })
      }

      // Deduplikálás
      setItems(prev => {
        const seen = new Set(prev.map(x => x.id))
        const newOnes = filtered.filter(x => x && x.id && !seen.has(x.id))
        return [...prev, ...newOnes]
      })

      setHasMore(rows.length === PAGE_SIZE)
      setPage(nextPage + 1)
    } finally {
      setLoading(false)
    }
  }

  // első betöltés
  useEffect(() => {
    fetchPage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCategoryId])

  // Infinite scroll: IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore && !loading) {
          fetchPage(page) // mindig az aktuális page-et kéri a következőhöz
        }
      },
      { root: null, rootMargin: '600px 0px 600px 0px', threshold: 0.01 }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [page, hasMore, loading]) // page/hasMore/loading változáskor újraköti

  // Skeleton az első körben
  if (items.length === 0 && loading) {
    return (
      <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 mt-8 gap-4 w-full">
        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 mt-8 gap-4">
        {items.map((p) => {
          const paths = getCategoryPathsFromProduct(p)
          const picked = pickBestPath(paths)
          let categoryPath = ''
          if (picked && picked.length) {
            const lastId = picked[picked.length - 1]
            categoryPath = buildCategorySlugPath(lastId, catsById)
          }
          return (
            <ProductListItem
              key={p.id}
              id={p.id}
              image={p.termekkep || '/default.png'}
              focim={p.fo_cim}
              alcim={p.alcim}
              price={p.eladasi_ar_brutto}
              slug={p.seo_slug}
              categoryPath={categoryPath}
            />
          )
        })}
      </div>

      {/* sentinel a végen (infinite scroll trigger) */}
      <div ref={sentinelRef} className="h-12 flex items-center justify-center">
        {loading && <div className="animate-pulse text-sm text-gray-500">Betöltés…</div>}
        {!hasMore && items.length > 0 && (
          <div className="text-xs text-gray-400">Nincs több találat.</div>
        )}
      </div>

      {/* Fallback gomb (ha az Observer nem futna valamiért) */}
      {hasMore && !loading && (
        <div className="flex items-center justify-center pb-8">
          <button
            onClick={() => fetchPage(page)}
            className="px-4 py-2 rounded-full border border-[var(--border)] hover:bg-[var(--border)]/40 transition"
          >
            Továbbiak betöltése
          </button>
        </div>
      )}
    </div>
  )
}
