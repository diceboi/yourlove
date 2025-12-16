"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import AdminCustomPagesList from "./AdminCustomPagesList"

export default function AdminCustomPageListClient() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchPages() {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setPages(data)
      setLoading(false)
    }

    fetchPages()

    // Listen for custom events when pages change
    const handlePagesChanged = () => {
      fetchPages()
    }

    window.addEventListener('admin:custom_pages:changed', handlePagesChanged)
    return () => {
      window.removeEventListener('admin:custom_pages:changed', handlePagesChanged)
    }
  }, [])

  return <AdminCustomPagesList pages={pages} loading={loading} />
}
