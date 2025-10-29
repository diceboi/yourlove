import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import H1 from '@/app/components/UI/Texts/H1'
import Paragraph from '@/app/components/UI/Texts/Paragraph'
import Breadcrumbs from '@/app/components/UI/Breadcrumbs'

export const revalidate = 60

// -------- Helpers --------
function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return '' }
}
function estimateReadingMinutes(html) {
  if (!html) return 1
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = text ? text.split(' ').length : 0
  return Math.max(1, Math.round(words / 220))
}
function splitTags(cimke) {
  if (!cimke) return []
  return cimke.split(',').map(t => t.trim()).filter(Boolean)
}

// -------- Data --------
async function getPost(slug) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blogs')
    .select('id, slug, cim, bevezeto, tartalom, kep, kep_alt, kategoria, cimke, created_at')
    .eq('slug', slug)
    .eq('kozzeteve', true)
    .single()
  return data || null
}

async function getPrevNext(created_at) {
  const supabase = await createClient()
  const [{ data: newer }, { data: older }] = await Promise.all([
    supabase.from('blogs').select('slug, cim, created_at')
      .gt('created_at', created_at).eq('kozzeteve', true)
      .order('created_at', { ascending: true }).limit(1),
    supabase.from('blogs').select('slug, cim, created_at')
      .lt('created_at', created_at).eq('kozzeteve', true)
      .order('created_at', { ascending: false }).limit(1),
  ])
  return { newer: newer?.[0] || null, older: older?.[0] || null }
}

async function getRelated(post) {
  const supabase = await createClient()
  const tags = splitTags(post.cimke)
  let q = supabase.from('blogs')
    .select('id, slug, cim, bevezeto, kep, kep_alt, created_at, kategoria, cimke')
    .eq('kozzeteve', true).neq('id', post.id)
    .order('created_at', { ascending: false }).limit(8)
  if (post.kategoria) q = q.eq('kategoria', post.kategoria)
  if (tags.length) q = q.or(tags.map(t => `cimke.ilike.%${t}%`).join(','))
  const { data } = await q
  return data || []
}

// ---- NEW: sidebar data ----
async function getRecent(limit = 8) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blogs')
    .select('id, slug, cim, kep, kep_alt, created_at')
    .eq('kozzeteve', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data || []
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog-categories')
    .select('slug, nev')
    .eq('kozzeteve', true)
    .order('nev', { ascending: true })
  return data || []
}

// -------- Metadata (opcionális) --------
export async function generateMetadata(props) {
  const params = await props.params
  const post = await getPost(params.slug)
  const title = post?.meta_title || post?.cim || 'Blog bejegyzés'
  const description = post?.bevezeto || ''
  const images = post?.kep ? [{ url: post.kep, alt: post.kep_alt || post.cim || '' }] : []
  return {
    title,
    description,
    openGraph: { title, description, images },
    twitter: { card: 'summary_large_image', title, description, images },
  }
}

