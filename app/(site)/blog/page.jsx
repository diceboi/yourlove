import { createClient } from '@/utils/supabase/server'
import BlogHero from '@/app/components/BlogHero'
import BlogList from '@/app/components/BlogList'
import Breadcrumbs from '@/app/components/UI/Breadcrumbs'

const PAGE_SIZE = 12

export default async function BlogPage({ searchParams }) {
  const supabase = await createClient()
  const params = await searchParams

  const category = (params.category || 'osszes').toLowerCase()
  const tag = (params.tag || '').toLowerCase().trim()
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // 1) kategóriák a filter bar-hoz
  const { data: categories } = await supabase
    .from('blog-categories') // táblanév kötőjellel -> ok Supabase-ben
    .select('slug, nev')
    .eq('kozzeteve', true)
    .order('nev', { ascending: true })

  // 2) blogok listája (publikált, legújabb elöl)
  let query = supabase
    .from('blogs')
    .select('id, slug, cim, bevezeto, kep, kep_alt, kategoria, cimke, created_at', { count: 'exact' })
    .eq('kozzeteve', true)
    .order('created_at', { ascending: false })

  // Kategória szűrő ('osszes' = nincs szűrés)
  if (category && category !== 'osszes') {
    query = query.eq('kategoria', category)
  }

  // Címke szűrő: 'cimke' mező egy szöveg (pl. vesszővel tagolt), ezért ilike
  if (tag) {
    // pl. ,tippek, vagy elején/végén is egyezzen
    query = query.or([
      `cimke.ilike.%${tag}%`, // laza szűrés – ha külön tag tábla reláció helyett szövegmező van
    ].join(','))
  }

  // Lapozás
  const { data: posts, count } = await query.range(from, to)
  const total = count || 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="w-full xl:pt-18 pt-18 xl:pb-8 pb-4 px-4 xl:px-12">
      <div className="flex flex-col gap-4">
        <Breadcrumbs />
        <BlogHero categories={[{ slug: 'osszes', nev: 'Összes' }, ...(categories || [])]} />
        <BlogList
          posts={posts || []}
          page={page}
          totalPages={totalPages}
          currentCategory={category}
          currentTag={tag}
        />
      </div>
    </div>
  )
}
