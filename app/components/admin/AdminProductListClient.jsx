'use client'

import { useEffect, useState } from 'react'
import AdminOrderList from './AdminOrderList'
import { createClient } from '@/utils/supabase/client'

export default function AdminProductListClient() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*')
      if (data) setProducts(data)
      setLoading(false)
    }

    fetchProducts()
  }, [])

  return <AdminOrderList products={products} loading={loading} />
}
