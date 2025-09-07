'use client'

import { useEffect, useState } from 'react'
import AdminBlogCategoriesList from '@/app/components/admin/AdminBlogCategoriesList'
import { createClient } from '@/utils/supabase/client'

export default function AdminBlogCategoriesListClient() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchProductCategories() {
      const { data, error } = await supabase.from('blog-categories').select('*')
      if (data) setCategories(data)
      setLoading(false)
    }

    fetchProductCategories()
  }, [])

  return <AdminBlogCategoriesList categories={categories} loading={loading} />
}
