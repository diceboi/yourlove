"use client"

import { useEffect, useState } from "react"
import { TbHeart } from "react-icons/tb"
import { useFavoritesUI } from "./favorites/FavoritesUIProvider"
import { usePathname } from "next/navigation"

export default function Favourites() {
  const { setOpen } = useFavoritesUI()
  const [count, setCount] = useState(0)
  const pathname = usePathname()

  async function fetchCount() {
    try {
      const res = await fetch('/api/favorites', { cache: 'no-store' })
      const json = await res.json()
      setCount(Array.isArray(json) ? json.length : 0)
    } catch {
      setCount(0)
    }
  }

  useEffect(() => {
    fetchCount()
  }, [pathname])

  useEffect(() => {
    const onChanged = () => fetchCount()
    const onAuthChange = () => {
      // Reset count and refetch when auth state changes (login/logout)
      setCount(0)
      setTimeout(() => fetchCount(), 100)
    }

    window.addEventListener('favorites:changed', onChanged)
    window.addEventListener('auth:changed', onAuthChange)
    return () => {
      window.removeEventListener('favorites:changed', onChanged)
      window.removeEventListener('auth:changed', onAuthChange)
    }
  }, [])

  const label = count > 99 ? '99+' : String(count)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="xl:min-w-[44px] min-w-[40px] xl:h-[44px] h-[40px] rounded-full hover:bg-[var(--border)] flex items-center justify-center cursor-pointer"
      >
        <TbHeart className="w-6 h-6 text-[var(--pink)]" />
      </button>

      {count > 0 && (
        <span
          className="absolute top-0 -right-0 min-w-[18px] h-[18px] px-1
                     rounded-full bg-[var(--pink)] text-white text-[10px]
                     font-semibold flex items-center justify-center shadow"
          aria-label={`Kedvencek ${count} tétel`}
        >
          {label}
        </span>
      )}
    </div>
  )
}
