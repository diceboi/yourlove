export const dynamic = 'force-dynamic'
import { getCartWithItemsRSC } from '@/app/lib/cart-read'

export default async function CartFooter() {
  const { items } = await getCartWithItemsRSC()
  const total = (items || []).reduce((s, it) => s + (it.unit_price || 0) * (it.qty || 0), 0)

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">Végösszeg</div>
      <div className="text-lg font-semibold">{total.toLocaleString('hu-HU')} Ft</div>
    </div>
  )
}
