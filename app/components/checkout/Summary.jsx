import { getCartWithItemsRSC } from '@/app/lib/cart-read'
import Image from 'next/image'

export default async function Summary() {
  const { items } = await getCartWithItemsRSC()
  const total = (items || []).reduce((s, it) => s + (it.unit_price || 0) * (it.qty || 0), 0)

  return (
    <div className="rounded-lg p-4 border border-[var(--border)]">
      <h2 className="text-lg font-semibold mb-3">Rendelés összegzés</h2>
      {!items?.length ? (
        <div className="text-sm text-gray-600">A kosarad üres.</div>
      ) : (
        <>
          <ul className="divide-y">
            {items.map((it) => {
              const name = [it?.product?.fo_cim, it?.product?.alcim].filter(Boolean).join(' ') || 'Termék'
              const img = it?.product?.termekkep || null
              return (
                <li key={it.id} className="py-3 flex gap-3">
                  {img ? (
                    <Image src={img} alt={name} width={56} height={56} className="rounded object-cover"/>
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-500">Nincs kép</div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{name}</div>
                    <div className="text-xs text-gray-600">Mennyiség: {it.qty}</div>
                  </div>
                  <div className="text-sm font-medium">{(it.unit_price * it.qty).toLocaleString('hu-HU')} Ft</div>
                </li>
              )
            })}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Végösszeg</div>
            <div className="text-lg font-semibold">{total.toLocaleString('hu-HU')} Ft</div>
          </div>
        </>
      )}
    </div>
  )
}
