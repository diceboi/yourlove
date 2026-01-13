import { getCartWithItemsRSC } from '@/app/lib/cart-read'
import Image from 'next/image'
import { TbArrowDown } from "react-icons/tb"
import SummaryClient from './SummaryClient'
import { calculatePointsForOrder, getUserPoints } from '@/app/_actions/loyalty-points'
import { createClient } from '@/utils/supabase/server'

export default async function Summary() {
  const { items } = await getCartWithItemsRSC()
  const total = (items || []).reduce(
    (s, it) => s + (it.unit_price_huf || 0) * (it.qty || 0),
    0
  )
  const itemCount = items?.reduce((s, it) => s + (it.qty || 0), 0) || 0

  // Get current user's points and calculate points to earn
  let currentPoints = 0
  let pointsToEarn = 0

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const pointsResult = await getUserPoints(user.id)
      console.log('Points result:', pointsResult)
      if (pointsResult.ok) {
        currentPoints = pointsResult.points || 0
      }

      const calculatedPoints = await calculatePointsForOrder(total)
      console.log('Calculated points:', calculatedPoints)
      if (calculatedPoints.ok) {
        pointsToEarn = calculatedPoints.points || 0
      }
    } else {
      console.log('No user found in Summary')
    }
  } catch (error) {
    console.error('Error fetching points in Summary:', error)
    // Continue rendering without points - don't break checkout
  }

  console.log('Summary - currentPoints:', currentPoints, 'pointsToEarn:', pointsToEarn)

  return (
    <SummaryClient
      items={items}
      total={total}
      itemCount={itemCount}
      currentPoints={currentPoints}
      pointsToEarn={pointsToEarn}
    />
  )
}

export const dynamic = 'force-dynamic'
