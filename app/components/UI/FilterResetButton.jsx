'use client'
import { useRouter, useSearchParams } from 'next/navigation'

/** adhatunk kulcs listát – ezeket töröljük az URL-ből */
export default function FiltersResetButton({ keys = [], className = '' }) {
  const router = useRouter()
  const sp = useSearchParams()
  const reset = () => {
    const params = new URLSearchParams(sp.toString())
    keys.forEach(k => params.delete(k))
    router.push(params.toString() ? `?${params.toString()}` : '?')
  }
  return (
    <button
      type="button"
      onClick={reset}
      className={`px-4 h-10 rounded-full border hover:bg-gray-50 ${className} min-w-fit`}
    >
      Szűrők törlése
    </button>
  )
}
