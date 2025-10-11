export const dynamic = 'force-dynamic'
import { getCartWithItemsRSC } from '@/app/lib/cart-read'
import CartItemRow from './CartItemRow'

export default async function CartContent() {
  const { cart, items, debug } = await getCartWithItemsRSC()

  // DEBUG – töröld, ha kész
  // console.log('CartContent debug:', debug, 'cart:', cart?.id, 'items:', items?.length)

  if (!items?.length) {
    return (
      <div className="p-4 text-sm text-gray-600">
        A kosarad üres.
        {/* DEBUG BLOKK – töröld később */}
        <pre className="mt-2 text-xs text-gray-500 whitespace-pre-wrap">
          token: {debug?.token || '-'}{'\n'}
          cartId: {cart?.id || '-'}{'\n'}
          count: {debug?.count ?? 0}{'\n'}
          steps: {JSON.stringify(debug?.steps || [])}
        </pre>
      </div>
    )
  }

  return (
    <ul className="border-t border-[var(--border)]">
      {items.map(it => (
        <li key={it.id} className="p-4 border-b border-[var(--border)]">
          <CartItemRow item={it} />
        </li>
      ))}
    </ul>
  )
}
