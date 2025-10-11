export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getCartWithItemsRSC } from '@/app/lib/cart-read'
import CartItemRow from '@/app/components/cart/CartItemRow'

export default async function CartPage() {
  const { items } = await getCartWithItemsRSC()
  const total = (items || []).reduce((s, it) => s + (it.unit_price || 0) * (it.qty || 0), 0)

  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <h1 className="text-2xl font-semibold mb-4">Kosár</h1>

      {!items?.length ? (
        <div className="p-6 border border-[var(--border)] rounded-lg text-gray-600">
          A kosarad üres.
          <div className="mt-3">
            <Link href="/termekek" className="text-[var(--pink)] hover:underline">Vásárlás folytatása</Link>
          </div>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-[var(--border)] bg-white border border-[var(--border)] rounded-lg">
            {items.map((it) => (
              <li key={it.id} className="p-4">
                <CartItemRow item={it} />
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-end gap-4">
            <div className="text-lg">
              <span className="text-gray-600 mr-2">Végösszeg:</span>
              <span className="font-semibold">{total.toLocaleString('hu-HU')} Ft</span>
            </div>
            <Link
              href="/penztar"
              className="px-5 py-3 rounded-full bg-[var(--pink)] text-white hover:opacity-90"
            >
              Tovább a pénztárhoz
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