// -------- Page --------
export default async function BlogPostPage(props) {
  const params = await props.params
  const post = await getPost(params.slug)
  if (!post) {
    return (
      <div className="w-full xl:pt-18 pt-18 xl:pb-8 pb-4 px-4 xl:px-12">
        <Breadcrumbs />
        <div className="mt-6 rounded-2xl border border-[var(--border)] p-8 bg-white">Bejegyzés nem található.</div>
      </div>
    )
  }

  const [pn, related, recent, categories] = await Promise.all([
    getPrevNext(post.created_at),
    getRelated(post),
    getRecent(8),
    getCategories(),
  ])

  const readMin = estimateReadingMinutes(post.tartalom)
  const tags = splitTags(post.cimke)

  return (
    <div className="w-full xl:pt-18 pt-18 xl:pb-8 pb-4 px-4 xl:px-12">
      <Breadcrumbs />

      {/* Kétoszlopos elrendezés: bal a cikk, jobb az oldalsáv */}
      <div className="grid lg:grid-cols-12 grid-cols-1 gap-10 mt-6">
        {/* Main */}
        <article className="lg:col-span-8 flex flex-col gap-6">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {post.kategoria && (
                <Link
                  href={`/blog?category=${encodeURIComponent(post.kategoria)}`}
                  className="px-3 py-1 rounded-full bg-[var(--grey-bg)] border border-[var(--border)] hover:bg-white transition"
                >
                  {post.kategoria}
                </Link>
              )}
              <span className="opacity-70">{formatDate(post.created_at)}</span>
              <span className="opacity-70">•</span>
              <span className="opacity-70">{readMin} perc olvasás</span>
            </div>
            <H1>{post.cim}</H1>
            {post.bevezeto && <Paragraph classname="text-lg opacity-90">{post.bevezeto}</Paragraph>}
          </header>

          {post.kep && (
            <div className="relative w-full h-[45vh] lg:h-[60vh] rounded-2xl overflow-hidden shadow-box">
              <Image src={post.kep} alt={post.kep_alt || post.cim || 'borítókép'} fill priority
                     style={{ objectFit: 'cover', objectPosition: 'center' }} />
            </div>
          )}

          {/* Tartalom */}
          {post.tartalom && (
            <div
              className="prose max-w-none prose-p:leading-7 prose-img:rounded-xl prose-headings:scroll-mt-24 prose-a:text-[var(--pink)]"
              dangerouslySetInnerHTML={{ __html: post.tartalom }}
            />
          )}


          {/* Tag-ek */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-4">
              {tags.map((t) => (
                <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`}
                      className="px-3 py-1 rounded-full bg-white border border-[var(--border)] hover:bg-[var(--grey-bg)] text-sm">
                  #{t}
                </Link>
              ))}
            </div>
          )}

          {/* Prev / Next */}
          <nav className="grid md:grid-cols-2 grid-cols-1 gap-3 pt-8">
            <PrevNextCard label="Előző" post={pn.older} />
            <PrevNextCard label="Következő" align="right" post={pn.newer} />
          </nav>

          {/* Kapcsolódó */}
          {related.length > 0 && (
            <section className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Kapcsolódó bejegyzések</h2>
              <div className="grid lg:grid-cols-3 grid-cols-2 gap-6">
                {related.slice(0, 6).map((r) => <RelatedTile key={r.id} post={r} />)}
              </div>
            </section>
          )}
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
          {/* Friss bejegyzések */}
          <section className="rounded-2xl bg-[var(--grey-bg)] p-4">
            <h3 className="text-base font-semibold mb-3">Friss bejegyzések</h3>
            <div className="flex flex-col gap-3">
              {recent.map((p) => <MiniPostCard key={p.id} post={p} />)}
            </div>
          </section>

          {/* Kategóriák */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-4">
            <h3 className="text-base font-semibold mb-3">Blog kategóriák</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link key={c.slug} href={`/blog?category=${encodeURIComponent(c.slug)}`}
                      className="px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--grey-bg)] hover:bg-white text-sm">
                  {c.nev}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

// -------- UI bitek --------
function PrevNextCard({ label, post, align = 'left' }) {
  if (!post) {
    return <div className="rounded-2xl border border-[var(--border)] p-4 bg-white opacity-60" />
  }
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group rounded-2xl border border-[var(--border)] p-4 bg-white hover:shadow-box-hover transition flex flex-col ${align==='right' ? 'items-end text-right' : ''}`}
    >
      <span className="text-xs opacity-70">{label}</span>
      <span className="font-medium group-hover:text-[var(--pink)] line-clamp-2">{post.cim}</span>
      <span className="text-xs opacity-60 mt-1">{formatDate(post.created_at)}</span>
    </Link>
  )
}

function RelatedTile({ post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="flex flex-col gap-2">
      <div className="relative w-full h-[160px] rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--grey-bg)]">
        {post.kep && (
          <Image src={post.kep} alt={post.kep_alt || post.cim || ''} fill
                 style={{ objectFit: 'cover', objectPosition: 'center' }} />
        )}
      </div>
      <span className="font-semibold line-clamp-2">{post.cim}</span>
      <span className="text-xs opacity-60">{formatDate(post.created_at)}</span>
    </Link>
  )
}

/* --- NEW: mini-kártya a sidebarhoz --- */
function MiniPostCard({ post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex gap-3 items-center">
      <div className="relative w-24 h-16 rounded-md overflow-hidden border border-[var(--border)] bg-[var(--grey-bg)] shrink-0">
        {post.kep && (
          <Image src={post.kep} alt={post.kep_alt || post.cim || ''} fill
                 style={{ objectFit: 'cover', objectPosition: 'center' }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-[var(--pink)]">
          {post.cim}
        </div>
        <div className="text-xs opacity-60 mt-0.5">{formatDate(post.created_at)}</div>
      </div>
    </Link>
  )
}
