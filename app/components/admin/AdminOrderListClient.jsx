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
      const { data, error } = await supabase.from('orders').select('*').order("created_at", { ascending: false });
      if (data) setOrders(data)
      setLoading(false)
    }

    fetchOrders()
  }, [])

  return <AdminOrderList orders={orders} loading={loading} />
}
