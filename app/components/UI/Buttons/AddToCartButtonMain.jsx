'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import ButtonText from '../Texts/ButtonText'
import { TbShoppingCart } from 'react-icons/tb'
import { addToCart } from '@/app/_actions/cart'
import { useCartUI } from '@/app/components/cart/CartUIProvider'

export default function AddToCartButtonMain({ productId, defaultQty = 1, product, onAdded }) {

  const [quantity, setQuantity] = useState(defaultQty)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const { setOpen } = useCartUI()

  const handleDecrease = () => setQuantity(q => Math.max(1, q - 1))
  const handleIncrease = () => setQuantity(q => q + 1)

  const handleAdd = () => {
    if (!productId) return
    startTransition(async () => {
      await addToCart(productId, quantity)
      // opcionális: itt használhatod a 'product' propot analytics eseményhez
      window.dispatchEvent(new Event('cart:changed'))
      router.refresh()
      setOpen(true)
      onAdded?.({ productId, quantity, product })
    })
  }

  return (
    <div className="flex flex-row items-start gap-4">
      <button
        onClick={handleAdd}
        disabled={pending}
        className="flex flex-nowrap group items-center justify-center gap-2 md:px-7 px-3 h-[44px] rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] transition-all cursor-pointer z-10 w-full disabled:opacity-60"
        aria-label="Kosárba"
      >
        <TbShoppingCart className="w-6 h-6 text-white" />
        <ButtonText classname="text-white group-hover:text-white">
          {pending ? 'Hozzáadás…' : 'Kosárba'}
        </ButtonText>
      </button>

      <div className="flex items-center border border-gray-300 rounded-full overflow-hidden h-[44px]">
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
    </div>
  )
}
