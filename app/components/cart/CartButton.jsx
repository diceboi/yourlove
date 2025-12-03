'use client'
import { useEffect, useState } from 'react'
import { TbShoppingCart } from 'react-icons/tb'
import { useCartUI } from './CartUIProvider'
import { usePathname } from 'next/navigation'

export default function CartButton() {
  const { toggle } = useCartUI()
  const [count, setCount] = useState(0)
  const pathname = usePathname()

  async function fetchCount() {
    try {
      const res = await fetch('/api/cart/count', { cache: 'no-store' })
      const json = await res.json()
      setCount(json?.count ?? 0)
    } catch {
      setCount(0)
    }
  }

  useEffect(() => {
    fetchCount()
  }, [pathname]) // route váltásnál is frissít

  useEffect(() => {
    const onChanged = () => fetchCount()
    window.addEventListener('cart:changed', onChanged)
    return () => window.removeEventListener('cart:changed', onChanged)
  }, [])

  const label = count > 99 ? '99+' : String(count)

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="xl:w-[44px] w-[40px] xl:h-[44px] h-[40px] rounded-full hover:bg-[var(--border)] flex items-center justify-center cursor-pointer"
        aria-label="Kosár"
      >
        <TbShoppingCart className="w-6 h-6 text-[var(--pink)]" />
      </button>

      {count > 0 && (
        <span
          className="absolute top-0 -right-0 min-w-[18px] h-[18px] px-1
                     rounded-full bg-[var(--pink)] text-white text-[10px]
                     font-semibold flex items-center justify-center shadow"
          aria-label={`Kosárban ${count} tétel`}
        >
          {label}
        </span>
      )}
    </div>
  )
}
