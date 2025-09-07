'use client'

import { useEffect, useState } from 'react'
import AdminBlogTagsList from '@/app/components/admin/AdminBlogTagsList'
import { createClient } from '@/utils/supabase/client'

export default function AdminBlogTagsListClient() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('blog-tags').select('*')
      if (data) setTags(data)
      setLoading(false)
    }

    fetchProducts()
  }, [])

  return <AdminBlogTagsList tags={tags} loading={loading} />
}
