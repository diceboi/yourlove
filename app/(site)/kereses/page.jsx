// app/(site)/kereses/page.jsx
import Link from 'next/link'
import { headers } from 'next/headers'

async function absoluteFetch(pathWithQuery) {
  // pl. "/api/search?..." → abszolút URL
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || ''
  const proto = (h.get('x-forwarded-proto') || 'http')
  const base = `${proto}://${host}`
  const url = new URL(pathWithQuery, base)
  const res = await fetch(url.toString(), { cache: 'no-store' })
  return res
}

async function fetchGroup({ q, type = 'products', page = 0, limit = 24 }) {
  const params = new URLSearchParams({
    archive: '1',
    type,
    q,
    page: String(page),
    limit: String(limit),
  })
  const res = await absoluteFetch(`/api/search?${params.toString()}`)
  if (!res.ok) return { [type]: [], total: { [type]: 0 } }
  return res.json()
}

export default async function SearchArchive({ searchParams }) {
  const sp = await searchParams

  const q = typeof sp?.q === 'string' ? sp.q : ''
  const tab = typeof sp?.tab === 'string' ? sp.tab : 'products'
  const page = Math.max(parseInt((sp?.page) || '0', 10) || 0, 0)

  const limit = 24
  const data = await fetchGroup({ q, type: tab, page, limit })
  const items = data[tab] || []
  const total = (data.total && data.total[tab]) || 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h1 className="text-xl font-semibold">Keresés: „{q}”</h1>
        <div className="text-sm text-gray-500">Találatok: {total}</div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['products','categories','posts','tags']).map(t => {
          const active = t === tab
          const href = `/kereses?q=${encodeURIComponent(q)}&tab=${t}`
          return (
            <Link
              key={t}
              href={href}
              className={`px-3 py-1.5 text-sm rounded-full border ${active ? 'bg-[var(--pink)] text-white border-[var(--pink)]' : 'border-[var(--border)] hover:bg-[var(--border)]/40'}`}
            >
              {t === 'products' ? 'Termékek'
                : t === 'categories' ? 'Kategóriák'
                : t === 'posts' ? 'Blog'
                : 'Címkék'}
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4">
        {items.map((it) => {
          if (tab === 'products') {
            const price = (it.akcios_ar_brutto ?? it.eladasi_ar_brutto ?? 0)
            return (
              <Link key={it.id} href={`/termekek/${it.seo_slug}`} className="border rounded-xl p-3 hover:shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.termekkep || '/default.png'} alt="" className="w-full aspect-square object-cover rounded-md mb-2" />
                <div className="text-sm font-medium line-clamp-2">{it.fo_cim || it.alcim || it.seo_slug}</div>
                <div className="text-xs text-gray-500 mt-1">{price.toLocaleString('hu-HU')} Ft</div>
              </Link>
            )
          }
          if (tab === 'categories') {
            return (
              <Link key={it.id} href={`/termekek/${it.slug}`} className="border rounded-xl p-3 hover:shadow-sm">
                <div className="text-sm font-medium">{it.nev}</div>
              </Link>
            )
          }
          if (tab === 'posts') {
            return (
              <Link key={it.id} href={`/blog/${it.slug}`} className="border rounded-xl p-3 hover:shadow-sm">
                <div className="text-sm font-medium line-clamp-2">{it.title}</div>
              </Link>
            )
          }
          return (
            <Link key={it.id} href={`/cimkek/${it.slug}`} className="border rounded-xl p-3 hover:shadow-sm">
              <div className="text-sm font-medium">{it.name}</div>
            </Link>
          )
        })}
        {items.length === 0 && (
          <div className="col-span-full text-sm text-gray-500 p-6">
            Nincs találat.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const href = `/kereses?q=${encodeURIComponent(q)}&tab=${tab}&page=${i}`
            const active = i === page
            return (
              <Link
                key={i}
                href={href}
                className={`px-3 py-1.5 text-sm rounded-full border ${active ? 'bg-[var(--green)] text-white border-[var(--green)]' : 'border-[var(--border)] hover:bg-[var(--border)]/40'}`}
              >{i+1}</Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
