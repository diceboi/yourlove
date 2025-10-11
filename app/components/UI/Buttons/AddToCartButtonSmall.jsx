'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import ButtonText from '../Texts/ButtonText'
import { TbShoppingCart } from 'react-icons/tb'
import { addToCart } from '@/app/_actions/cart'
import { useCartUI } from '@/app/components/cart/CartUIProvider'

export default function AddToCartButtonSmall({ productId, defaultQty = 1, product, onAdded }) {

  const [quantity, setQuantity] = useState(defaultQty)
  const [pending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const { setOpen } = useCartUI()

  const handleDecrease = () => setQuantity(q => Math.max(1, q - 1))
  const handleIncrease = () => setQuantity(q => q + 1)

  const handleAdd = () => {
    if (!productId) {
      setErrorMsg('Hiányzik a productId')
      return
    }
    startTransition(async () => {
      setErrorMsg('')
      const res = await addToCart(productId, quantity)
      if (!res?.ok) {
        setErrorMsg(res?.message || 'Hiba történt hozzáadáskor')
        return
      }
      window.dispatchEvent(new Event('cart:changed'))
      router.refresh()
      setOpen(true)
      onAdded?.({ productId, quantity, product })
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-start gap-4">
        <button
          onClick={handleAdd}
          disabled={pending}
          className="flex flex-nowrap group items-center justify-center gap-2 md:px-7 px-3 h-[44px] rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] transition-all cursor-pointer z-10 disabled:opacity-60"
          aria-label="Kosárba"
        >
          <TbShoppingCart className="xl:w-6 w-5 xl:h-6 h-5 text-white" />
          <ButtonText classname=" xl:block hidden text-white group-hover:text-white">
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

      {errorMsg ? (
        <div className="text-sm text-red-600">{errorMsg}</div>
      ) : null}
    </div>
  )
}
