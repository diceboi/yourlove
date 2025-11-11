'use client'
import { useCartUI } from './CartUIProvider'
import PinkButton from '../UI/Buttons/PinkButton'
import GreenButton from '../UI/Buttons/GreenButton'
import { useRouter } from 'next/navigation'

export default function CartFooterClient({ total }) {
  const { setOpen } = useCartUI()
  const router = useRouter()


  const handleClickCart = () => {setOpen(false), router.push('/kosar')}
  const handleClickCheckout = () => {setOpen(false), router.push('/penztar')}

  return (
    <div className='flex flex-col gap-2'>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Végösszeg</div>
        <div className="text-lg font-semibold text-[var(--pink)]">
          {total.toLocaleString('hu-HU')} Ft
        </div>
      </div>

      <div className='flex flex-nowrap gap-2'>
        <GreenButton
          title="Kosár"
          onclick={handleClickCart}
        />
        <PinkButton
          title="Tovább a pénztárba"
          onclick={handleClickCheckout}
        />
      </div>
    </div>
  )
}
