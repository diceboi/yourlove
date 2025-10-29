'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function BlogCategoryFilterBar({ categories }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || 'osszes'
  const currentTag = searchParams.get('tag') || ''

  const updateQuery = (nextCat) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', nextCat)
    // lapozást reseteljük
    params.delete('page')
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 justify-center items-center flex-wrap z-10 bg-white p-1 rounded-2xl border border-[var(--border)]">
      {categories.map(({ slug, nev }) => (
        <button
          key={slug}
          onClick={() => updateQuery(slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer 
            ${currentCategory === slug ? 'bg-[var(--pink)] text-white' : 'bg-white hover:bg-[var(--grey-bg)]'} 
            transition duration-200`}
          aria-pressed={currentCategory === slug}
        >
          {nev}
        </button>
      ))}
      {currentTag && (
        <span className="px-3 py-2 text-xs rounded-full border bg-[var(--grey-bg)]">
          Címke: {currentTag}
        </span>
      )}
    </div>
  )
}
