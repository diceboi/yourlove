import Link from 'next/link'
import BlogTile from './BlogTile'
import { TbChevronLeft, TbChevronRight } from 'react-icons/tb'

export default function BlogList({
  posts,
  page,
  totalPages,
  currentCategory,
  currentTag,
}) {
  const makePageHref = (p) => {
    const params = new URLSearchParams()
    if (currentCategory) params.set('category', currentCategory)
    if (currentTag) params.set('tag', currentTag)
    params.set('page', String(p))
    return `/blog?${params.toString()}`
  }

  return (
    <div className="flex flex-col gap-8 w-full py-16">
      <div className="grid lg:grid-cols-4 grid-cols-2 gap-8 w-full">
        {posts.map((post) => (
          <BlogTile key={post.id} post={post} />
        ))}
        {!posts.length && (
          <div className="col-span-full text-center text-sm opacity-70">
            Nincs megjeleníthető bejegyzés.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={makePageHref(Math.max(1, page - 1))}
            className={`px-3 py-2 rounded-full border ${page === 1 ? 'pointer-events-none opacity-50' : ''}`}
            aria-disabled={page === 1}
          >
            <TbChevronLeft className="inline-block" /> Előző
          </Link>
          <span className="px-3 py-2 text-sm">
            {page} / {totalPages}
          </span>
          <Link
            href={makePageHref(Math.min(totalPages, page + 1))}
            className={`px-3 py-2 rounded-full border ${page === totalPages ? 'pointer-events-none opacity-50' : ''}`}
            aria-disabled={page === totalPages}
          >
            Következő <TbChevronRight className="inline-block" />
          </Link>
        </div>
      )}
    </div>
  )
}
