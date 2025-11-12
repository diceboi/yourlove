export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getCartWithItemsRSC } from '@/app/lib/cart-read'
import CartItemRow from '@/app/components/cart/CartItemRow'
import H2 from '@/app/components/UI/Texts/H2'
import PopularProducts from '@/app/components/PopularProducts'
import RecommendedProducts from '@/app/components/RecommendedProducts'
import MainCta from '@/app/components/MainCta'
import PrivateShipping from '@/app/components/PrivateShipping'

export default async function CartPage() {
  const { items } = await getCartWithItemsRSC()
  const total = (items || []).reduce((s, it) => s + (it.unit_price_huf || 0) * (it.qty || 0), 0)

  return (
    <>
    <div className="flex flex-col gap-8 w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <H2 className="text-2xl font-semibold mb-4">Kosár</H2>

      <div className='flex lg:flex-row flex-col gap-8'>
        {!items?.length ? (
          <div className="p-6 border border-[var(--border)] rounded-2xl text-gray-600 w-full">
            A kosarad üres.
            <div className="mt-3">
              <Link href="/termekek" className="text-[var(--pink)] hover:underline">Vásárlás folytatása</Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-[var(--border)] bg-white border border-[var(--border)] rounded-2xl lg:w-2/3 w-full h-fit">
              {items.map((it) => (
                <li key={it.id} className="p-4">
                  <CartItemRow item={it} />
                </li>
              ))}
            </ul>

            <div className="flex flex-col items-center gap-4 lg:w-1/3 w-full bg-[var(--grey-bg)] p-2 rounded-2xl h-fit">
              <div className="flex flex-row justify-between text-sm w-full">
                <span className="text-gray-600 mr-2">Felhasznált hűségpontok:</span>
                <span className="font-semibold">0 Ft</span>
              </div>
              <div className="flex flex-row justify-between text-lg w-full border-b border-[var(--border)]">
                <span className="text-gray-600 mr-2">Bruttó végösszeg:</span>
                <span className="font-semibold">{total.toLocaleString('hu-HU')} Ft</span>
              </div>
              <Link
                href="/penztar"
                className="px-5 py-3 rounded-full bg-[var(--pink)] text-white hover:opacity-90"
              >
                Tovább a pénztárhoz
              </Link>
              <div className="text-xs text-center w-full">
                <span className="text-gray-600 mr-2">A kupon és hűségpont kedvezmények beváltására a pénztárban van lehetőség.</span>
              </div>
            </div>
            </>
            )}
      </div>
    </div>
    <div className='py-16 px-4 xl:px-12 '>
      <PrivateShipping />
    </div>
    <div className='py-16 px-4 xl:px-12 bg-[var(--grey-bg)]'>
      <RecommendedProducts />
    </div>
    <div className='py-16 px-4 xl:px-12 '>
      <MainCta />
    </div>
    </>
  )
}
