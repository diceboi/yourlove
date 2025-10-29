'use client'
import Image from 'next/image'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateQty, removeItem } from '@/app/_actions/cart'
import ProductPriceTextSmall from '../UI/Texts/ProductPriceTextSmall'
import ProductPriceText from '../UI/Texts/ProductPriceText'
import ButtonText from '../UI/Texts/ButtonText'
import Label from '../UI/Texts/Label'
import {TbX} from 'react-icons/tb'

export default function CartItemRow({ item }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  const name = [item?.product?.fo_cim, item?.product?.alcim].filter(Boolean).join(' ') || 'Termék'
  const img = item?.product?.termekkep || null
  const unitPrice = item.unit_price || 0
  const totalPrice = unitPrice * (item.qty || 1)

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
        <Image src={img} alt={name} width={64} height={64} className="rounded-md object-cover w-16 h-16" />
      ) : (
        <Image src={"/default.png"} alt={name} width={64} height={64} className="rounded-md object-cover w-16 h-16" />
      )}
      <div className="flex-1">
        <div className='flex items-start'>
          <div className="font-medium">{name}</div>
          <button disabled={pending} onClick={del} className="cursor-pointer p-2 hover:bg-[var(--grey-bg)] rounded-full ml-auto"><TbX className='text-[var(--error)]'/></button>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button disabled={pending} onClick={dec} className="px-3 py-1 rounded-full bg-[var(--green)] text-white">-</button>
          <span className="w-8 text-center">{item.qty}</span>
          <button disabled={pending} onClick={inc} className="px-3 py-1 rounded-full bg-[var(--green)] text-white">+</button>
          <div className="text-sm ml-auto min-w-fit">
            <Label> {item.qty} × {unitPrice.toLocaleString('hu-HU')} Ft {' '} </Label>
            <ButtonText classname={"font-semibold"}>{totalPrice.toLocaleString('hu-HU')} Ft</ButtonText>
          </div>
        </div>
      </div>
    </div>
  )
}
