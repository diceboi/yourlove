'use client'

import { useEffect, useState } from 'react'
import AdminBlogList from '@/app/components/admin/AdminBlogList'
import { createClient } from '@/utils/supabase/client'

export default function AdminBlogListClient() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('blogs').select('*')
      if (data) setBlogs(data)
      setLoading(false)
    }

    fetchProducts()
  }, [])

  return <AdminBlogList blogs={blogs} loading={loading} />
}
