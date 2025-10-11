'use client'
import Image from 'next/image'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateQty, removeItem } from '@/app/_actions/cart'

export default function CartItemRow({ item }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  const name = [item?.product?.fo_cim, item?.product?.alcim].filter(Boolean).join(' ') || 'Termék'
  const img = item?.product?.termekkep || null

  const inc = () => start(async () => { 
    await updateQty(item.id, item.qty + 1)
    window.dispatchEvent(new Event('cart:changed'))
    router.refresh() 
  })

  const dec = () => start(async () => {
    await updateQty(item.id, item.qty - 1)
    window.dispatchEvent(new Event('cart:changed'))
    router.refresh() 
  })
  const del = () => start(async () => {
    await removeItem(item.id)
    window.dispatchEvent(new Event('cart:changed'))
    router.refresh()
  })

  return (
    <div className="flex gap-3">
      {img ? (
        <Image src={img} alt={name} width={64} height={64} className="rounded-md object-cover" />
      ) : (
        <Image src={"/default.png"} alt={name} width={64} height={64} className="rounded-md object-cover" />
      )}
      <div className="flex-1">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-gray-500">{(item.unit_price || 0).toLocaleString('hu-HU')} Ft</div>
        <div className="mt-2 flex items-center gap-2">
          <button disabled={pending} onClick={dec} className="px-3 py-1 rounded-full bg-[var(--green)]">-</button>
          <span className="w-8 text-center">{item.qty}</span>
          <button disabled={pending} onClick={inc} className="px-3 py-1 rounded-full bg-[var(--green)]">+</button>
          <button disabled={pending} onClick={del} className="ml-auto text-sm text-[var(--error)] hover:underline">Eltávolítás</button>
        </div>
      </div>
    </div>
  )
}
