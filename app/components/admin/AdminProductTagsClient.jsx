'use client'

import { useEffect, useState } from 'react'
import AdminProductTagsList from '@/app/components/admin/AdminProductTagsList'
import { createClient } from '@/utils/supabase/client'

export default function AdminProductTagsClient() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('product-tags').select('*')
      if (data) setTags(data)
      setLoading(false)
    }

    fetchProducts()
  }, [])

  return <AdminProductTagsList tags={tags} loading={loading} />
}
