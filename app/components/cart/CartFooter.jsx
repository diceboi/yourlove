import { getCartWithItemsRSC } from '@/app/lib/cart-read'
import CartFooterClient from './CartFooterClient'

export const dynamic = 'force-dynamic'

export default async function CartFooter() {
  const { items } = await getCartWithItemsRSC()
  const total = (items || []).reduce(
    (s, it) => s + (it.unit_price_huf || 0) * (it.qty || 0),
    0
  )

  return <CartFooterClient total={total} />
}
