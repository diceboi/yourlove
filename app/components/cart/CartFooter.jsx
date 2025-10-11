export const dynamic = 'force-dynamic'
import { getCartWithItemsRSC } from '@/app/lib/cart-read'
import PinkButton from '../UI/Buttons/PinkButton'
import GreenButton from '../UI/Buttons/GreenButton'

export default async function CartFooter() {
  const { items } = await getCartWithItemsRSC()
  const total = (items || []).reduce((s, it) => s + (it.unit_price || 0) * (it.qty || 0), 0)

  return (
    <div className='flex flex-col gap-2'>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Végösszeg</div>
        <div className="text-lg font-semibold text-[var(--pink)]">{total.toLocaleString('hu-HU')} Ft</div>
      </div>
      <div className='flex flex-nowrap gap-2'>
        <GreenButton
          title={"Kosár"}
          link={"/kosar"}
          class
        />
        <PinkButton
          title={"Tovább a pénztárba"}
          link={"/penztar"}
        />
      </div>
    </div>
  )
}
