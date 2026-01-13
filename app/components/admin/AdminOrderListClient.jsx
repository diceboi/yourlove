'use client'

import { useEffect, useState } from 'react'
import AdminOrderList from './AdminOrderList'
import { createClient } from '@/utils/supabase/client'

export default function AdminOrderListClient() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          loyalty_points_transactions(
            points_spent
          )
        `)
        .order("created_at", { ascending: false });

      // Aggregate points_spent for each order
      const ordersWithPoints = data?.map(order => ({
        ...order,
        points_redeemed: order.loyalty_points_transactions?.reduce((sum, t) => sum + (t.points_spent || 0), 0) || 0
      })) || []

      setOrders(ordersWithPoints)
      setLoading(false)
    }

    fetchOrders()
  }, [])

  return <AdminOrderList orders={orders} loading={loading} />
}
