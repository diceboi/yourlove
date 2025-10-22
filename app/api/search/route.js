// app/api/search/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// KIS SEGÉD: safe number
const toInt = (v, def = 0) => {
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : def
}

/**
 * Támogatott query-k:
 * - q: keresőkifejezés (string)
 * - limit: szám (default 6 élő kereséshez)
 * - page: 0-index (archívhoz)
 * - type: 'products' | 'categories' | 'posts' | 'tags' (archívnál aktív tab)
 * - archive: '1' esetén lapozható archív választ adunk vissza (összesített total-lal)
 *
 * Válasz (élő keresés, ha archive != '1'):
 * {
 *   products: [...], categories: [...], posts: [...], tags: [...],
 *   recent: [...], popular: [...]
 * }
 *
 * Válasz (archív, ha archive === '1'):
 * {
 *   products: [...], categories: [...], posts: [...], tags: [...],
 *   total: { products: 0, categories: 0, posts: 0, tags: 0 }
 * }
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const limit = Math.max(1, toInt(searchParams.get('limit') || '6', 6))
    const page = Math.max(0, toInt(searchParams.get('page') || '0', 0))
    const type = (searchParams.get('type') || 'products').toLowerCase()
    const isArchive = searchParams.get('archive') === '1'

    const supabase = await createClient()

    // helper: ilike minta
    const needle = `%${q}%`

    // --- PRODUCTS ---
    // Megjegyzés: ha van "akcios_ar_brutto", a rendezést/kiírást nálad lehet finomítani
    const productsQ = supabase
      .from('products')
      .select('id, fo_cim, alcim, seo_slug, termekkep, eladasi_ar_brutto, akcios_ar_brutto, kozzeteve', { count: isArchive ? 'exact' : undefined })
      .eq('kozzeteve', true)
      .or(`fo_cim.ilike.${needle},alcim.ilike.${needle},seo_slug.ilike.${needle}`)
      .order('created_at', { ascending: false })

    if (isArchive && type === 'products') {
      productsQ.range(page * limit, page * limit + limit - 1)
    } else {
      productsQ.limit(limit)
    }

    let { data: products = [], count: productsCount = 0 } = await productsQ

    // --- CATEGORIES ---
    const categoriesQ = supabase
      .from('product-categories')
      .select('id, nev, slug, kozzeteve', { count: isArchive ? 'exact' : undefined })
      .eq('kozzeteve', true)
      .or(`nev.ilike.${needle},slug.ilike.${needle}`)
      .order('nev', { ascending: true })

    if (isArchive && type === 'categories') {
      categoriesQ.range(page * limit, page * limit + limit - 1)
    } else {
      categoriesQ.limit(limit)
    }

    let { data: categories = [], count: categoriesCount = 0 } = await categoriesQ

    // --- POSTS (ha van blog táblád) ---
    // Ha nincs, akkor maradjon üres; ne dobjunk hibát.
    let posts = []
    let postsCount = 0
    try {
      const postsQ = supabase
        .from('blog_posts')
        .select('id, title, slug, published', { count: isArchive ? 'exact' : undefined })
        .eq('published', true)
        .or(`title.ilike.${needle},slug.ilike.${needle}`)
        .order('created_at', { ascending: false })

      if (isArchive && type === 'posts') {
        postsQ.range(page * limit, page * limit + limit - 1)
      } else {
        postsQ.limit(limit)
      }

      const { data = [], count = 0 } = await postsQ
      posts = data
      postsCount = count
    } catch (_) {
      posts = []
      postsCount = 0
    }

    // --- TAGS (ha van tags táblád) ---
    let tags = []
    let tagsCount = 0
    try {
      const tagsQ = supabase
        .from('tags')
        .select('id, name, slug', { count: isArchive ? 'exact' : undefined })
        .or(`name.ilike.${needle},slug.ilike.${needle}`)
        .order('name', { ascending: true })

      if (isArchive && type === 'tags') {
        tagsQ.range(page * limit, page * limit + limit - 1)
      } else {
        tagsQ.limit(limit)
      }

      const { data = [], count = 0 } = await tagsQ
      tags = data
      tagsCount = count
    } catch (_) {
      tags = []
      tagsCount = 0
    }

    // --- RECENT/POPULAR (opcionális)
    // Ha létrehoztál egy 'search_queries' táblát: id, term (text), created_at, count
    let recent = []
    let popular = []
    try {
      const { data: recentRows = [] } = await supabase
        .from('search_queries')
        .select('term')
        .order('created_at', { ascending: false })
        .limit(6)

      recent = recentRows.map(r => r.term).filter(Boolean)

      const { data: popularRows = [] } = await supabase
        .from('search_queries')
        .select('term, count')
        .order('count', { ascending: false })
        .limit(6)

      popular = popularRows.map(r => r.term).filter(Boolean)
    } catch (_) {
      recent = []
      popular = []
    }

    // ARCHIVE mód: 1 aktív tabhoz lapozva + összesített total
    if (isArchive) {
      const total = {
        products: productsCount || 0,
        categories: categoriesCount || 0,
        posts: postsCount || 0,
        tags: tagsCount || 0,
      }
      return NextResponse.json({ products, categories, posts, tags, total })
    }

    // Élő keresés (dropdown)
    return NextResponse.json({ products, categories, posts, tags, recent, popular })
  } catch (err) {
    console.error('API /search error:', err)
    return NextResponse.json(
      { products: [], categories: [], posts: [], tags: [], recent: [], popular: [] },
      { status: 200 }
    )
  }
}
