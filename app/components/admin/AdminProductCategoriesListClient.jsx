'use client'

import { useEffect, useState } from 'react'
import AdminProductCategoriesList from '@/app/components/admin/AdminProductCategoriesList'
import { createClient } from '@/utils/supabase/client'

export default function AdminProductCategoriesListClient() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchProductCategories() {
      const { data, error } = await supabase.from('product-categories').select('*')
      if (data) setCategories(data)
      setLoading(false)
    }

    fetchProductCategories()
  }, [])

  return <AdminProductCategoriesList categories={categories} loading={loading} />
}
