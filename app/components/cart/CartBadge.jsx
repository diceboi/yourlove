// app/components/cart/CartBadge.js
export const dynamic = 'force-dynamic' // mindig frissüljön
import { getCartWithItemsRSC } from '@/app/lib/cart-read'

export default async function CartBadge() {
  const { items } = await getCartWithItemsRSC()
  const count = (items || []).reduce((sum, it) => sum + (it.qty || 0), 0)

  if (!count) return null

  const label = count > 99 ? '99+' : String(count)

  return (
    <span
      className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1
                 rounded-full bg-[var(--pink)] text-white text-[11px]
                 font-semibold flex items-center justify-center shadow"
      aria-label={`Kosárban ${count} tétel`}
    >
      {label}
    </span>
  )
}
