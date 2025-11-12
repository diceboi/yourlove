import { getCartWithItemsRSC } from '@/app/lib/cart-read'
import Image from 'next/image'
import { TbArrowDown } from "react-icons/tb"

export default async function Summary() {
  const { items } = await getCartWithItemsRSC()
  const total = (items || []).reduce(
    (s, it) => s + (it.unit_price_huf || 0) * (it.qty || 0),
    0
  )
  const itemCount = items?.reduce((s, it) => s + (it.qty || 0), 0) || 0

  return (
    <div className="rounded-2xl lg:w-1/3 w-full bg-[var(--grey-bg)] lg:p-3 p-0">
      <h2 className="text-lg font-semibold mb-3 hidden lg:block text-[var(--pink)]">
        Rendelés összegzés
      </h2>

      {/* Mobilon: <details> / <summary> — nincs JS, SSR barát */}
      <details
        className="lg:hidden border border-[var(--border)] rounded-2xl overflow-hidden"
        open
      >
        <summary className="flex justify-between items-center px-4 py-3 bg-gray-50 cursor-pointer list-none">
          <div className="flex flex-col text-left">
            <span className="font-medium text-[15px] text-[var(--pink)]">Rendelés összegzés</span>
            <span className="text-xs text-gray-600">
              {itemCount} termék – <strong>{total.toLocaleString('hu-HU')} Ft</strong>
            </span>
          </div>
          <TbArrowDown/>
        </summary>

        <div className="p-4 border-t border-[var(--border)] bg-white">
          {items?.length ? (
            <>
              <ul className="divide-y">
                {items.map((it) => {
                  const name =
                    [it?.product?.fo_cim, it?.product?.alcim]
                      .filter(Boolean)
                      .join(' ') || 'Termék'
                  const img = it?.product?.termekkep || null
                  return (
                    <li key={it.id} className="py-3 flex gap-3">
                      {img ? (
                        <Image
                          src={img}
                          alt={name}
                          width={56}
                          height={56}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-500">
                          Nincs kép
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{name}</div>
                        <div className="text-xs text-gray-600">
                          Mennyiség: {it.qty}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {(it.unit_price_huf * it.qty).toLocaleString('hu-HU')} Ft
                      </div>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">Végösszeg</div>
                <div className="text-lg font-semibold">
                  {total.toLocaleString('hu-HU')} Ft
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-600">A kosarad üres.</div>
          )}
        </div>
      </details>

      {/* Desktopon mindig nyitva marad */}
      <div className="hidden lg:block bg-[--border]">
        {!items?.length ? (
          <div className="text-sm text-gray-600">A kosarad üres.</div>
        ) : (
          <>
            <ul className="divide-y">
              {items.map((it) => {
                const name =
                  [it?.product?.fo_cim, it?.product?.alcim]
                    .filter(Boolean)
                    .join(' ') || 'Termék'
                const img = it?.product?.termekkep || null
                return (
                  <li key={it.id} className="py-3 flex gap-3">
                    {img ? (
                      <Image
                        src={img}
                        alt={name}
                        width={56}
                        height={56}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-500">
                        Nincs kép
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{name}</div>
                      <div className="text-xs text-gray-600">
                        Mennyiség: {it.qty}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {(it.unit_price_huf * it.qty).toLocaleString('hu-HU')} Ft
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Végösszeg</div>
              <div className="text-lg font-semibold">
                {total.toLocaleString('hu-HU')} Ft
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
