'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import ButtonText from './Texts/ButtonText'
import { TbShoppingCart } from 'react-icons/tb'
import { addToCart } from '@/app/_actions/cart'
import { useCartUI } from '@/app/components/cart/CartUIProvider'

export default function StickyAddToCart({ productId, product }) {
  const [quantity, setQuantity] = useState(1)
  const [pending, startTransition] = useTransition()
  const [show, setShow] = useState(false)
  const router = useRouter()
  const { setOpen } = useCartUI()

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar when scrolled more than 500px (roughly when ProductInfoPanel is out of view)
      setShow(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDecrease = () => setQuantity(q => Math.max(1, q - 1))
  const handleIncrease = () => setQuantity(q => q + 1)

  const handleAdd = () => {
    if (!productId) return
    startTransition(async () => {
      await addToCart(productId, quantity)
      window.dispatchEvent(new Event('cart:changed'))
      router.refresh()
      setOpen(true)
    })
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] shadow-lg z-50 md:hidden transition-transform duration-300 ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex flex-row items-center gap-2 p-4">
        {/* Quantity selector */}
        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden h-[44px] shrink-0">
          <button
            onClick={handleDecrease}
            disabled={pending}
            className="px-3 text-lg font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Mennyiség csökkentése"
          >
            -
          </button>
          <div className="w-8 text-center font-medium" aria-live="polite">{quantity}</div>
          <button
            onClick={handleIncrease}
            disabled={pending}
            className="px-3 text-lg font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Mennyiség növelése"
          >
            +
          </button>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAdd}
          disabled={pending}
          className="flex flex-nowrap group items-center justify-center gap-2 px-4 h-[44px] rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] transition-all cursor-pointer w-full disabled:opacity-60"
          aria-label="Kosárba"
        >
          <TbShoppingCart className="w-5 h-5 text-white" />
          <ButtonText classname="text-white group-hover:text-white">
            {pending ? 'Hozzáadás…' : 'Kosárba'}
          </ButtonText>
        </button>
      </div>
    </div>
  )
}
