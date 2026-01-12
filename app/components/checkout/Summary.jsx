import { getCartWithItemsRSC } from '@/app/lib/cart-read'
import Image from 'next/image'
import { TbArrowDown } from "react-icons/tb"
import SummaryClient from './SummaryClient'

export default async function Summary() {
  const { items } = await getCartWithItemsRSC()
  const total = (items || []).reduce(
    (s, it) => s + (it.unit_price_huf || 0) * (it.qty || 0),
    0
  )
  const itemCount = items?.reduce((s, it) => s + (it.qty || 0), 0) || 0

  return (
    <SummaryClient items={items} total={total} itemCount={itemCount} />
  )
}

export const dynamic = 'force-dynamic'
